import { google } from "googleapis";

class GoogleOAuthService {
  private oauthClient: google.auth.OAuth2;
  constructor() {
    this.oauthClient = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    )
  }
  generateAuthUrl(profileId: string) {
    return this.oauthClient.generateAuthUrl({
      access_type: "offline",
      prompt: "consent",
      scope: [
        "https://www.googleapis.com/auth/gmail.readonly",
      ],
      state: profileId,
    })
  }

  async getToken(code: string) {
    const { tokens } = await this.oauthClient.getToken(code);
    return tokens;
  }
}

export default GoogleOAuthService;
