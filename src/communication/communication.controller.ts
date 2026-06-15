import express from "express";

import pLimit from "p-limit";

import CommunicationService from "./communication.service.js";
import { communicationQueue } from "../message_broker/communication.queue.js";
import  IntegrationRepository from "../integration/integration.repository.js";
import CommunicationRepository from "./communication.repository.js";
import { SyncStatus } from "@prisma/client";

class CommunicationController {
  constructor(private communicationService: CommunicationService, private integrationRepository: IntegrationRepository, private communicationRepository: CommunicationRepository) {}

  sync_telegram = async (req: express.Request, res: express.Response) => {
    try {

      if(!req.params.profile_id) {
        throw new Error("Profile ID is required");
      }
      const profile_id: string | string[] = req.params.profile_id;
      const integration = await this.integrationRepository.get_active_telegram_integration(profile_id);

      if (!integration) {
        throw new Error("Telegram integration not found");
      }

      await this.integrationRepository.update_integration(integration.id, {
        syncStatus: SyncStatus.SYNCING,
      });
      console.log("Updated integration status to SYNCING");

      const fastapiHost = process.env.PYTHON_BACKEND_HOST || "localhost";
      const fastapiPort = process.env.PYTHON_BACKEND_PORT || "8001";
      const response = await fetch(`http://${fastapiHost}:${fastapiPort}/telegram/sync-telegram`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          integration_id: integration.id,
          last_sync: integration.metadata || {},
        }),
      });

      console.log("Sent request to sync with Telegram");

      if (!response.ok) {
        throw new Error(`Failed to sync with Telegram. Status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Received data from Telegram sync");

      const limit = pLimit(5);
      console.time("Total sync time");

      await Promise.all(
        data.messages.map((msg: any) =>
          limit(async () => {
            // Fixed structural key typo from msg.messageId -> msg.message_id
            console.time(`Saving message ${msg.sender_name} - ${msg.message_id}`);

            const communication = await this.communicationRepository.save_telegram_message(
              integration.profileID,
              integration.id,
              msg,
            );

            await communicationQueue.add("chunk-communication", {
              communicationID: communication.id,
            });

            console.timeEnd(`Saving message ${msg.sender_name} - ${msg.message_id}`);
          })
        )
      );
      console.timeEnd("Total sync time");

      // Clean structural compilation for the Prisma JSON column
      const existingMetadata = typeof integration.metadata === "object" && integration.metadata !== null
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

      return {
        status: "success",
        message: "Telegram sync completed successfully",
        data: { syncedMessages: data.messages.length },
      };

    } catch (error: any) {
      // Avoid raw object printing to shield against circular reference rendering crashes
      console.log("==========================================");
      console.error("❌ REAL TELEGRAM SYNC ERROR OCCURRED:");
      console.error(error?.message || error);
      if (error?.stack) {
        console.error(error.stack);
      }
      console.log("==========================================");

      try {
        if (profile_id) {
          const integration = await this.integrationRepository.get_active_telegram_integration(profile_id);
          if (integration) {
            await this.integrationRepository.update_integration(integration.id, {
              syncStatus: SyncStatus.FAILED,
            });
          }
        }
      } catch (dbError: any) {
        console.error("Failed to mark integration status as FAILED:", dbError.message);
      }

      return {
        status: "error",
        message: "Telegram sync failed",
      };
    }
  };

  sync_gmail = async (req: express.Request, res: express.Response) => {
    try {
      const profile_id: string | string[] | undefined = req.params.profile_id;

      await communicationQueue.add("sync-gmail", {
        profileID: profile_id,
      });

      return res.status(200).json({
        status: "success",
        message: "Gmail sync initiated successfully",
      });
    } catch (error: any) {
      return res.status(500).json({
        status: "error",
        message: error.message,
      });
    }
  };
}

export default CommunicationController;
