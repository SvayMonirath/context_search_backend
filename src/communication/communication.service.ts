import pLimit from "p-limit";
import type { ChunkingService } from "../chunking/chunking.service.js";
import GoogleOAuthService from "../integration/google-oauth.service.js";
import IntegrationService from "../integration/integration.service.js";
import { buildSanitizedEmail } from "./communication-email-sanitizer.js";
import { communicationQueue } from "../message_broker/communication.queue.js";
import type CommunicationRepository from "./communication.repository.js";
import type IntegrationRepository from "../integration/integration.repository.js";
import { SyncStatus } from "@prisma/client";
import { MasterEncryptionService } from "../security/master-encryption.service.js";
import UserRepository from "../authentication/user.repository.js";
import { UserEncryptionFactory } from "../security/user-encryption.factory.js";


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
    private UserEncryptionService = new UserEncryptionFactory(
      new MasterEncryptionService(),
      new UserRepository()
    )
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
    userID: string
  ) => {
    if (!profileID) {
      throw new Error("Profile ID is required");
    }
    const {data, total} = await this.communicationRepository.get_communications(
      profileID,
      offset,
      limit,
    );

    const encryption = await this.UserEncryptionService.create(userID);

    const decryptedData = data.map((communication: any) => {
      const decryptedContent = encryption.decrypt(communication.content ?? "");
      const decryptedSender = encryption.decrypt(communication.sender ?? "");
      return { ...communication, content: decryptedContent, sender: decryptedSender };
    });

    return { data: decryptedData, total };
  };

  async fetchTelegramCandidates(profileID: string, parsed: any) {
    const integration =
      await this.integrationRepository.get_active_telegram_integration(
        profileID,
      );

    if (!integration) {
      console.log(`No active Telegram integration found for profileID: ${profileID}`);
      return []
    };

    console.log(`Fetching Telegram candidates for profileID: ${profileID} with integration ID: ${integration.id} and keywords: ${parsed.keywords.join(" ")}`,
    );
    const response = await fetch(
      `http://${process.env.PYTHON_BACKEND_HOST}:${process.env.PYTHON_BACKEND_PORT}/telegram/stateless-search`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          integration_id: integration.id,
          query: parsed.keywords.join(" "),
          chat_limit: 10,
        }),
      },
    );

    if (!response.ok) return [];

    const data = await response.json();

    console.log(`Received ${data.messages.length} messages from Telegram live search for profileID: ${profileID}`);

    return (data.messages || []).map((msg: any) => ({
      id: msg.message_id,
      platform: "telegram",
      content: msg.text,
      sender: msg.sender_name,
      timestamp: new Date(msg.date).getTime(),
    }));
  }

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

  sync_telegram = async (profile_id: string, userID: string) => {
      const integration =
        await this.integrationRepository.get_active_telegram_integration(
          profile_id,
        );

      if (!integration) {
        throw new Error("Telegram integration not found");
      }

      await this.integrationRepository.update_integration(integration.id, {
        syncStatus: SyncStatus.SYNCING,
      });

      const response = await fetch(
        `http://${process.env.PYTHON_BACKEND_HOST || "localhost"}:${process.env.PYTHON_BACKEND_PORT || "8001"}/telegram/sync-telegram`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            integration_id: integration.id,
            last_sync: integration.metadata || {},
            chat_limit: process.env.TELEGRAM_SYNC_CHAT_LIMIT
              ? parseInt(process.env.TELEGRAM_SYNC_CHAT_LIMIT)
              : 10,
          }),
        },
      );

      console.log("Sent request to sync with Telegram");
      if (!response.ok) {
        await this.communicationRepository.update_integration(integration.id, {
          syncStatus: SyncStatus.IDLE,
        });
        throw new Error(`Telegram sync failed with status ${response.status}`);
      }

      const data = await response.json();
      console.log("Received data from Telegram sync");

      const limit = pLimit(5);
      console.time("Total sync time");

      await Promise.all(
        data.messages.map((msg: any) =>
          limit(async () => {
            const start = Date.now();

            const communication =
              await this.communicationRepository.save_telegram_message(
                integration.profileID,
                integration.id,
                msg,
                userID
              );

            if (!communication) {
              console.log(
                `Message ${msg.message_id} was blocked by memory rules and was not saved.`,
              );
              return;
            }

            await communicationQueue.add("chunk-communication", {
              communicationID: communication.id,
              userID: userID,
            });

            console.log(
              `Processed message ${msg.message_id} in ${Date.now() - start}ms`,
            );
          }),
        ),
      );
      console.timeEnd("Total sync time");

      // Clean structural compilation for the Prisma JSON column
      const existingMetadata =
        typeof integration.metadata === "object" &&
        integration.metadata !== null
          ? (integration.metadata as Record<string, any>)
          : {};

      await this.integrationRepository.update_integration(integration.id, {
        syncStatus: SyncStatus.SUCCESS,
        lastSyncedAt: new Date(),
        metadata: {
          ...existingMetadata,
          lastMessageId: String(data.lastMessageId),
          chatStates: {
            ...(existingMetadata.chatStates || {}),
            ...data.chatStates,
          },
        },
      });

  }

  sync_gmail = async (profile_id: string, userID: string) => {
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
      await this.initial_gmail_sync(integration, userID);
    } else {
      console.log(
        `(Communication Service) Starting incremental sync for integration ${integration.id}`,
      );
      await this.incremental_gmail_sync(integration, userID);
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

  initial_gmail_sync = async (integration: any, userID: string) => {
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

          console.log(
            `(Communication Service) Processing message ${msg.id} for integration ${integration.id}`,
          );
          return limit(() =>
            this.process_gmail_message(gmailClient, integration, msg.id!, userID).then(
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

  incremental_gmail_sync = async (integration: any, userID: string) => {
    const gmailClient = await this.googleOAuthService.create_gmail_client({
      profileID: integration.profileID,
      accessToken: integration.accessToken,
      refreshToken: integration.refreshToken,
    });

    const startHistoryId = integration.gmailHistoryId;

    if (!startHistoryId) {
      return await this.initial_gmail_sync(integration, userID);
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
              userID
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
        return await this.initial_gmail_sync(integration, userID);
      }
      throw error;
    }
  };

  process_gmail_message = async (
    gmailClient: any,
    integration: any,
    messageId: string,
    userID: string,
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
      userID
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
      userID: userID,
    });

    return {
      sanitizedEmail,
      historyId: detailResponse.data.historyId,
    };
  };
}

export default CommunicationService;
