import { Create_Profile_Request } from "./profile.request.js";
import z from "zod";
declare class ProfileRepository {
    get_profile_by_name(name: string): Promise<{
        user_id: string;
        id: string;
        created_at: Date;
        name: string;
    } | null>;
    create_profile(profile_data: z.infer<typeof Create_Profile_Request>): Promise<{
        user_id: string;
        id: string;
        created_at: Date;
        name: string;
    }>;
}
export default ProfileRepository;
//# sourceMappingURL=profile.repository.d.ts.map