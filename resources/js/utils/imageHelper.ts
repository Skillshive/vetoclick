import { log } from "console";

/**
 * Get the full URL for an image path
 * @param path - The image path from storage
 * @param fallback - Fallback image URL if path is null or empty
 * @returns The full image URL
 */
export function getImageUrl(path: string | null, fallback: string = "/assets/default/person-placeholder.jpg"): string {
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
export function getUserAvatarUrl(user: any) {
  return getImageUrl(user?.image?.path || null);
}

/**
 * Get avatar URL for a pet
 * @param pet - Pet object with image property
 * @returns The avatar URL
 */
export function getPetAvatarUrl(pet: any) {
  // If profile_img is a File object, create a blob URL
  if (pet?.profile_img instanceof File) {
    return URL.createObjectURL(pet.profile_img);
  }
  // If it's a string path, use getImageUrl
  const path = pet?.profile_img || null;
  return getImageUrl(path, "/assets/default/species-placeholder.png");
}