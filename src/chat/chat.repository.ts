import prisma from "../prisma.client.js";

export class ChatRepository {
  constructor() {}
  get_chats_by_profile_id = async (profileID: string) => {
    return await prisma.chat.findMany({
      where: {
        profileID,
      },
      orderBy: {
        created_at: "desc",
      }
    })
  }
  create_chat = async (profileID: string, title: string) => {
    return await prisma.chat.create({
      data: {
        profileID,
        title,
      }
    })
  }

  delete_chat = async (chatID: string) => {
    await prisma.chat.delete({
      where: {
        id: chatID,
      },
    })
  }

  get_conversations_by_chat_id = async (chatID: string) => {
    return await prisma.searchHistory.findMany({
      where: {
        chatID,
      },
      orderBy: {
        created_at: "asc",
      }
    })
  }
}
