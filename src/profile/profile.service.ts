import z from "zod";
import { Create_Profile_Request } from "./profile.request.js";
// dependencies
import ProfileRepository from "./profile.repository.js";
import PasswordService from "../authentication/password.service.js";

class ProfileService {
  constructor(private profileRepository: ProfileRepository, private passwordService: PasswordService) {
    this.profileRepository = profileRepository;
    this.passwordService = passwordService;
  }

  create_profile = async (profile_data: z.infer<typeof Create_Profile_Request>) => {
    const existing_profile = await this.profileRepository.get_profile_by_name(
      profile_data.name,
    );
    if (existing_profile) {
      throw new Error("Profile with this name already exists");
    }

    if( profile_data.type === "PRIVATE" && !profile_data.password) {
      throw new Error("Password is required for PRIVATE profiles");
    }

    if(profile_data.password && profile_data.password !== profile_data.confirm_password) {
      throw new Error("Password and confirm password do not match");
    }

    if (profile_data.password) {
      profile_data.password = await this.passwordService.hash_password(profile_data.password);
    }

    const new_profile = await this.profileRepository.create_profile(profile_data);

    return new_profile;
  }

  get_all_profiles = async (user_id: string) => {
    const profiles = await this.profileRepository.get_all_profiles(user_id);
    return profiles;
  }

}

export default ProfileService;
