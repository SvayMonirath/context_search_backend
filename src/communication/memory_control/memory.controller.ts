import express from "express";
import { MemoryService } from "./memory.service.js";

export class MemoryController {
  constructor(private memoryService: MemoryService) {}

  search_memory = async (req: express.Request, res: express.Response) => {
    try {

      const user = req.user;
      const userID = user?.user_id;

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
        userID: userID as string,
      });

      res.status(200).json({
        status: "success",
        message: "Memory search successful",
        data: data,
      });
    } catch (error: any) {
      res.status(500).json({
        status: "error",
        message: error.message || "Memory search failed",
      });
    }
  };

  delete_communications = async (req: express.Request, res: express.Response) => {
    try {
      const profileID: string = req.params.profile_id as string;
      const { communicationIDs } = req.body;

      if (!profileID) {
        throw new Error("Profile ID is required");
      }

      if (!communicationIDs || !Array.isArray(communicationIDs)) {
        return res.status(400).json({
          status: "error",
          message: "communicationIDs must be an array",
        });
      }

      await this.memoryService.delete_communications(profileID, communicationIDs);

      return res.status(200).json({
        status: "success",
        message: "Communications deleted successfully",
      });

    } catch (error) {
      return res.status(500).json({
        status: "error",
        message: "Failed to delete communications",
      });
    }
  };

  createRule = async (req: express.Request, res: express.Response) => {
    try {
      if(!req.params.profile_id) {
        throw new Error("Profile ID is required");
      }
      const profileID: string | string[] | undefined = req.params.profile_id as string;

      const { type, value, scope } = req.body;
      await this.memoryService.createRule({ profileID, type, scope, value });

      res.status(201).json({
        status: "success",
        message: "Rule created successfully",
      });
    } catch (error: any) {
      res.status(500).json({
        status: "error",
        message: error.message || "Failed to create rule",
      });
    }
  }

  getRules = async (req: express.Request, res: express.Response) => {
    try {
      if(!req.params.profile_id) {
        throw new Error("Profile ID is required");
      }
      const profileID: string | string[] | undefined = req.params.profile_id as string;

      const rules = await this.memoryService.getRules(profileID);

      res.status(200).json({
        status: "success",
        message: "Rules retrieved successfully",
        data: rules,
      });
    } catch (error: any) {
      res.status(500).json({
        status: "error",
        message: "Failed to retrieve rules",
      });
    }
  }

  deleteRule = async (req: express.Request, res: express.Response) => {
    try {

      if (!req.params.profile_id) {
        throw new Error("Profile ID is required");
      }
      if (!req.params.rule_id) {
        throw new Error("Rule ID is required");
      }

      const ruleID: string | string[] | undefined = req.params.rule_id as string;
      const profileID: string | string[] | undefined = req.params
        .profile_id as string;
      const userID: string | string[] | undefined = req.user?.user_id as string;

      await this.memoryService.deleteRule(profileID, ruleID);

      res.status(200).json({
        status: "success",
        message: "Rule deleted successfully",
      });
    } catch (error) {
      res.status(500).json({
        status: "error",
        message: "Failed to delete rule",
      });
    }
  }
}
