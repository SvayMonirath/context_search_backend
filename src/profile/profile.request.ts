import z from "zod";


export const Create_Profile_Request = z.object({
  name: z.string().min(3, "Name must be at least 3 characters long"),
  user_id: z.string().optional(),
  type: z.enum(["STANDARD", "STATELESS"]).default("STANDARD"),
  color: z.enum(["BLUE", "CYAN", "GREEN", "ORANGE", "RED", "PURPLE"]).default("BLUE"),
})
