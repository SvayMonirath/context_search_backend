import z from "zod";

export const Register_Request = z.object({
  username: z.string().min(3, "Username must be at least 3 characters long"),
  email: z.string().email("Invalid email address"),
  hash_password: z.string().min(6, "Password must be at least 6 characters long"),
  confirm_password: z.string().min(6, "Confirm password must be at least 6 characters long")
})

export const Login_Request = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long")
})

export const JWT_Payload = z.object({
  user_id: z.string(),
  username: z.string(),
  email: z.string().email()
})
