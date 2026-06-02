import prisma from "../prisma.client.js";

class SearchRepository {
  async hybridSearch(
    queryText: string,
    queryVector: number[],
    limit: number = 10,
  ) {
    const vectorString = `[${queryVector.join(",")}]`;
    const candidateLimit = Math.max(limit * 5, 50);

    return prisma.$queryRaw`
      WITH candidates AS (
        SELECT
          cc.id,
          cc.content,
          cc."communicationID",
          e.vector <=> ${vectorString}::vector AS distance,
          ts_rank_cd(
            to_tsvector('english', COALESCE(cc.content, '') || ' ' || COALESCE(cast(c.metadata->>'subject' AS text), '')),
            plainto_tsquery('english', ${queryText})
          ) AS keyword_score,
          COALESCE((c.metadata->>'importance')::double precision, 0.5) AS importance,
          COALESCE(c.metadata->>'category', 'important') AS category
        FROM "Embedding" e
        JOIN "CommunicationChunk" cc ON e."chunkID" = cc.id
        JOIN "Communication" c ON cc."communicationID" = c.id
        WHERE COALESCE((c.metadata->>'indexable')::boolean, true) = true
      )
      SELECT
        id,
        content,
        "communicationID",
        distance,
        keyword_score,
        importance,
        category,
        (
          (0.55 * (1 / (1 + distance))) +
          (0.30 * keyword_score) +
          (0.15 * importance) +
          CASE category
            WHEN 'article' THEN 0.06
            WHEN 'forum' THEN 0.04
            WHEN 'important' THEN 0.03
            WHEN 'social' THEN -0.02
            WHEN 'course' THEN -0.08
            WHEN 'job' THEN -0.08
            WHEN 'promotion' THEN -0.15
            WHEN 'newsletter' THEN -0.12
            WHEN 'ad' THEN -0.18
            WHEN 'spam' THEN -0.25
            ELSE 0
          END
        ) AS score
      FROM candidates
      ORDER BY score DESC
      LIMIT ${candidateLimit};
    `;
  }
}

export default SearchRepository;
