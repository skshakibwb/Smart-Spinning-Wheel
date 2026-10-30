/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Compresses an image file to a lightweight data URI (<12KB)
 * Safe for storing in Firestore documents on the Firebase Spark free plan.
 */
export async function compressImageToDataUri(
  file: File,
  maxWidth = 140,
  maxHeight = 140,
  quality = 0.8
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return resolve(e.target?.result as string);
        }

        ctx.drawImage(img, 0, 0, width, height);

        // Try WebP first for lowest byte size; fallback to JPEG
        let dataUri = canvas.toDataURL('image/webp', quality);
        if (!dataUri.startsWith('data:image/webp')) {
          dataUri = canvas.toDataURL('image/jpeg', quality);
        }
        resolve(dataUri);
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Deterministic color palette for avatar backgrounds based on student/teacher name
 */
const AVATAR_GRADIENTS = [
  ['#3B82F6', '#1D4ED8'], // Blue
  ['#8B5CF6', '#6D28D9'], // Purple
  ['#EC4899', '#BE185D'], // Pink
  ['#10B981', '#047857'], // Emerald
  ['#F59E0B', '#B45309'], // Amber
  ['#06B6D4', '#0E7490'], // Cyan
  ['#6366F1', '#4338CA'], // Indigo
  ['#14B8A6', '#0F766E'], // Teal
];

export function getAvatarColor(name: string): [string, string] {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % AVATAR_GRADIENTS.length;
  return AVATAR_GRADIENTS[index] as [string, string];
}

/**
 * Returns initials from a full name (e.g., "Sarah Rahman" -> "SR")
 */
export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0 || !parts[0]) return 'SC';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
