import type z from "zod";
import prisma from "../prisma.client.js";

class UserRepository {
  get_user_by_email = async (email: string) => {
    try {
      return await prisma.user.findUnique({
        where: { email },
      });
    } catch (error) {
      throw new Error("Error fetching user by email");
    }
  };

  delete_user = async (userId: string) => {
    try {
      await prisma.user.delete({
        where: { id: userId },
      });
    } catch (error) {
      throw new Error("Error deleting user");
    }
  };

  get_user_by_username = async (username: string) => {
    try {
      return await prisma.user.findUnique({
        where: { username },
      });
    } catch (error) {
      throw new Error("Error fetching user by username");
    }
  };

  create_user = async (
    userData: z.infer<
      typeof import("./authentication.request.js").Register_Request
    >,
  ) => {
    try {
      return await prisma.user.create({
        data: {
          username: userData.username,
          email: userData.email,
          hash_password: userData.hash_password,
          encrypted_data_key: "placeholder", // Initialize with null; will be set later
        },
      });
    } catch (error) {
      throw new Error("Error creating user");
    }
  };

  save_encrypted_key = async (userId: string, encryptedKey: string) => {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { encrypted_data_key: encryptedKey },
    });
    return user;
  }

  get_encrypted_key = async (userId: string) => {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { encrypted_data_key: true },
    });
    return user?.encrypted_data_key || null;
  }
}

export default UserRepository;
