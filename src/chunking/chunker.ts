// Pure chunking helper: split text into chunks with paragraph/sentence preference,
// character-safe boundaries, and optional overlap.

export function chunkText(
  content: string,
  maxSize = 1000,
  overlap = 200,
): string[] {
  if (!content) return [];

  // Normalize newlines and whitespace
  let src = content.replace(/\r\n/g, "\n");
  src = src.replace(/\t/g, " ").replace(/ +/g, " ").trim();

  // Split into paragraphs first (prefer keeping paragraphs intact)
  const paragraphs = src
    .split(/\n\s*\n+/)
    .map((p) => p.trim())
    .filter(Boolean);

  // Split paragraphs into sentences heuristically
  const segments: string[] = [];
  for (const para of paragraphs) {
    // split on sentence enders followed by space (keeps punctuation)
    const sents = para.split(/(?<=[.!?])\s+/);
    for (const s of sents) {
      const t = s.trim();
      if (t) segments.push(t);
    }
  }

  const chunks: string[] = [];
  let current = "";

  const pushCurrent = () => {
    if (current) {
      chunks.push(current.trim());
      current = "";
    }
  };

  const pushLongWithSplit = (text: string) => {
    // split long text into overlapping slices
    const step = Math.max(1, maxSize - overlap);
    for (let i = 0; i < text.length; i += step) {
      const part = text.slice(i, i + maxSize).trim();
      if (part) chunks.push(part);
      if (i + maxSize >= text.length) break;
    }
  };

  for (const seg of segments) {
    // if segment alone too large, flush current and split the segment
    if (seg.length > maxSize) {
      pushCurrent();
      pushLongWithSplit(seg);
      continue;
    }

    const candidate = current ? `${current}\n${seg}` : seg;
    if (candidate.length <= maxSize) {
      current = candidate;
    } else {
      // finalize current and start new
      pushCurrent();
      current = seg;
    }
  }

  pushCurrent();

  // Ensure no chunk exceeds maxSize (safety) and add small overlap between chunks
  if (overlap > 0) {
    const adjusted: string[] = [];
    for (let i = 0; i < chunks.length; i++) {
      const c = chunks[i] ?? "";
      if (!c) continue;
      if (c.length > maxSize) {
        // fallback split
        for (let j = 0; j < c.length; j += Math.max(1, maxSize - overlap)) {
          adjusted.push(c.slice(j, j + maxSize).trim());
        }
      } else {
        if (i > 0 && adjusted.length > 0) {
          const prev = adjusted[adjusted.length - 1] ?? "";
          const tail = c.slice(0, overlap).trim();
          if (tail) adjusted[adjusted.length - 1] = `${prev}\n${tail}`.trim();
          // keep c as-is (no duplication of full content)
        }
        adjusted.push(c);
      }
    }
    return adjusted.map((s) => s.trim()).filter(Boolean);
  }

  return chunks.map((s) => s.trim()).filter(Boolean);
}

export default chunkText;
