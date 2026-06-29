import express from "express";

import pLimit from "p-limit";

import CommunicationService from "./communication.service.js";
import { communicationQueue } from "../message_broker/communication.queue.js";
import  IntegrationRepository from "../integration/integration.repository.js";
import CommunicationRepository from "./communication.repository.js";
import { SyncStatus } from "@prisma/client";

class CommunicationController {
  constructor(
    private communicationService: CommunicationService,
    private integrationRepository: IntegrationRepository,
    private communicationRepository: CommunicationRepository,
  ) {}


  sync_telegram = async (req: express.Request, res: express.Response) => {

    let profile_id: string | undefined;
    try {
      const user = req.user;
      const userID = user.user_id;

      if(!userID) {
        throw new Error("User ID is required");
      }

      if (!req.params.profile_id) {
        throw new Error("Profile ID is required");
      }
      profile_id = req.params.profile_id as string;

      await communicationQueue.add("sync-telegram", {
        profileID: profile_id,
        userID,
      });

      return res.status(200).json({
        status: "success",
        message: "Telegram sync initiated successfully",
      });
    } catch (error: any) {
      console.error("REAL TELEGRAM SYNC ERROR OCCURRED:");
      console.error(error?.message || error);
      if (error?.stack) {
        console.error(error.stack);
      }

      if (profile_id) {
        const integration =
          await this.integrationRepository.get_active_telegram_integration(
            profile_id,
          );
        if (integration) {
          await this.integrationRepository.update_integration(integration.id, {
            syncStatus: SyncStatus.FAILED,
          });
        }
      }
      return res.status(500).json({
        status: "error",
        message: "Telegram sync failed",
      });
    }
  };

  sync_gmail = async (req: express.Request, res: express.Response) => {
    try {
      const user = req.user;
      const userID = user.user_id;
      const profile_id: string | string[] | undefined = req.params.profile_id;

      if(!profile_id || !userID) {
        throw new Error("Profile ID and User ID are required");
      }

      await communicationQueue.add("sync-gmail", {
        profileID: profile_id,
        userID,
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

  get_communications = async (req: express.Request, res: express.Response) => {
    try {
      const user = req.user;
      const userID = user.user_id;
      if(!userID) {
        throw new Error("User ID is required");
      }
      if (!req.params.profile_id) {
        throw new Error("Profile ID is required");
      }
      if (!req.params.limit || !req.params.page) {
        throw new Error("Limit and page parameters are required");
      }

      const { profile_id, limit, page } = req.params;
      const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

      const { data, total } =
        await this.communicationService.get_communications(
          profile_id as string,
          offset,
          parseInt(limit as string),
          userID
        );

      return res.status(200).json({
        status: "success",
        message: "Communications retrieved successfully",
        data: {
          communications: data,
          total,
          page: parseInt(page as string),
          limit: parseInt(limit as string),
        },
      });
    } catch (error: any) {
      return res.status(500).json({
        status: "error",
        message: error.message || "Failed to retrieve communications",
      });
    }
  };
}

export default CommunicationController;
