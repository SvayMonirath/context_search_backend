import jwt from "jsonwebtoken";
import z from "zod";

import { JWT_Payload } from "../authentication/authentication.request.js";

export const generate_access_token = (payload: z.infer<typeof JWT_Payload>) => {
  return jwt.sign(payload, process.env.JWT_ACCESS_TOKEN_SECRET_KEY, {
    expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRES_IN || "1h",
  });
};
