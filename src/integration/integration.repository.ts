import z from "zod";
import prisma from "../prisma.client.js";
import { Store_Integration_Request } from "./integration.request.js";
import { IntegrationType, Prisma, type Integration } from '@prisma/client';

class IntegrationRepository {
  disconnect_integration = async (integration_id: string) => {
    return await prisma.integration.update({
      where: {
        id: integration_id
      },
      data: {
        isActive: false,
        accessToken: null,
      }
    })
  }

  store_integration_data = async (
    data: z.infer<typeof Store_Integration_Request>,
  ) => {
    try {
      if(data.type === IntegrationType.GMAIL) {
          return await prisma.integration.create({
            data: {
              profileID: data.profileID,
              type: data.type,
              isActive: data.isActive,
              accessToken: data.accessToken,
              refreshToken: data.refreshToken,
            },
          });
      }
    } catch (error) {
      throw new Error("Failed to store integration data");
    }
  };

  get_gmail_integration = async (profile_id: string ) => {
    return await prisma.integration.findFirst({
      where: {
        profileID: profile_id,
        type: IntegrationType.GMAIL,
      }
    })
  }

  get_telegram_integration = async (profile_id: string ) => {
    return await prisma.integration.findFirst({
      where: {
        profileID: profile_id,
        type: IntegrationType.TELEGRAM,
      }
    })
  }

  store_telegram_integration = async (profile_id: string, phone: string) => {
    return await prisma.integration.create({
      data: {
        profileID: profile_id,
        type: IntegrationType.TELEGRAM,
        metadata: {
          phone: phone,
          status: "INIT",
        }
      },
    });
  }

  get_active_gmail_integration = async (profile_id: string ) => {
    return await prisma.integration.findFirst({
      where: {
        profileID: profile_id,
        type: IntegrationType.GMAIL,
        refreshToken: {
          not: null,
        },
        accessToken: {
          not: null,
        },
        isActive: true,
      }
    })
  }

  get_inactive_gmail_integration = async (profile_id: string ) => {
     return await prisma.integration.findFirst({
      where: {
        profileID: profile_id,
        type: IntegrationType.GMAIL,
        isActive: false,
        refreshToken: {
          not: null,
        },
      }
    })
   }

  get_integration_by_id = async (integration_id: string) => {
    return await prisma.integration.findUnique({
      where: {
        id: integration_id,
      }
    })
  }

  get_integrations_by_profile_id = async (profile_id: string) => {
    return await prisma.integration.findMany({
      where: {
        profileID: profile_id,
      }
    });
  }

  get_active_integration = async (profile_id: string, type: IntegrationType) => {
    return await prisma.integration.findFirst({
      where: {
        profileID: profile_id,
        type: type,
        isActive: true,
      }
    })
  }

  update_integration = async (integration_id: string, data: Prisma.IntegrationUpdateInput) => {
    try {
      return await prisma.integration.update({
        where: {
          id: integration_id,
        },
        data: data,
      });
    } catch (error) {
      throw new Error("Failed to update integration data");
    }
  };

  update_integration_token = async (
    profile_id: string,
    integration: any,
    data: Partial<z.infer<typeof Store_Integration_Request>>,
  ) => {
    try {
      return await prisma.integration.update({
        where: {
          id: integration.id,
        },
        data: {
          isActive: true,
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
        }
      });
    } catch (error) {
      throw new Error("Failed to update integration data");
    }
  };

  get_active_telegram_integration = async (profile_id: string ) => {
    try {
      return await prisma.integration.findFirst({
        where: {
          profileID: profile_id,
          type: IntegrationType.TELEGRAM,
          isActive: true,
        },
      });
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  delete_integration = async (integration_id: string, type: IntegrationType) => {
    try {
      if(type === IntegrationType.GMAIL) {
        await prisma.integration.update({
          where: {
            id: integration_id,
          },
          data: {
            isActive: false,
            accessToken: null,
            refreshToken: null,
          }
        });
      }
    } catch (error: any) {
      throw new Error(error.message);
    }
  }
}

export default IntegrationRepository;
