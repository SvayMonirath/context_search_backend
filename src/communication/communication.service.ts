import type { ChunkingService } from "../chunking/chunking.service.js";
import GoogleOAuthService from "../integration/google-oauth.service.js";
import IntegrationService from "../integration/integration.service.js";
import { buildSanitizedEmail } from "./communication-email-sanitizer.js";
import { communicationQueue } from "../message_broker/communication.queue.js";
import type CommunicationRepository from "./communication.repository.js";

type GmailIntegration = {
  id: string;
  profileID: string;
  accessToken: string | null;
  refreshToken: string | null;
};

class CommunicationService {
  constructor(
    private integrationService: IntegrationService,
    private googleOAuthService: GoogleOAuthService,
    private communicationRepository: CommunicationRepository,
    private chunkingService: ChunkingService,
  ) {
    this.integrationService = integrationService;
    this.googleOAuthService = googleOAuthService;
    this.communicationRepository = communicationRepository;
    this.chunkingService = chunkingService;
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

        const sanitizedEmail = buildSanitizedEmail({
          id: detailResponse.data.id ?? undefined,
          threadId: detailResponse.data.threadId ?? undefined,
          snippet: detailResponse.data.snippet ?? undefined,
          labelIds: detailResponse.data.labelIds ?? undefined,
          internalDate: detailResponse.data.internalDate ?? undefined,
          payload: detailResponse.data.payload ?? undefined,
        });

        // Save the email to the database and process it for chunking
        const communication = await this.communicationRepository.save_email(
          integration.profileID,
          integration.id,
          sanitizedEmail,
        );

        // Process the communication to create chunks
        // await this.chunkingService.processCommunication(communication.id);
        // explain the syntax 
        await communicationQueue.add("chunk-communication", {
          communicationID: communication.id,
        });

        return sanitizedEmail;
      }),
    );

    return emails.filter(Boolean);
  };
}

export default CommunicationService;
