import GoogleOAuthService from "../integration/google-oauth.service.js";
import IntegrationService from "../integration/integration.service.js";
declare class CommunicationService {
    private integrationService;
    private googleOAuthService;
    constructor(integrationService: IntegrationService, googleOAuthService: GoogleOAuthService);
    fetch_emails: (profile_id: string, maxResults?: number) => Promise<({
        id: string | null | undefined;
        threadId: string | null | undefined;
        snippet: string | null | undefined;
        labelIds: string[];
        internalDate: string | null | undefined;
        from: string | null;
        subject: string | null;
        date: string | null;
    } | null)[]>;
}
export default CommunicationService;
//# sourceMappingURL=communication.service.d.ts.map