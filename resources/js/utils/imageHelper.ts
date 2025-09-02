import { log } from "console";

/**
 * Get the full URL for an image path
 * @param path - The image path from storage
 * @param fallback - Fallback image URL if path is null or empty
 * @returns The full image URL
 */
export function getImageUrl(path: string | null, fallback: string = "/assets/default/person-placeholder.jpg"): string {
console.log('cc ',path);

    if (!path) {
    return fallback;
  }

  if (path.startsWith('http')) {
    return path;
  }

  return `/storage/${path}`;
}

/**
 * Get avatar URL for a user
 * @param user - User object with image property
 * @returns The avatar URL
 */
export function getUserAvatarUrl(user) {
    console.log('path',user);
  return getImageUrl(user?.image?.path || null);
}