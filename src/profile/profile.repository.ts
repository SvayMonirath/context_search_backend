import prisma from "../prisma.client.js";
import { Create_Profile_Request } from "./profile.request.js";
import z from "zod";

class ProfileRepository {
  async get_profile_by_name(name: string) {
    const profile = await prisma.profile.findUnique({
      where: {
        name,
      },
    });
    return profile;
  }

  async get_all_profiles(user_id: string) {
    const profiles = await prisma.profile.findMany({
      where: {
        user_id,
      },
    });
    return profiles;
  }

  async create_profile(profile_data: z.infer<typeof Create_Profile_Request>) {
    const new_profile = await prisma.profile.create({
      data: {
        name: profile_data.name,
        user_id: profile_data.user_id,
        color: profile_data.color,
        type: profile_data.type,
        password: profile_data.password || null,
      },
    });
    return new_profile;
  }

  async delete_profile(profileId: string) {
    await prisma.profile.delete({
      where: {
        id: profileId,
      },
    });
  }
}

export default ProfileRepository;

