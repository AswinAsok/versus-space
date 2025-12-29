/**
 * Generate a URL-friendly slug from a title
 * @param title - The title to convert to a slug
 * @returns A URL-friendly slug
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    // Replace special characters with empty string
    .replace(/[^a-z0-9\s-]/g, '')
    // Replace spaces with hyphens
    .replace(/\s+/g, '-')
    // Remove consecutive hyphens
    .replace(/-+/g, '-')
    // Remove leading/trailing hyphens
    .replace(/^-|-$/g, '')
    // Limit length to 50 characters
    .slice(0, 50);
}

/**
 * Generate a unique slug by appending a short random suffix
 * @param title - The title to convert to a slug
 * @returns A unique URL-friendly slug
 */
export function generateUniqueSlug(title: string): string {
  const baseSlug = generateSlug(title);
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  return `${baseSlug}-${randomSuffix}`;
}
