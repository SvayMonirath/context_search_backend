import express from "express";

import CommunicationService from "./communication.service.js";
import { communicationQueue } from "../message_broker/communication.queue.js";

class CommunicationController {
  constructor(private communicationService: CommunicationService) {
    this.communicationService = communicationService;
  }

  get_emails = async (req: express.Request, res: express.Response) => {
    try {
      const profile_id =
        typeof req.params.profile_id === "string" ? req.params.profile_id : "";

      if (!profile_id) {
        return res.status(400).json({
          status: "error",
          message: "Profile ID is required",
        });
      }

      const maxResults = req.query.maxResults
        ? Number(req.query.maxResults)
        : 20;

      const emails = await this.communicationService.fetch_emails(
        profile_id,
        maxResults,
      );

      return res.status(200).json({
        status: "success",
        message: "Emails fetched successfully",
        data: {
          emails,
        },
      });
    } catch (error: any) {
      return res.status(500).json({
        status: "error",
        message: error.message,
      });
    }
  };

  sync_telegram = async (req: express.Request, res: express.Response) => {
    try {
      const profile_id: string | string[] | undefined = req.params.profile_id;

      await communicationQueue.add("sync-telegram", {
        profileID: profile_id,
      });
      
    } catch (error) {
      return res.status(500).json({
        status: "error",
        message: "Failed to initiate Telegram sync",
      });
    }
  }

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
  }
}

export default CommunicationController;
