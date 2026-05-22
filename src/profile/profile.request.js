import z from "zod";
export const Create_Profile_Request = z.object({
    name: z.string().min(3, "Name must be at least 3 characters long"),
});
//# sourceMappingURL=profile.request.js.map