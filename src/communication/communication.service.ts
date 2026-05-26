import GoogleOAuthService from "../integration/google-oauth.service.js";
import IntegrationService from "../integration/integration.service.js";
import { buildSanitizedEmail } from "./communication-email-sanitizer.js";

type GmailIntegration = {
  profileID: string;
  accessToken: string | null;
  refreshToken: string | null;
};

type SanitizedEmail = {
  id: string | null | undefined;
  threadId: string | null | undefined;
  snippet: string | null;
  body: string | null;
  labelIds: string[];
  internalDate: string | null | undefined;
  from: string | null;
  subject: string | null;
  date: string | null;
};

class CommunicationService {
  constructor(
    private integrationService: IntegrationService,
    private googleOAuthService: GoogleOAuthService,
  ) {
    this.integrationService = integrationService;
    this.googleOAuthService = googleOAuthService;
  }

  fetch_emails = async (profile_id: string, maxResults = 10) => {
    if (!profile_id) {
      throw new Error("Profile ID is required");
    }

    const integration = (await this.integrationService.get_gmail_integration(
      profile_id,
    )) as GmailIntegration | null;

    if (!integration) {
      throw new Error("Gmail integration not found for the specified profile");
    }

    if (!integration.accessToken || !integration.refreshToken) {
      throw new Error("Gmail integration is missing access or refresh token");
    }

    let gmailClient = await this.googleOAuthService.create_gmail_client({
      profileID: integration.profileID,
      accessToken: integration.accessToken,
      refreshToken: integration.refreshToken,
    });

    const listResponse = await gmailClient.users.messages.list({
      userId: "me",
      maxResults,
      labelIds: ["INBOX"],
    });

    const messages = listResponse.data.messages ?? [];

    const emails = await Promise.all(
      messages.map(async (message) => {
        if (!message.id) {
          return null;
        }

        const detailResponse = await gmailClient.users.messages.get({
          userId: "me",
          id: message.id,
          format: "full",
        });

        return buildSanitizedEmail({
          id: detailResponse.data.id ?? undefined,
          threadId: detailResponse.data.threadId ?? undefined,
          snippet: detailResponse.data.snippet ?? undefined,
          labelIds: detailResponse.data.labelIds ?? undefined,
          internalDate: detailResponse.data.internalDate ?? undefined,
          payload: detailResponse.data.payload ?? undefined,
        });
      }),
    );

    return emails.filter(Boolean);
  };
}

export default CommunicationService;
