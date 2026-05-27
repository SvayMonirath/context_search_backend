import prisma from "../prisma.client.js";

class CommunicationRepository {
  save_email = async (profileID: string, integrationID: string, email: any) => {
    try {
      const externalID = email.id ?? null;

      // If this message already exists for the same integration, skip create.
      if (externalID) {
        const existingEmail = await prisma.communication.findFirst({
          where: {
            integrationID,
            externalID,
          },
        });

        if (existingEmail) {
          return existingEmail;
        }
      }

      return prisma.communication.create({
        data: {
          profileID,
          integrationID,

          type: "EMAIL",
          externalID,
          sender: email.from ?? "Unknown sender",
          content: email.body ?? "",
          sent_at: new Date(Number(email.internalDate)),
          metadata: {
            subject: email.subject,
            snippet: email.snippet,
            labelIds: email.labelIds,
          },
        },
      });
    } catch (error: any) {
      throw new Error("Failed to save email: " + error.message);
    }
  };
}

export default CommunicationRepository;
