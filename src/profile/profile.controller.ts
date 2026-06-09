import express from "express";
import z from "zod";
import { Create_Profile_Request } from "./profile.request.js";
// dependencies
import ProfileService from "./profile.service.js";
import { userInfo } from "node:os";

class ProfileController {
  constructor(private profileService: ProfileService) {
    this.profileService = profileService;
  }

  create_profile = async (req: express.Request, res: express.Response) => {
    try {
      const profile_data: z.infer<typeof Create_Profile_Request> = Create_Profile_Request.parse(req.body);
      profile_data.user_id = req.user.user_id;

      const new_profile = await this.profileService.create_profile(profile_data);

      res.status(201).json({
        status: "success",
        message: "Profile created successfully",
        data: new_profile,
      });

    } catch (error: any) {
      res.status(400).json({
        status: "error",
        message: error.message,
      });
    }
  }

  delete_profile = async (req: express.Request, res: express.Response) => {
    try {
      const profileId: string | string[] = req.params.profileId;
      await this.profileService.delete_profile(profileId);
      res.status(200).json({
        status: "success",
        message: "Profile deleted successfully",
      });
    } catch (error) {
      res.status(400).json({
        status: "error",
        message: error instanceof Error ? error.message : "An error occurred while deleting the profile",
      });
    }
  }

  get_all_profiles = async (req: express.Request, res: express.Response) => {
    try {
      const user_id = req.user.user_id;
      const profiles = await this.profileService.get_all_profiles(user_id);
      res.status(200).json({
        status: "success",
        message: "Profiles retrieved successfully",
        data: profiles,
        user_id: user_id,
      });
    } catch (error: any) {
        res.status(400).json({
        status: "error",
        message: error.message,
      });
    }
  }

}

export default ProfileController;
