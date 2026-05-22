import GoogleOAuthService from "../integration/google-oauth.service.js";
import IntegrationService from "../integration/integration.service.js";
class CommunicationService {
    integrationService;
    googleOAuthService;
    constructor(integrationService, googleOAuthService) {
        this.integrationService = integrationService;
        this.googleOAuthService = googleOAuthService;
        this.integrationService = integrationService;
        this.googleOAuthService = googleOAuthService;
    }
    fetch_emails = async (profile_id, maxResults = 10) => {
        if (!profile_id) {
            throw new Error("Profile ID is required");
        }
        const integration = (await this.integrationService.get_gmail_integration(profile_id));
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
        const emails = await Promise.all(messages.map(async (message) => {
            if (!message.id) {
                return null;
            }
            const detailResponse = await gmailClient.users.messages.get({
                userId: "me",
                id: message.id,
                format: "full",
            });
            const headers = detailResponse.data.payload?.headers ?? [];
            const getHeader = (name) => headers.find((header) => header.name?.toLowerCase() === name.toLowerCase())?.value ?? null;
            return {
                id: detailResponse.data.id,
                threadId: detailResponse.data.threadId,
                snippet: detailResponse.data.snippet,
                labelIds: detailResponse.data.labelIds ?? [],
                internalDate: detailResponse.data.internalDate,
                from: getHeader("From"),
                subject: getHeader("Subject"),
                date: getHeader("Date"),
            };
        }));
        return emails.filter(Boolean);
    };
}
export default CommunicationService;
//# sourceMappingURL=communication.service.js.map