import ollama from "ollama";


class RAGService {
  constructor() {}

  generateResponse = async (context: string, query: string) => {
    try {
      const prompt = `
      You are a high-precision retrieval-based AI assistant for a personal memory system.

      Your job is to answer using ONLY the provided context.

      ---

      ## RULES

      1. Use ONLY the provided context.
      2. You MUST NOT use external knowledge.
      3. You MUST NOT hallucinate facts that are not supported.
      4. If relevant information exists in context, you MAY infer meaning from it.
      5. If NO relevant information exists at all, respond:
        "I cannot find this information in the provided context."
      6. Treat context as factual user data (emails, messages, logs).
      7. Ignore irrelevant or noisy content.

      ---

      ## RESPONSE STYLE

      - Be concise and direct.
      - Do not mention "context".
      - Do not refuse unless absolutely no relevant data exists.
      - Prefer interpretation over rejection when partial matches exist.

      ---

      ## CONTEXT
      ${context}

      ---

      ## QUESTION
      ${query}

      ---

      ## ANSWER
      `;

      const response = await ollama.chat({
        model: process.env.RAG_MODEL ?? "context-search-rag",
        messages: [
          {role: "user", content: prompt}
        ],
      })

      return response.message.content ?? "No response generated";

    } catch (error) {
      throw new Error("Failed to generate response");
    }
  }
}

export default RAGService;
