import { google } from "googleapis";
import z from "zod";

import { Get_Gmail_Integration_Request } from "./integration.request.js";

type GoogleTokens = {
  access_token?: string | null;
  refresh_token?: string | null;
  expiry_date?: number | null;
  token_type?: string | null;
  scope?: string | null;
};

class GoogleOAuthService {
  private oauthClient: InstanceType<typeof google.auth.OAuth2>;
  constructor() {
    this.oauthClient = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI,
    );
  }
  generateAuthUrl(profileId: string) {
    return this.oauthClient.generateAuthUrl({
      access_type: "offline",
      prompt: "consent",
      scope: ["https://www.googleapis.com/auth/gmail.readonly"],
      state: profileId,
    });
  }

  async getToken(code: string): Promise<GoogleTokens> {
    const { tokens } = await this.oauthClient.getToken(code);
    return tokens;
  }

  async refreshAccessToken(refreshToken: string): Promise<GoogleTokens> {
    this.oauthClient.setCredentials({ refresh_token: refreshToken });
    const { credentials } = await this.oauthClient.refreshAccessToken();
    return credentials;
  }

  async create_gmail_client(
    integration: z.infer<typeof Get_Gmail_Integration_Request>,
  ) {
    const { accessToken, refreshToken } = integration;

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI,
    );

    oauth2Client.setCredentials({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    return google.gmail({ version: "v1", auth: oauth2Client });
  }

  // do we use profile_id or access_token to revoke the token? I think we should use access_token to revoke the token, but we need to get the access_token from the database using the profile_id
  async disconnect_google(access_token: string) {
    // Revoke the token using Google's token revocation endpoint
    const revokeUrl = `https://oauth2.googleapis.com/revoke?token=${access_token}`;
    try {
      await fetch(revokeUrl, {
        method: "POST",
        headers: {
          "Content-type": "application/x-www-form-urlencoded",
        },
      });
    } catch (error) {
      console.error("Error revoking Google token:", error);
      throw new Error("Failed to disconnect Google account");
    }
  }
}

export default GoogleOAuthService;
