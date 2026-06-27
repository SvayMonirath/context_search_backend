import { MemoryRuleType, MemoryScope } from "@prisma/client";

export const matchesMemoryRules = (
  message: {
    sender: string;
    content: string;
    integrationID: string;
  },
  rules: any[],
) => {
  for (const rule of rules) {
    if (!rule.isActive) continue;

    const appliesToIngestion =
      rule.scope === "INGESTION" || rule.scope === "BOTH";

    const appliesToRetrieval =
      rule.scope === "RETRIEVAL" || rule.scope === "BOTH";

    // BLOCK SENDER
    if (rule.type === "BLOCK_SENDER") {
      if (rule.value.includes(message.sender)) {
        return { blocked: true, rule };
      }
    }

    // BLOCK INTEGRATION
    if (rule.type === "BLOCK_INTEGRATION") {
      if (rule.value.includes(message.integrationID)) {
        return { blocked: true, rule };
      }
    }

    // BLOCK KEYWORD
    if (rule.type === "BLOCK_KEYWORD") {
      for (const keyword of rule.value) {
        if (message.content.includes(keyword)) {
          return { blocked: true, rule };
        }
      }
    }
  }

  return { blocked: false, rule: null };
};
