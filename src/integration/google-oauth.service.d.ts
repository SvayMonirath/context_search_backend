import z from "zod";
import { Get_Gmail_Integration_Request } from "./integration.request.js";
type GoogleTokens = {
    access_token?: string | null;
    refresh_token?: string | null;
    expiry_date?: number | null;
    token_type?: string | null;
    scope?: string | null;
};
declare class GoogleOAuthService {
    private oauthClient;
    constructor();
    generateAuthUrl(profileId: string): string;
    getToken(code: string): Promise<GoogleTokens>;
    refreshAccessToken(refreshToken: string): Promise<GoogleTokens>;
    create_gmail_client(integration: z.infer<typeof Get_Gmail_Integration_Request>): Promise<import("googleapis").gmail_v1.Gmail>;
}
export default GoogleOAuthService;
//# sourceMappingURL=google-oauth.service.d.ts.map