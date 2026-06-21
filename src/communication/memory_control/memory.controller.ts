import express from "express";
import { MemoryService } from "./memory.service.js";

export class MemoryController {
  constructor(private memoryService: MemoryService) {}

  search_memory = async (req: express.Request, res: express.Response) => {
    try {
      if (!req.params.profile_id) {
        throw new Error("Profile ID is required");
      }

      if (!req.body) {
        throw new Error("Request body is required");
      }

      const profileID: string | string[] | undefined = req.params.profile_id;

      const { query, filters, limit, offset } = req.body;

      const data = await this.memoryService.search_memory({
        profileID,
        query,
        filters,
        limit,
        offset,
      });

      res.status(200).json({
        status: "success",
        message: "Memory search successful",
        data: data,
      });
    } catch (error: any) {
      res.status(500).json({
        status: "error",
        message: "Failed to search memory",
      });
    }
  };

  delete_communications = async (
    req: express.Request,
    res: express.Response,
  ) => {
    try {
      if (!req.params.profile_id) {
        throw new Error("Profile ID is required");
      }

      if (!req.body.selected_communications) {
        throw new Error("Selected communications are required");
      }

      const profileID: string | string[] | undefined = req.params.profile_id;
      const { communicationIDs } = req.body;

      if (!communicationIDs || !Array.isArray(communicationIDs)) {
        throw new Error(
          "communicationIDs must be an array of communication IDs",
        );
      }

      await this.memoryService.delete_communications(
        profileID,
        communicationIDs,
      );

      return res.status(200).json({
        status: "success",
        message: "Communications deleted successfully",
      });
    } catch (error: any) {
      res.status(500).json({
        status: "error",
        message: "Failed to delete communications",
      });
    }
  };
}
