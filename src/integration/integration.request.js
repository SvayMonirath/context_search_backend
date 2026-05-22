import z from "zod";
export const Store_Integration_Request = z.object({
    profileID: z.string().uuid("Invalid profile ID format"),
    type: z.enum(["GMAIL", "TELEGRAM"]),
    accessToken: z.string().min(10, "Access token is too short"),
    refreshToken: z.string().min(10, "Refresh token is too short"),
});
export const Get_Gmail_Integration_Request = z.object({
    profileID: z.string().uuid("Invalid profile ID format"),
    accessToken: z.string().min(10, "Access token is too short"),
    refreshToken: z.string().min(10, "Refresh token is too short"),
});
//# sourceMappingURL=integration.request.js.map