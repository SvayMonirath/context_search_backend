import prisma from "../prisma.client.js";

class SearchRepository {
  async hybridSearch(
    queryText: string,
    queryVector: number[],
    limit: number = 6, // IMPORTANT: reduce default
  ) {
    const vectorString = `[${queryVector.join(",")}]`;

    const candidateLimit = Math.max(limit * 5, 50);

    const results: any[] = await prisma.$queryRaw`
      WITH candidates AS (
        SELECT
          cc.id,
          cc.content,
          cc."communicationID",

          -- Vector distance (lower = better)
          e.vector <=> ${vectorString}::vector AS distance,

          -- Keyword match
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
      ),

      scored AS (
        SELECT
          *,

          -- Normalize vector similarity (convert distance → similarity)
          (1 / (1 + distance)) AS vector_score,

          -- Normalize keyword score (safe clamp)
          LEAST(keyword_score, 1.0) AS keyword_score_norm,

          -- Final score
          (
            (0.55 * (1 / (1 + distance))) +
            (0.30 * LEAST(keyword_score, 1.0)) +
            (0.15 * importance) +

            CASE category
              WHEN 'article' THEN 0.06
              WHEN 'forum' THEN 0.04
              WHEN 'important' THEN 0.03

              WHEN 'social' THEN -0.05
              WHEN 'course' THEN -0.10
              WHEN 'job' THEN -0.10
              WHEN 'newsletter' THEN -0.15
              WHEN 'promotion' THEN -0.20
              WHEN 'ad' THEN -0.25
              WHEN 'spam' THEN -0.40

              ELSE 0
            END
          ) AS score

        FROM candidates
      )

      SELECT *
      FROM scored
      WHERE
        score > 0.15
        AND category != 'spam'
        AND category != 'ad'
        AND category != 'promotion'

      ORDER BY score DESC
      LIMIT ${candidateLimit};
    `;

    // ---------------------------------------------------
    // 🧠 POST-PROCESSING (IMPORTANT FIX LAYER)
    // ---------------------------------------------------

    const filtered = this.applyDiversityFilter(results, limit);

    return filtered;
  }

  /**
   * Prevents same-category domination (VERY IMPORTANT)
   */
  private applyDiversityFilter(results: any[], limit: number) {
    const seenCategories = new Map<string, number>();
    const final: any[] = [];

    for (const item of results) {
      const cat = item.category || "unknown";
      const count = seenCategories.get(cat) || 0;

      // allow max 2 per category
      if (count >= 2) continue;

      final.push(item);
      seenCategories.set(cat, count + 1);

      if (final.length >= limit) break;
    }

    return final;
  }
}

export default SearchRepository;
