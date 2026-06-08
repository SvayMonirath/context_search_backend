import express  from 'express';
import { ChatService } from './chat.service.js';

export class ChatController {
  constructor(private chatService: ChatService) {}

  createChat = async (req: express.Request, res: express.Response) => {
    try {
      const profileId = req.body.profileId;

      await this.chatService.createChat(profileId as string);

      res.status(201).json({
        status: "success",
        message: "Chat created successfully"
      });
    } catch (error) {
      console.error("Error creating chat:", error);
      res.status(500).json({
        status: "error",
        message: "Failed to create chat"
      });
    }
  }

  getConversations = async (req: express.Request, res: express.Response) => {
    try {
      const chatId = req.query.chatId;
      const conversations = await this.chatService.getConversations(chatId as string);
      res.status(200).json({
        status: "success",
        message: "Conversations fetched successfully",
        data: conversations
      });
    } catch (error) {
      console.error("Error fetching conversations:", error);
      res.status(500).json({
        status: "error",
        message: "Failed to fetch conversations"
      });
    }
  }

  getChats = async (req: express.Request, res: express.Response) => {
    try {
      const profileId = req.query.profileId;

      const chats = await this.chatService.getChatsByProfileId(profileId as string);
      res.status(200).json({
        status: "success",
        message: "Chats fetched successfully",
        data: chats
      });
    } catch (error) {
      console.error("Error fetching chats:", error);
      res.status(500).json({
        status: "error",
        message: "Failed to fetch chats"
      });
    }
  }
}
