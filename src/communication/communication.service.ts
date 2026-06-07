import type { ChunkingService } from "../chunking/chunking.service.js";
import GoogleOAuthService from "../integration/google-oauth.service.js";
import IntegrationService from "../integration/integration.service.js";
import { buildSanitizedEmail } from "./communication-email-sanitizer.js";
import { communicationQueue } from "../message_broker/communication.queue.js";
import type CommunicationRepository from "./communication.repository.js";
import type IntegrationRepository from "../integration/integration.repository.js";
import type { SyncStatus } from "@prisma/client";

type GmailIntegration = {
  id: string;
  profileID: string;
  accessToken: string | null;
  refreshToken: string | null;
};

class CommunicationService {
  constructor(
    private integrationService: IntegrationService,
    private googleOAuthService: GoogleOAuthService,
    private communicationRepository: CommunicationRepository,
    private chunkingService: ChunkingService,
    private integrationRepository: IntegrationRepository,
  ) {
    this.integrationService = integrationService;
    this.googleOAuthService = googleOAuthService;
    this.communicationRepository = communicationRepository;
    this.chunkingService = chunkingService;
  }

  fetch_emails = async (profile_id: string, maxResults = 10) => {
    if (!profile_id) {
      throw new Error("Profile ID is required");
    }

    const integration = await this.integrationRepository.get_active_gmail_integration(profile_id);

    if (!integration) {
      throw new Error("Gmail integration not found for the specified profile");
    }

    if (!integration.accessToken || !integration.refreshToken) {
      throw new Error("Gmail integration is missing access or refresh token");
    }

    let gmailClient = await this.googleOAuthService.create_gmail_client({
      profileID: integration.profileID,
      accessToken: integration.accessToken,
      refreshToken: integration.refreshToken,
    });

    const listResponse = await gmailClient.users.messages.list({
      userId: "me",
      maxResults,
      labelIds: ["INBOX"],
    });

    const messages = listResponse.data.messages ?? [];

    const emails = await Promise.all(
      messages.map(async (message) => {
        if (!message.id) {
          return null;
        }

        const detailResponse = await gmailClient.users.messages.get({
          userId: "me",
          id: message.id,
          format: "full",
        });

        const sanitizedEmail = buildSanitizedEmail({
          id: detailResponse.data.id ?? undefined,
          threadId: detailResponse.data.threadId ?? undefined,
          snippet: detailResponse.data.snippet ?? undefined,
          labelIds: detailResponse.data.labelIds ?? undefined,
          internalDate: detailResponse.data.internalDate ?? undefined,
          payload: detailResponse.data.payload ?? undefined,
        });

        // Save the email to the database and process it for chunking
        const communication = await this.communicationRepository.save_email(
          integration.profileID,
          integration.id,
          sanitizedEmail,
        );

        if (sanitizedEmail.indexable === false) {
          // Keep the communication record, but remove any previous chunks/embeddings
          // so this low-value message is not part of semantic search.
          await this.communicationRepository.replace_chunks(
            communication.id,
            [],
          );
          return sanitizedEmail;
        }

        // Process the communication to create chunks
        // await this.chunkingService.processCommunication(communication.id);
        // explain the syntax
        await communicationQueue.add("chunk-communication", {
          communicationID: communication.id,
        });

        return sanitizedEmail;
      }),
    );

    return emails.filter(Boolean);
  };


  sync_gmail = async (profile_id: string) => {
    const integration = await this.integrationRepository.get_active_gmail_integration(profile_id);

    if (!integration) {
      throw new Error("Gmail integration not found for the specified profile");
    }

    if (!integration.accessToken || !integration.refreshToken) {
      throw new Error("Gmail integration is missing access or refresh token");
    }

    let status: SyncStatus = "SYNCING";

    await this.integrationRepository.update_integration(integration.id, {
      syncStatus: status,
    });

    if(!integration.gmailHistoryId) {
      await this.initial_gmail_sync(integration);
    } else {
      await this.incremental_gmail_sync(integration);
    }
    status = "SUCCESS";
    await this.integrationRepository.update_integration(integration.id, {
      syncStatus: status,
      lastSyncedAt: new Date(),
    });
  }

