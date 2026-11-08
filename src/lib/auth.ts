import { LandlordProfile } from '@/types/database';
import { isSupabaseConfigured, supabase } from './supabase/client';
import { getSettings, saveSettings, cleanLocalStorageBusinessData } from './storage';

export const DEFAULT_OWNER_PIN = '123456';
export const AUTH_SESSION_KEY = 'kontrakin_auth_session';
export const LEGACY_AUTH_SESSION_KEY = 'sewapribadi_auth_session';
export const AUTH_COOKIE_NAME = 'kontrakin_auth_token';
export const LEGACY_AUTH_COOKIE_NAME = 'sewapribadi_auth_token';
export const PROFILE_SESSION_KEY = 'kontrakin_landlord_profile';
export const LEGACY_PROFILE_SESSION_KEY = 'sewapribadi_landlord_profile';

export interface SessionPayload {
  authenticated: boolean;
  userId?: string;
  email?: string;
  loggedInAt: string;
  expiresAt: string;
}

/**
 * Sanitizes an input string into a URL-friendly slug.
 * Example: "Kontrakan Romang Polong 01" -> "kontrakan-romang-polong-01"
 */
export function formatSlug(input: string): string {
  if (!input) return '';
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Generates a unique, non-colliding slug from a business name.
 * If the base slug already exists in `existingSlugs`, it automatically appends `-2`, `-3`, etc.
 */
export function generateUniqueSlug(baseName: string, existingSlugs: string[] = []): string {
  const base = formatSlug(baseName) || 'kontrakan';
  const normalizedExisting = new Set(existingSlugs.map((s) => s.toLowerCase()));

  if (!normalizedExisting.has(base.toLowerCase())) {
    return base;
  }

  let counter = 2;
  while (normalizedExisting.has(`${base}-${counter}`.toLowerCase())) {
    counter++;
  }
  return `${base}-${counter}`;
}

/**
 * Checks whether a given path is a public page accessible to guests & prospective tenants.
 */
export function isPublicPath(pathname: string): boolean {
  if (!pathname) return true;
  if (pathname === '/') return true; // Root is public landing page (or dashboard when auth)
  return (
    pathname === '/login' ||
    pathname.startsWith('/login') ||
    pathname === '/register' ||
    pathname.startsWith('/register') ||
    pathname.startsWith('/katalog') ||
    pathname.startsWith('/sewa') ||
    pathname.startsWith('/kontrak')
  );
}

/**
 * Checks if the owner is currently authenticated in the browser.
 */
export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') return false;

  try {
    // 1. Check localStorage session (with legacy fallback)
    const raw =
      localStorage.getItem(AUTH_SESSION_KEY) ||
      localStorage.getItem(LEGACY_AUTH_SESSION_KEY);
    if (raw) {
      const session: SessionPayload = JSON.parse(raw);
      if (session.authenticated && new Date(session.expiresAt) > new Date()) {
        return true;
      }
    }

    // 2. Fallback check cookie (new or legacy)
    const hasCookie = document.cookie
      .split(';')
      .some((item) => {
        const trimmed = item.trim();
        return (
          trimmed.startsWith(`${AUTH_COOKIE_NAME}=`) ||
          trimmed.startsWith(`${LEGACY_AUTH_COOKIE_NAME}=`)
        );
      });

    return hasCookie;
  } catch {
    return false;
  }
}

/**
 * Retrieves the currently cached landlord profile from localStorage.
 */
export function getCachedProfile(): LandlordProfile | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw =
      localStorage.getItem(PROFILE_SESSION_KEY) ||
      localStorage.getItem(LEGACY_PROFILE_SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Sets the authenticated session in both localStorage and document.cookie.
 */
export function setAuthSession(
  rememberMe = true,
  userId?: string,
  email?: string,
  profile?: LandlordProfile | null
): void {
  if (typeof window === 'undefined') return;

  const durationDays = rememberMe ? 30 : 1;
  const expires = new Date();
  expires.setDate(expires.getDate() + durationDays);

  const payload: SessionPayload = {
    authenticated: true,
    userId,
    email,
    loggedInAt: new Date().toISOString(),
    expiresAt: expires.toISOString(),
  };

  localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(payload));
  if (profile) {
    localStorage.setItem(PROFILE_SESSION_KEY, JSON.stringify(profile));
  }

  // Set browser cookie for middleware/guards
  const maxAge = durationDays * 24 * 60 * 60;
  document.cookie = `${AUTH_COOKIE_NAME}=1; path=/; max-age=${maxAge}; SameSite=Lax`;
}

/**
 * Clears the authenticated session and cached profile.
 */
export function clearAuthSession(): void {
  if (typeof window === 'undefined') return;

  localStorage.removeItem(AUTH_SESSION_KEY);
  localStorage.removeItem(LEGACY_AUTH_SESSION_KEY);
  localStorage.removeItem(PROFILE_SESSION_KEY);
  localStorage.removeItem(LEGACY_PROFILE_SESSION_KEY);
  cleanLocalStorageBusinessData();
  document.cookie = `${AUTH_COOKIE_NAME}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
  document.cookie = `${LEGACY_AUTH_COOKIE_NAME}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
}

/**
 * Verifies legacy owner credential (PIN or Password) for offline / single-mode backward compatibility.
 */
export async function verifyOwnerCredential(input: string): Promise<boolean> {
  if (!input) return false;
  try {
    const settings = await getSettings();
    const expected =
      settings.owner_pin || settings.owner_password || DEFAULT_OWNER_PIN;

    return input.trim() === expected.trim();
  } catch (err) {
    console.error('Failed to verify owner credential:', err);
    return input.trim() === DEFAULT_OWNER_PIN;
  }
}

/**
 * Changes legacy owner security credential.
 */
export async function changeOwnerCredential(
  oldPass: string,
  newPass: string
): Promise<{ success: boolean; message: string }> {
  if (!newPass || newPass.trim().length < 4) {
    return {
      success: false,
      message: 'Sandi baru minimal harus terdiri dari 4 karakter atau digit angka.',
    };
  }

  const isValidOld = await verifyOwnerCredential(oldPass);
  if (!isValidOld) {
    return {
      success: false,
      message: 'Sandi / PIN lama yang Anda masukkan tidak sesuai.',
    };
  }

  try {
    const settings = await getSettings();
    const updated = {
      ...settings,
      owner_pin: newPass.trim(),
      owner_password: newPass.trim(),
    };
    await saveSettings(updated);

    // Refresh active session
    setAuthSession(true);

    return {
      success: true,
      message: 'Sandi / PIN pemilik berhasil diperbarui.',
    };
  } catch (err) {
    console.error('Failed to change credential:', err);
    return {
      success: false,
      message: 'Gagal menyimpan sandi baru. Silakan coba kembali.',
    };
  }
}
