import prisma from "../prisma.client.js";

export class SearchHistoryRepository {
  async save_search_history(chatID: string, profileID: string, query: string, results: any[], response: string) {
    return await prisma.searchHistory.create({
      data: {
        chatID,
        profileID,
        query,
        results,
        response,
      }
    })
  }
}
