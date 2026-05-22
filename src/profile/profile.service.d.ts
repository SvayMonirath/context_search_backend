import z from "zod";
import { Create_Profile_Request } from "./profile.request.js";
import ProfileRepository from "./profile.repository.js";
declare class ProfileService {
    private profileRepository;
    constructor(profileRepository: ProfileRepository);
    create_profile: (profile_data: z.infer<typeof Create_Profile_Request>) => Promise<{
        user_id: string;
        id: string;
        created_at: Date;
        name: string;
    }>;
}
export default ProfileService;
//# sourceMappingURL=profile.service.d.ts.map