  initial_gmail_sync = async (integration: any) => {
    const gmailClient = await this.googleOAuthService.create_gmail_client({
      profileID: integration.profileID,
      accessToken: integration.accessToken,
      refreshToken: integration.refreshToken,
    });

    let pageToken: string | undefined;
    let latestHistoryId: string | undefined;

    do {
      const res = await gmailClient.users.messages.list({
        userId: "me",
        maxResults: 50,
        pageToken,
      });

      const messages = res.data.messages ?? [];

      for (const msg of messages) {
        if (!msg.id) continue;

        const result = await this.process_gmail_message(
          gmailClient,
          integration,
          msg.id,
        );

        if (result?.historyId) {
          latestHistoryId = result.historyId;
        }
      }

      pageToken = res.data.nextPageToken;
    } while (pageToken);

    if (latestHistoryId) {
      await this.integrationRepository.update_integration(integration.id, {
        gmailHistoryId: latestHistoryId,
      });
    }
  }

  incremental_gmail_sync = async (integration: any) => {
    const gmailClient = await this.googleOAuthService.create_gmail_client({
      profileID: integration.profileID,
      accessToken: integration.accessToken,
      refreshToken: integration.refreshToken,
    });

    const startHistoryId = integration.gmailHistoryId;

    if (!startHistoryId) {
      return await this.initial_gmail_sync(integration);
    }

    try {
      const res = await gmailClient.users.history.list({
        userId: "me",
        startHistoryId,
        historyTypes: ["messageAdded"],
      });

      const history = res.data.history ?? [];

      let newHistoryId = startHistoryId;

      for (const record of history) {
        if(record.id) {
          newHistoryId = record.id;
        }

        if(!record.messagesAdded) continue;

        for (const msg of record.messagesAdded) {
          if (!msg.message?.id) continue;

          await this.process_gmail_message(
            gmailClient,
            integration,
            msg.message.id,
          );
        }

        if (record.id) {
          newHistoryId = record.id;
        }
      }

      await this.integrationRepository.update_integration(integration.id, {
        gmailHistoryId: newHistoryId,
      });
    } catch (error: any) {
      if(error.code === 404 || error.message?.includes("historyId")) {
        return await this.initial_gmail_sync(integration);
      }
      throw error;
    }
  }

  process_gmail_message = async (gmailClient: any, integration: any, messageId: string) => {
    const detailResponse = await gmailClient.users.messages.get({
      userId: "me",
      id: messageId,
      format: "full",
    });

    const sanitizedEmail = buildSanitizedEmail({
      id: detailResponse.data.id ?? undefined,
      threadId: detailResponse.data.threadId ?? undefined,
      snippet: detailResponse.data.snippet ?? undefined,
      labelIds: detailResponse.data.labelIds ?? undefined,
      internalDate: detailResponse.data.internalDate ?? undefined,
      payload: detailResponse.data.payload ?? undefined,
    });

    // Save the email to the database and process it for chunking
    const communication = await this.communicationRepository.save_email(
      integration.profileID,
      integration.id,
      sanitizedEmail,
    );

    if (sanitizedEmail.indexable === false) {
      // Keep the communication record, but remove any previous chunks/embeddings
      // so this low-value message is not part of semantic search.
      await this.communicationRepository.replace_chunks(
        communication.id,
        [],
      );
      return sanitizedEmail;
    }

    // Process the communication to create chunks
    // await this.chunkingService.processCommunication(communication.id);
    await communicationQueue.add("chunk-communication", {
      communicationID: communication.id,
    });

    return {
      sanitizedEmail,
      historyId: detailResponse.data.historyId,
    };
  };
}

export default CommunicationService;
