import z from "zod";

import GoogleOAuthService from "./google-oauth.service.js";
import IntegrationRepository from "./integration.repository.js";
import { Get_Gmail_Integration_Request, Store_Integration_Request } from "./integration.request.js";
import { IntegrationType } from "@prisma/client";

class IntegrationService {
  constructor(
    private googleOAuthservice: GoogleOAuthService,
    private integrationRepository: IntegrationRepository,
  ) {}

  connect_google = (profile_id: string) => {
    return this.googleOAuthservice.generateAuthUrl(profile_id);
  };

  handle_google_callback = async (code: string) => {
    return await this.googleOAuthservice.getToken(code);
  };

  get_gmail_integration = async (profile_id: string) => {
    if (!profile_id) {
      throw new Error("Profile ID is required");
    }
    return await this.integrationRepository.get_gmail_integration(profile_id);
  }

  get_active_gmail_integration = async (profile_id: string) => {
    if (!profile_id) {
      throw new Error("Profile ID is required");
    }
    return await this.integrationRepository.get_active_gmail_integration(profile_id);
  }

  get_inactive_gmail_integration = async (profile_id: string) => {
    if (!profile_id) {
      throw new Error("Profile ID is required");
    }
    return await this.integrationRepository.get_inactive_gmail_integration(profile_id);
  }


  get_integration_status = async (profile_id: string) => {
    if(!profile_id) {
      throw new Error("Profile ID is required");
    }
    const integrations = await this.integrationRepository.get_integrations_by_profile_id(profile_id);
    return integrations;
  }

  create_gmail_client = async (integration: z.infer<typeof Get_Gmail_Integration_Request>) => {
    return await this.googleOAuthservice.create_gmail_client(integration);
  }

  delete_integration = async (integration_id: string, type: IntegrationType) => {

    if(!integration_id) {
      throw new Error("Integration ID is required");
    }

    await this.integrationRepository.delete_integration(integration_id, type);
  }

  disconnect_integration = async (integration_id: string) => {

    if(!integration_id) {
      throw new Error("Integration ID is required");
    }


    const integration: any = await this.integrationRepository.get_integration_by_id(integration_id);

    if(integration.isActive === false) {
      throw new Error("Integration is already disconnected");
    }

    if (integration.type === IntegrationType.GMAIL) {
      if (!integration || !integration.accessToken) {
        throw new Error("No Gmail integration found for this profile");
      }
      await this.googleOAuthservice.disconnect_google(integration.accessToken);
    }

    await this.integrationRepository.disconnect_integration(integration_id);

    return integration.type;
  }

  refresh_google_token = async (refreshToken: string) => {
    if (!refreshToken) {
      throw new Error("Refresh token is required");
    }
    return await this.googleOAuthservice.refreshAccessToken(refreshToken);
  }

  store_integration_data = async (
    data: z.infer<typeof Store_Integration_Request>,
  ) => {
    return await this.integrationRepository.store_integration_data(data);
  };

  update_integration_token = async (
    profile_id: string,
    integration: any,
    data: Partial<z.infer<typeof Store_Integration_Request>>,
  ) => {
    return await this.integrationRepository.update_integration_token(profile_id, integration, data);
  };
}

export default IntegrationService;
