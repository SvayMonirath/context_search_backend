import z from "zod";
import { Create_Profile_Request } from "./profile.request.js";
// dependencies
import ProfileRepository from "./profile.repository.js";

class ProfileService {
  constructor(private profileRepository: ProfileRepository) {
    this.profileRepository = profileRepository;
  }

  create_profile = async (profile_data: z.infer<typeof Create_Profile_Request>) => {
    const existing_profile = await this.profileRepository.get_profile_by_name(
      profile_data.name,
    );
    if (existing_profile) {
      throw new Error("Profile with this name already exists");
    }

    const new_profile = await this.profileRepository.create_profile(profile_data);

    return new_profile;
  }

}

export default ProfileService;
