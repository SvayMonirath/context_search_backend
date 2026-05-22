import express from "express";
import z from "zod";
import { Create_Profile_Request } from "./profile.request.js";
// dependencies
import ProfileService from "./profile.service.js";
class ProfileController {
    profileService;
    constructor(profileService) {
        this.profileService = profileService;
        this.profileService = profileService;
    }
    create_profile = async (req, res) => {
        try {
            const profile_data = Create_Profile_Request.parse(req.body);
            profile_data.user_id = req.user.user_id;
            const new_profile = await this.profileService.create_profile(profile_data);
            res.status(201).json({
                status: "success",
                message: "Profile created successfully",
                data: new_profile,
            });
        }
        catch (error) {
            res.status(400).json({
                status: "error",
                message: error.message,
            });
        }
    };
}
export default ProfileController;
//# sourceMappingURL=profile.controller.js.map