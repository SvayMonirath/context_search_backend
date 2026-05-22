import z from "zod";
export declare const Store_Integration_Request: z.ZodObject<{
    profileID: z.ZodString;
    type: z.ZodEnum<{
        GMAIL: "GMAIL";
        TELEGRAM: "TELEGRAM";
    }>;
    accessToken: z.ZodString;
    refreshToken: z.ZodString;
}, z.z.core.$strip>;
export declare const Get_Gmail_Integration_Request: z.ZodObject<{
    profileID: z.ZodString;
    accessToken: z.ZodString;
    refreshToken: z.ZodString;
}, z.z.core.$strip>;
//# sourceMappingURL=integration.request.d.ts.map