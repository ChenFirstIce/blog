export interface MarkdownHeading {
  level: number;
  text: string;
  id: string;
}

export function generateHeadingId(text: string): string {
  return text.toLowerCase()
    .trim()
    .replace(/[^\u4e00-\u9fa5a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-') || 'heading';
}

export function stripMarkdown(md: string): string {
  return md
    .replace(/\[(.*?)\]\(.*?\)/g, '$1')
    .replace(/[*_~`]/g, '')
    .replace(/<[^>]*>/g, '')
    .trim();
}

export function getUniqueHeadingId(text: string, counts: Map<string, number>): string {
  const baseId = generateHeadingId(text);
  const count = (counts.get(baseId) ?? 0) + 1;
  counts.set(baseId, count);
  return count === 1 ? baseId : `${baseId}-${count}`;
}

export function extractMarkdownHeadings(content: string): MarkdownHeading[] {
  const headingRegex = /^(#{1,6})\s+(.*)$/gm;
  const headings: MarkdownHeading[] = [];
  const counts = new Map<string, number>();
  let match;

  while ((match = headingRegex.exec(content)) !== null) {
    const level = match[1].length;
    const text = stripMarkdown(match[2]);
    const id = getUniqueHeadingId(text, counts);
    headings.push({ level, text, id });
  }

  return headings;
}
