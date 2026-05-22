import express from "express";
import ProfileService from "./profile.service.js";
declare class ProfileController {
    private profileService;
    constructor(profileService: ProfileService);
    create_profile: (req: express.Request, res: express.Response) => Promise<void>;
}
export default ProfileController;
//# sourceMappingURL=profile.controller.d.ts.map