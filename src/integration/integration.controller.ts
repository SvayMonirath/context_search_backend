import z from "zod";
import express from "express";

import IntegrationService from "./integration.service.js";

class IntegrationController {
  constructor(private integrationService: IntegrationService) {
    this.integrationService = integrationService;
  }

  google_connect = async (req: express.Request, res: express.Response) => {
    try {
      const profile_id = req.params.profile_id;
      const url = this.integrationService.connect_google(profile_id);

      return res.status(200).json({
        status: "success",
        message: "Google OAuth URL generated successfully",
        data: {
          url,
        },
      });
    } catch (error) {
      res.status(500).json({
        status: "error",
        message: error.message,
      });
    }
  }

  google_callback = async (req: express.Request, res: express.Response) => {
    try {
      const code = req.query.code as string;
      const profile_id = req.query.state as string;

      const token = await this.integrationService.handle_google_callback(code);

      console.log("Received token:", token);
      console.log("Profile ID:", profile_id)

      return res.status(200).json({
        status: "success",
        message: "Google account connected successfully",
        data: {
          token,
          profile_id,
        },
      });

    } catch (error) {
      res.status(500).json({
        status: "error",
        message: error.message,
      });
    }
  }
}

export default IntegrationController;
