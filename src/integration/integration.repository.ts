import z from "zod";
import prisma from "../prisma.client.js";
import { Store_Integration_Request } from "./integration.request.js";

class IntegrationRepository {
  store_integration_data = async (
    data: z.infer<typeof Store_Integration_Request>,
  ) => {
    try {
      return await prisma.integration.create({
        data: {
          profileID: data.profileID,
          type: data.type,
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
        },
      });
    } catch (error) {
      throw new Error("Failed to store integration data");
    }
  };
}

export default IntegrationRepository;
