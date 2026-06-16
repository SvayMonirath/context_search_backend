import prisma from "../prisma.client.js";

class SearchRepository {
async hybridSearch(
  queryText: string,
  queryVector: number[],
  limit: number = 10,
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

        (1 - (e.vector <=> ${vectorString}::vector)) AS vector_score,

        ts_rank_cd(
          to_tsvector(
            'english',
            CONCAT_WS(
              ' ',
              COALESCE(cc.content, ''),
              COALESCE(c.sender, ''),
              COALESCE(c.metadata->>'subject', ''),
              COALESCE(c.metadata->>'chat_title', 'Untitled Chat')
            )
          ),
          plainto_tsquery('english', ${queryText})
        ) AS keyword_score

      FROM "Embedding" e
      JOIN "CommunicationChunk" cc ON e."chunkID" = cc.id
      JOIN "Communication" c ON cc."communicationID" = c.id

      WHERE COALESCE((c.metadata->>'indexable')::boolean, true) = true
    ),

    scored AS (
      SELECT
        *,

        (
          (0.65 * vector_score) +
          (0.20 * LEAST(keyword_score, 1.0)) +
          (0.10 * importance) +

          CASE
            WHEN LOWER(sender) LIKE LOWER('%' || ${queryText} || '%')
            THEN 0.05 ELSE 0
          END +

          CASE category
            WHEN 'important' THEN 0.05
            WHEN 'article' THEN 0.03
            WHEN 'forum' THEN 0.02
            WHEN 'social' THEN -0.02
            WHEN 'course' THEN -0.05
            WHEN 'job' THEN -0.05
            WHEN 'newsletter' THEN -0.08
            WHEN 'promotion' THEN -0.15
            WHEN 'ad' THEN -0.20
            WHEN 'spam' THEN -0.40
            ELSE 0
          END
        ) AS score

      FROM candidates
    )

    SELECT *
    FROM scored
    WHERE category NOT IN ('spam', 'ad')
    ORDER BY score DESC
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
