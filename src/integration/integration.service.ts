import z from "zod";

import GoogleOAuthService from "./google-oauth.service.js";
import IntegrationRepository from "./integration.repository.js";
import { Store_Integration_Request } from "./integration.request.js";

class IntegrationService {
  constructor(
    private googleOAuthservice: GoogleOAuthService,
    private integrationRepository: IntegrationRepository,
  ) {
    this.googleOAuthservice = googleOAuthservice;
    this.integrationRepository = integrationRepository;
  }

  connect_google = (profile_id: string) => {
    return this.googleOAuthservice.generateAuthUrl(profile_id);
  };

  handle_google_callback = async (code: string) => {
    return await this.googleOAuthservice.getToken(code);
  };

  store_integration_data = async (
    data: z.infer<typeof Store_Integration_Request>,
  ) => {
    return await this.integrationRepository.store_integration_data(data);
  };
}

export default IntegrationService;
