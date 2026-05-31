import z from "zod";
import express from "express";

import IntegrationService from "./integration.service.js";
import { Get_Gmail_Integration_Request, type Store_Integration_Request } from "./integration.request.js";

class IntegrationController {
  constructor(private integrationService: IntegrationService) {
    this.integrationService = integrationService;
  }

  google_connect = async (req: express.Request, res: express.Response) => {
    try {
      const profile_id: any = req.params.profile_id;
      const url = this.integrationService.connect_google(profile_id);

      return res.status(200).json({
        status: "success",
        message: "Google OAuth URL generated successfully",
        data: {
          url,
        },
      });
    } catch (error: any) {
      res.status(500).json({
        status: "error",
        message: error.message,
      });
    }
  };

  google_callback = async (req: express.Request, res: express.Response) => {
    try {
      const code = req.query.code as string;
      const profile_id = req.query.state as string;

      const token = await this.integrationService.handle_google_callback(code);

      if (!token || !token.access_token || !token.refresh_token) {
        return res.status(400).json({
          status: "error",
          message: "Failed to retrieve access token or refresh token from Google",
        });
      }

      const integration_data: z.infer<typeof Store_Integration_Request> = {
        profileID: profile_id,
        type: "GMAIL",
        accessToken: token.access_token,
        refreshToken: token.refresh_token,
      };

      await this.integrationService.store_integration_data(integration_data);

      return res.status(200).json({
        status: "success",
        message: "Google account connected successfully",
        data: {
          token,
          ProfileID: profile_id,
        },
      });
    } catch (error: any) {
      res.status(500).json({
        status: "error",
        message: error.message,
      });
    }
  };

  get_gmail_integration = async (req: express.Request, res: express.Response) => {
    try {
      const profile_id: any  = req.params.profile_id;
      const integration = await this.integrationService.get_gmail_integration(profile_id);

      if(profile_id !== integration?.profileID){
        return res.status(404).json({
          status: "error",
          message: "Gmail integration not found for the specified profile",
        });
      }

      return res.status(200).json({
        status: "success",
        message: "Gmail integration data retrieved successfully",
        data: {
          integration,
        },
      });
    } catch (error: any) {
      res.status(500).json({
        status: "error",
        message: error.message,
      });
    }
  }

  refresh_google_token = async(req: express.Request, res: express.Response) => {
    try {
      const profile_id: any  = req.params.profile_id;
      const integration = await this.integrationService.get_gmail_integration(profile_id);

      if (!integration) {
        return res.status(404).json({
          status: "error",
          message: "Gmail integration not found for the specified profile",
        });
      }

      if(!integration.refreshToken){
        return res.status(400).json({
          status: "error",
          message: "No refresh token available for this integration",
        });
      }

      // does this return a new refresh token or access token or both? usually only access token is refreshed, refresh token remains the same
      const refreshed_tokens = await this.integrationService.refresh_google_token(integration.refreshToken);

      if(!refreshed_tokens || !refreshed_tokens.access_token){
        return res.status(400).json({
          status: "error",
          message: "Failed to refresh access token using the refresh token",
        });
      }

      // Update the stored tokens in the database
      const updated_integration_data: z.infer<typeof Store_Integration_Request> = {
        profileID: profile_id,
        type: "GMAIL",
        accessToken: refreshed_tokens.access_token,
        refreshToken: integration.refreshToken, // Refresh token usually remains the same
      };

      await this.integrationService.update_integration_token(profile_id, updated_integration_data);

      return res.status(200).json({
        status: "success",
        message: "Google access token refreshed successfully",
        data: {
          accessToken: refreshed_tokens.access_token,
        },
      });
    } catch (error: any) {
      res.status(500).json({
        status: "error",
        message: error.message,
      });
    }
  }

  create_gmail_client = async (req: express.Request, res: express.Response) => {
    try {
      const integration_data: z.infer<typeof Get_Gmail_Integration_Request> = Get_Gmail_Integration_Request.parse(req.body);
      const gmail_client = await this.integrationService.create_gmail_client(integration_data);

      return res.status(200).json({
        status: "success",
        message: "Gmail client created successfully",
        data: {
          gmail_client,
        },
      });
    } catch (error: any) {
      res.status(500).json({
        status: "error",
        message: error.message,
      });
    }
  };
}

export default IntegrationController;
