import z from "zod";
import { Store_Integration_Request } from "./integration.request.js";
declare class IntegrationRepository {
    store_integration_data: (data: z.infer<typeof Store_Integration_Request>) => Promise<{
        type: import("@prisma/client").$Enums.IntegrationType;
        id: string;
        created_at: Date;
        profileID: string;
        accessToken: string | null;
        refreshToken: string | null;
        metadata: import("@prisma/client/runtime/client").JsonValue | null;
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
    update_integration_token: (profile_id: string, data: Partial<z.infer<typeof Store_Integration_Request>>) => Promise<import("@prisma/client").Prisma.BatchPayload>;
}
export default IntegrationRepository;
//# sourceMappingURL=integration.repository.d.ts.map