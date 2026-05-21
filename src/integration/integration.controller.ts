import z from "zod";
import express from "express";

import IntegrationService from "./integration.service.js";
import type { Store_Integration_Request } from "../integration.request.js";

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

      const integration_data: z.infer<typeof Store_Integration_Request> = {
        profileID: profile_id,
        type: "GMAIL",
        accessToken: token.access_token,
        refreshToken: token.refresh_token,
      }

      await this.integrationService.store_integration_data(integration_data);

      return res.status(200).json({
        status: "success",
        message: "Google account connected successfully",
        data: {
          token,
          ProfileID: profile_id,
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
