import z from "zod";
import express from "express";
import IntegrationService from "./integration.service.js";
import { Get_Gmail_Integration_Request } from "./integration.request.js";
class IntegrationController {
    integrationService;
    constructor(integrationService) {
        this.integrationService = integrationService;
        this.integrationService = integrationService;
    }
    google_connect = async (req, res) => {
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
        }
        catch (error) {
            res.status(500).json({
                status: "error",
                message: error.message,
            });
        }
    };
    google_callback = async (req, res) => {
        try {
            const code = req.query.code;
            const profile_id = req.query.state;
            const token = await this.integrationService.handle_google_callback(code);
            const integration_data = {
                profileID: profile_id,
                type: "GMAIL",
                accessToken: token.access_token,
                refreshToken: token.refresh_token,
            };
            await this.integrationService.store_integration_data(integration_data);
        }
        catch (error) {
            res.status(500).json({
                status: "error",
                message: error.message,
            });
        }
    };
    get_gmail_integration = async (req, res) => {
        try {
            const profile_id = req.params.profile_id;
            const integration = await this.integrationService.get_gmail_integration(profile_id);
            if (profile_id !== integration?.profileID) {
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
        }
        catch (error) {
            res.status(500).json({
                status: "error",
                message: error.message,
            });
        }
    };
    refresh_google_token = async (req, res) => {
        try {
            const profile_id = req.params.profile_id;
            const integration = await this.integrationService.get_gmail_integration(profile_id);
            if (!integration) {
                return res.status(404).json({
                    status: "error",
                    message: "Gmail integration not found for the specified profile",
                });
            }
            // does this return a new refresh token or access token or both? usually only access token is refreshed, refresh token remains the same
            const refreshed_tokens = await this.integrationService.refresh_google_token(integration.refreshToken);
            // Update the stored tokens in the database
            const updated_integration_data = {
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
        }
        catch (error) {
            res.status(500).json({
                status: "error",
                message: error.message,
            });
        }
    };
    create_gmail_client = async (req, res) => {
        try {
            const integration_data = Get_Gmail_Integration_Request.parse(req.body);
            const gmail_client = await this.integrationService.create_gmail_client(integration_data);
            return res.status(200).json({
                status: "success",
                message: "Gmail client created successfully",
                data: {
                    gmail_client,
                },
            });
        }
        catch (error) {
            res.status(500).json({
                status: "error",
                message: error.message,
            });
        }
    };
}
export default IntegrationController;
//# sourceMappingURL=integration.controller.js.map
