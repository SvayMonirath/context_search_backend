import z from "zod";
import prisma from "../prisma.client.js";
import { Store_Integration_Request } from "./integration.request.js";
class IntegrationRepository {
    store_integration_data = async (data) => {
        try {
            return await prisma.integration.create({
                data: {
                    profileID: data.profileID,
                    type: data.type,
                    accessToken: data.accessToken,
                    refreshToken: data.refreshToken,
                },
            });
        }
        catch (error) {
            throw new Error("Failed to store integration data");
        }
    };
    get_gmail_integration = async (profile_id) => {
        return await prisma.integration.findFirst({
            where: {
                profileID: profile_id,
                type: "GMAIL",
            }
        });
    };
    update_integration_token = async (profile_id, data) => {
        try {
            return await prisma.integration.updateMany({
                where: {
                    profileID: profile_id,
                    type: "GMAIL",
                },
                data: {
                    accessToken: data.accessToken,
                    refreshToken: data.refreshToken,
                }
            });
        }
        catch (error) {
            throw new Error("Failed to update integration data");
        }
    };
}
export default IntegrationRepository;
//# sourceMappingURL=integration.repository.js.map