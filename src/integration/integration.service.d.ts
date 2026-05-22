import z from "zod";
import GoogleOAuthService from "./google-oauth.service.js";
import IntegrationRepository from "./integration.repository.js";
import { Get_Gmail_Integration_Request, Store_Integration_Request } from "./integration.request.js";
declare class IntegrationService {
    private googleOAuthservice;
    private integrationRepository;
    constructor(googleOAuthservice: GoogleOAuthService, integrationRepository: IntegrationRepository);
    connect_google: (profile_id: string) => string;
    handle_google_callback: (code: string) => Promise<{
        access_token?: string | null;
        refresh_token?: string | null;
        expiry_date?: number | null;
        token_type?: string | null;
        scope?: string | null;
    }>;
    get_gmail_integration: (profile_id: string) => Promise<{
        type: import("@prisma/client").$Enums.IntegrationType;
        id: string;
        created_at: Date;
        profileID: string;
        accessToken: string | null;
        refreshToken: string | null;
        metadata: import("@prisma/client/runtime/client").JsonValue | null;
    } | null>;
    create_gmail_client: (integration: z.infer<typeof Get_Gmail_Integration_Request>) => Promise<import("googleapis").gmail_v1.Gmail>;
    refresh_google_token: (refreshToken: string) => Promise<{
        access_token?: string | null;
        refresh_token?: string | null;
        expiry_date?: number | null;
        token_type?: string | null;
        scope?: string | null;
    }>;
    store_integration_data: (data: z.infer<typeof Store_Integration_Request>) => Promise<{
        type: import("@prisma/client").$Enums.IntegrationType;
        id: string;
        created_at: Date;
        profileID: string;
        accessToken: string | null;
        refreshToken: string | null;
        metadata: import("@prisma/client/runtime/client").JsonValue | null;
    }>;
    update_integration_token: (profile_id: string, data: Partial<z.infer<typeof Store_Integration_Request>>) => Promise<import("@prisma/client").Prisma.BatchPayload>;
}
export default IntegrationService;
//# sourceMappingURL=integration.service.d.ts.map