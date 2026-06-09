import { ChatRepository } from "./chat.repository.js"

export class ChatService {
  constructor(private chatRepository: ChatRepository) {}
  createChat = async (profileId: string) => {

    const existingChats = await this.chatRepository.get_chats_by_profile_id(profileId);
    const title = `Chat ${existingChats.length + 1}`;

    return await this.chatRepository.create_chat(profileId, title);
  };

  getConversations = async (chatId: string) => {
    return await this.chatRepository.get_conversations_by_chat_id(chatId);
  }

  getChatsByProfileId = async (profileId: string) => {
    return await this.chatRepository.get_chats_by_profile_id(profileId);
  };

  deleteChat = async (chatId: string) => {
    return await this.chatRepository.delete_chat(chatId);
  }
}
