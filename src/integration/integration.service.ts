import GoogleOAuthService from "./google-oauth.service.js";

class IntegrationService {
  constructor(private googleOAuthservice: GoogleOAuthService) {
    this.googleOAuthservice = googleOAuthservice;
  }

  connect_google = (profile_id: string) => {
    return this.googleOAuthservice.generateAuthUrl(profile_id);
  }

  handle_google_callback = async (code: string) => {
    return await this.googleOAuthservice.getToken(code);
  }
}

export default IntegrationService;
