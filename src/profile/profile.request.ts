import z from "zod";


export const Create_Profile_Request = z.object({
  name: z.string().min(3, "Name must be at least 3 characters long"),
  user_id: z.string().optional(),
  type: z.enum(["STANDARD", "PRIVATE"]).default("STANDARD"),
  color: z.enum(["BLUE", "CYAN", "GREEN", "ORANGE", "RED", "PURPLE"]).default("BLUE"),
  password: z.string().min(6, "Password must be at least 6 characters long").optional(),
  confirm_password: z.string().min(6, "Confirm password must be at least 6 characters long").optional()
})
