// SHA-256 Hash of Admin Code '16112001'
// Note: Plain text '16112001' is NEVER stored in source code!
const ADMIN_CODE_HASH =
  'bbaca59c2b2c33ca8bd3bfd54e80e55e0e69bc6bfbcb7e9fc9cb80b7b696a240';

const UNLOCK_STORAGE_KEY = 'cav_admin_session_unlocked';

export async function hashString(str: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  return hashHex;
}

export async function verifyAdminCode(inputCode: string): Promise<boolean> {
  const hashedInput = await hashString(inputCode.trim());
  return hashedInput === ADMIN_CODE_HASH;
}

export function isAdminUnlocked(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return sessionStorage.getItem(UNLOCK_STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

export function setAdminUnlocked(unlocked: boolean): void {
  if (typeof window === 'undefined') return;
  try {
    if (unlocked) {
      sessionStorage.setItem(UNLOCK_STORAGE_KEY, 'true');
    } else {
      sessionStorage.removeItem(UNLOCK_STORAGE_KEY);
    }
  } catch (err) {
    console.error('SessionStorage admin write error:', err);
  }
}
