import type z from "zod";
import prisma from "../prisma.client.js";

class UserRepository {
  create_user = async (userData: z.infer<typeof import("../dtos/authentication.request.js").Register_Request>) => {
    try {
      return await prisma.user.create({
        data: {
          username: userData.username,
          email: userData.email,
          hash_password: userData.hash_password
        }

      });
    } catch (error) {
      throw new Error("Error creating user");
    }
  }
}

export default UserRepository;
