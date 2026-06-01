import prisma from "../prisma.client.js";

class SearchRepository {
  async semanticSearch(queryVector: number[], limit: number = 10) {
    const vectorString = `[${queryVector.join(",")}]`;

    const results = await prisma.$queryRawUnsafe(`
        Select
          cc.id,
          cc.content,
          cc."communicationID",
          e.vector <=> '${vectorString}'::vector AS distance
        From "Embedding" e
        Join "CommunicationChunk" cc ON e."chunkID" = cc.id
        Order By distance ASC
        Limit ${limit};
      `);

    return results;
  }
}

export default SearchRepository;
