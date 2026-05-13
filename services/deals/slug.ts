export function slugifyDealTitle(title: string) {
  return title
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

export function buildDealSlug(title: string, fallback: string) {
  const slug = slugifyDealTitle(title);

  return slug || fallback.toLowerCase();
}
