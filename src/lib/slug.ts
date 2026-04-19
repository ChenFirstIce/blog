export function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^\p{Script=Han}a-z0-9]+/gu, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
}

export function filenameToSlug(path: string): string {
  const filename = path.split(/[\\/]/).pop() ?? path;
  const stem = filename.replace(/\.mdx?$/i, '');
  return slugify(stem);
}
