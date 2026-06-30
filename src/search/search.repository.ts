
import UserRepository from "../authentication/user.repository.js";
import prisma from "../prisma.client.js";
import { MasterEncryptionService } from "../security/master-encryption.service.js";
import { UserEncryptionFactory } from "../security/user-encryption.factory.js";
import { matchesMemoryRules } from "../utils/memoryRules.utils.js";


class SearchRepository {

async hybridSearch(
  queryText: string,
  queryVector: number[],
  limit: number = 10,
  profileID: string,
) {
  const vectorString = `[${queryVector.join(",")}]`;
  const candidateLimit = Math.max(limit * 8, 80);

  const results: any[] = await prisma.$queryRaw`
    WITH candidates AS (
      SELECT
        cc.id,
        cc.content,
        cc."communicationID",

        c.sender,
        c.type,
        c.sent_at,
        c.created_at,

        COALESCE(c.metadata->>'chat_title', '') AS chat_title,
        COALESCE(c.metadata->>'subject', '') AS subject,
        COALESCE(c.metadata->>'category', 'important') AS category,
        COALESCE((c.metadata->>'importance')::double precision, 0.5) AS importance,

        (1 - (e.vector <=> ${vectorString}::vector)) AS vector_score

      FROM "Embedding" e
      JOIN "CommunicationChunk" cc ON e."chunkID" = cc.id
      JOIN "Communication" c ON cc."communicationID" = c.id

      WHERE COALESCE((c.metadata->>'indexable')::boolean, true) = true
    )

    SELECT *
    FROM candidates
    ORDER BY vector_score DESC
    LIMIT ${candidateLimit};
  `;

  return this.applyDiversityFilter(results, limit);
}

private applyDiversityFilter(results: any[], limit: number) {
  const categoryCount = new Map<string, number>();
  const seenCommunications = new Set<string>();

  const final: any[] = [];

  for (const item of results) {
    const category = item.category || "unknown";
    const currentCount = categoryCount.get(category) || 0;

    // softer constraint
    const maxPerCategory = Math.ceil(limit * 0.8);

    if (currentCount >= maxPerCategory) continue;
    if (seenCommunications.has(item.communicationID)) continue;

    seenCommunications.add(item.communicationID);
    categoryCount.set(category, currentCount + 1);

    final.push(item);

    if (final.length >= limit) break;
  }

  return final;
}
}

export default SearchRepository;
