import prisma from "../prisma.client.js";
import { Create_Profile_Request } from "./profile.request.js";
import z from "zod";
class ProfileRepository {
    async get_profile_by_name(name) {
        const profile = await prisma.profile.findUnique({
            where: {
                name,
            },
        });
        return profile;
    }
    async create_profile(profile_data) {
        const new_profile = await prisma.profile.create({
            data: {
                name: profile_data.name,
                user_id: profile_data.user_id,
            },
        });
        return new_profile;
    }
}
export default ProfileRepository;
//# sourceMappingURL=profile.repository.js.map