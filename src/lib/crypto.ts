/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Computes a secure SHA-256 hash with a domain salt for password storage.
 * Passwords are never stored in plain text.
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = 'smartclassroom_secure_salt_2026_';
  const encoder = new TextEncoder();
  const data = encoder.encode(salt + password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function verifyPassword(password: string, expectedHash: string): Promise<boolean> {
  const hash = await hashPassword(password);
  return hash === expectedHash;
}
