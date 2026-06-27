import pLimit from "p-limit";
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

  get_communications = async (
    profileID: string,
    offset: number,
    limit: number,
  ) => {
    if (!profileID) {
      throw new Error("Profile ID is required");
    }
    return await this.communicationRepository.get_communications(
      profileID,
      offset,
      limit,
    );
  };

  async fetchGmailCandidates(profileID: string, parsed: any) {
    const integration =
      await this.integrationRepository.get_active_gmail_integration(profileID);

    if (!integration) return [];

    const gmailClient = await this.googleOAuthService.create_gmail_client({
      profileID: integration.profileID,
      accessToken: integration.accessToken,
      refreshToken: integration.refreshToken,
    });

    // Build query dynamically from parsed keywords
    const q = parsed.keywords?.join(" ") || "";

    const res = await gmailClient.users.messages.list({
      userId: "me",
      maxResults: 20,
      q, // 👈 IMPORTANT: Gmail native semantic-ish filtering
    });

    const messages = res.data.messages ?? [];

    const fullMessages = await Promise.all(
      messages.map(async (msg) => {
        if (!msg.id) return null;

        const full = await gmailClient.users.messages.get({
          userId: "me",
          id: msg.id,
        });

        const payload = full.data.payload;
        const headers = payload?.headers || [];

        const subject = headers.find((h) => h.name === "Subject")?.value || "";

        return {
          id: msg.id,
          platform: "gmail",
          content: this.extractEmailBody(payload),
          sender: headers.find((h) => h.name === "From")?.value || "",
          timestamp: Number(full.data.internalDate) || Date.now(),
          subject,
        };
      }),
    );

    return fullMessages.filter(Boolean);
  }

  fetch_emails = async (profile_id: string, maxResults = 10) => {
    if (!profile_id) {
      throw new Error("Profile ID is required");
    }

    const integration =
      await this.integrationRepository.get_active_gmail_integration(profile_id);

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
    const integration =
      await this.integrationRepository.get_active_gmail_integration(profile_id);

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

    console.log(
      `(Communication Service) Setting integration ${integration.id} status to SYNCING`,
    );

    if (!integration.gmailHistoryId) {
      console.log(
        `(Communication Service) Starting initial sync for integration ${integration.id}`,
      );
      await this.initial_gmail_sync(integration);
    } else {
      console.log(
        `(Communication Service) Starting incremental sync for integration ${integration.id}`,
      );
      await this.incremental_gmail_sync(integration);
    }
    status = "SUCCESS";
    await this.integrationRepository.update_integration(integration.id, {
      syncStatus: status,
      lastSyncedAt: new Date(),
    });
    console.log(
      `(Communication Service) Setting integration ${integration.id} status to SUCCESS`,
    );
  };

  initial_gmail_sync = async (integration: any) => {
    const MAX_INITIAL_SYNC_MESSAGES = parseInt(
      process.env.EMAIL_INITIAL_SYNC_LIMIT || "1000",
    ); // Safety cap to prevent syncing too many emails at once
    const limit = pLimit(5); // Limit concurrency to 5

    const gmailClient = await this.googleOAuthService.create_gmail_client({
      profileID: integration.profileID,
      accessToken: integration.accessToken,
      refreshToken: integration.refreshToken,
    });

    let pageToken: string | undefined;
    let latestHistoryId: string | undefined;

    let totalMessages = 0;

    console.time(`Processing message batch for integration ${integration.id}`);
    do {
      const res = await gmailClient.users.messages.list({
        userId: "me",
        maxResults: 50,
        pageToken,
      });

      const messages = res.data.messages ?? [];
      totalMessages += messages.length;

      await Promise.all(
        messages.map((msg) => {
          if (!msg.id) return Promise.resolve();

          console.time(`Scheduling message ${msg.id} for processing`);
          return limit(() =>
            this.process_gmail_message(gmailClient, integration, msg.id!).then(
              (result) => {
                if (result?.historyId) {
                  latestHistoryId = result.historyId;
                }
              },
            ),
          );
        }),
      );

      pageToken = res.data.nextPageToken;
    } while (pageToken && totalMessages <= MAX_INITIAL_SYNC_MESSAGES);

    console.timeEnd(
      `Processing message batch for integration ${integration.id}`,
    );
    console.log(
      `(Communication Service) Initial Gmail sync completed for integration ${integration.id}. Total messages processed: ${totalMessages}. Latest history ID: ${latestHistoryId}`,
    );
    if (latestHistoryId) {
      await this.integrationRepository.update_integration(integration.id, {
        gmailHistoryId: latestHistoryId,
      });
    }
  };

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

      let total_added_messages = 0;

      const history = res.data.history ?? [];

      let newHistoryId = startHistoryId;

      console.time(
        `Processing message batch for integration ${integration.id}`,
      );
      for (const record of history) {
        if (record.id) {
          newHistoryId = record.id;
        }

        if (!record.messagesAdded) continue;
        total_added_messages += record.messagesAdded.length;

        await Promise.all(
          record.messagesAdded.map((msg) => {
            if (!msg.message?.id) return Promise.resolve();

            return this.process_gmail_message(
              gmailClient,
              integration,
              msg.message.id!,
            );
          }),
        );

        if (record.id) {
          newHistoryId = record.id;
        }
      }

      console.timeEnd(
        `Processing message batch for integration ${integration.id}`,
      );
      console.log(
        `(Communication Service) Incremental Gmail sync completed for integration ${integration.id}. Total added messages: ${total_added_messages}. New history ID: ${newHistoryId}`,
      );

      await this.integrationRepository.update_integration(integration.id, {
        gmailHistoryId: newHistoryId,
      });
    } catch (error: any) {
      if (error.code === 404 || error.message?.includes("historyId")) {
        return await this.initial_gmail_sync(integration);
      }
      throw error;
    }
  };

  process_gmail_message = async (
    gmailClient: any,
    integration: any,
    messageId: string,
  ) => {
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
      await this.communicationRepository.replace_chunks(communication.id, []);
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
