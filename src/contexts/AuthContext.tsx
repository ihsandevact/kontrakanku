'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { LandlordProfile } from '@/types/database';
import { isSupabaseConfigured, supabase } from '@/lib/supabase/client';
import { cleanLocalStorageBusinessData } from '@/lib/storage';
import {
  clearAuthSession,
  formatSlug,
  generateUniqueSlug,
  getCachedProfile,
  setAuthSession,
} from '@/lib/auth';

interface RegisterData {
  email: string;
  password: string;
  businessName: string;
  ownerName: string;
  phone: string;
  slug?: string;
}

interface AuthContextType {
  user: User | null;
  profile: LandlordProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: RegisterData) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<LandlordProfile>) => Promise<{ success: boolean; error?: string }>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_STORAGE_USERS_KEY = 'kontrakinaja_registered_users_v1';
const LEGACY_STORAGE_USERS_KEY = 'kontrakin_registered_users_v1';
const OLD_LEGACY_STORAGE_USERS_KEY = 'sewapribadi_registered_users_v1';

function getLocalRegisteredUsers(): any[] {
  if (typeof window === 'undefined') return [];
  try {
    let raw = localStorage.getItem(LOCAL_STORAGE_USERS_KEY);
    if (!raw) {
      // Check legacy keys and migrate seamlessly
      raw =
        localStorage.getItem(LEGACY_STORAGE_USERS_KEY) ||
        localStorage.getItem(OLD_LEGACY_STORAGE_USERS_KEY);
      if (raw) {
        localStorage.setItem(LOCAL_STORAGE_USERS_KEY, raw);
      }
    }
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<LandlordProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Helper to fetch landlord profile from Supabase with multi-tier auto-recovery
  const fetchProfile = async (userId: string, userObj?: User | null): Promise<LandlordProfile | null> => {
    if (!supabase) return null;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (!error && data) {
        return data as LandlordProfile;
      }

      // Auto-recovery: If profile row is missing in 'profiles' table (e.g. RLS policy or table missing),
      // seamlessly reconstruct from user.user_metadata, app_settings, and local cached profile
      const cached = getCachedProfile();
      let settingsCloud: any = null;
      try {
        const { data: sData } = await supabase.from('app_settings').select('*').eq('id', userId).maybeSingle();
        if (sData) settingsCloud = sData;
        else {
          const { data: dData } = await supabase.from('app_settings').select('*').eq('id', 'default').maybeSingle();
          if (dData) settingsCloud = dData;
        }
      } catch {}

      if (userObj?.user_metadata || cached || settingsCloud) {
        const meta = userObj?.user_metadata || {};
        const businessName = meta.business_name || cached?.business_name || 'Kontrakan Mandiri';
        const ownerName = meta.owner_name || cached?.owner_name || settingsCloud?.account_holder || '';
        const phone = meta.phone || cached?.phone || settingsCloud?.contact_phone || '';
        const slug = meta.slug || cached?.slug || formatSlug(businessName) || 'kontrakan';
        const bankName = meta.bank_name || settingsCloud?.bank_name || cached?.bank_name || 'BCA';
        const accountNumber = meta.account_number || settingsCloud?.account_number || cached?.account_number || '';
        const accountHolder = meta.account_holder || settingsCloud?.account_holder || cached?.account_holder || ownerName;
        const reminderDays = meta.reminder_days_before ?? settingsCloud?.reminder_days_before ?? cached?.reminder_days_before ?? 7;
        const defaultCycle = meta.default_cycle || settingsCloud?.default_cycle || cached?.default_cycle || 'semi_annual';
        const customWaTemplate = meta.custom_wa_template ?? settingsCloud?.custom_wa_template ?? cached?.custom_wa_template ?? null;

        const recoveredProfile: LandlordProfile = {
          id: userId,
          slug,
          business_name: businessName,
          owner_name: ownerName,
          phone,
          bank_name: bankName,
          account_number: accountNumber,
          account_holder: accountHolder,
          reminder_days_before: Number(reminderDays),
          default_cycle: defaultCycle,
          custom_wa_template: customWaTemplate,
          created_at: cached?.created_at || new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        // Attempt non-fatal persistence into profiles table
        try {
          await supabase.from('profiles').upsert(recoveredProfile);
        } catch {}

        return recoveredProfile;
      }

      return null;
    } catch (err) {
      console.error('Failed to fetch profile:', err);
      return getCachedProfile();
    }
  };

  useEffect(() => {
    let isMounted = true;

    async function initAuth() {
      setIsLoading(true);

      // Check if Supabase Cloud is configured
      if (isSupabaseConfigured() && supabase) {
        try {
          const { data } = await supabase.auth.getSession();
          const currentSession = data.session;

          if (currentSession?.user) {
            cleanLocalStorageBusinessData();
            if (isMounted) setUser(currentSession.user);
            const userProfile = await fetchProfile(currentSession.user.id, currentSession.user);
            if (isMounted) {
              setProfile(userProfile);
              setAuthSession(true, currentSession.user.id, currentSession.user.email, userProfile);
            }
          } else {
            if (isMounted) {
              setUser(null);
              setProfile(null);
              clearAuthSession();
            }
          }
        } catch (err) {
          console.error('Supabase getSession error:', err);
        }
      } else {
        // LocalStorage / Offline mode fallback
        const cached = getCachedProfile();
        if (cached) {
          setProfile(cached);
          setUser({ id: cached.id, email: `${cached.slug}@demo.local` } as User);
        }
      }

      if (isMounted) setIsLoading(false);
    }

    initAuth();

    // Set up Supabase auth listener if available
    let authListener: { subscription: { unsubscribe: () => void } } | null = null;
    if (isSupabaseConfigured() && supabase) {
      const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (!isMounted) return;

        if (session?.user) {
          setUser(session.user);
          const p = await fetchProfile(session.user.id, session.user);
          setProfile(p);
          setAuthSession(true, session.user.id, session.user.email, p);
        } else {
          setUser(null);
          setProfile(null);
          clearAuthSession();
        }
        setIsLoading(false);
      });
      authListener = data;
    }

    return () => {
      isMounted = false;
      if (authListener) authListener.subscription.unsubscribe();
    };
  }, []);

  const login = async (
    email: string,
    pass: string
  ): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);

    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password: pass,
        });

        if (error) {
          setIsLoading(false);
          return { success: false, error: error.message };
        }

        if (data.user) {
          setUser(data.user);
          const p = await fetchProfile(data.user.id, data.user);
          setProfile(p);
          setAuthSession(true, data.user.id, data.user.email, p);
          setIsLoading(false);
          return { success: true };
        }
      } catch (err: any) {
        setIsLoading(false);
        return { success: false, error: err?.message || 'Gagal masuk akun.' };
      }
    }

    // Local / Offline mode fallback
    try {
      const registeredUsers: any[] = getLocalRegisteredUsers();
      const match = registeredUsers.find(
        (u) => u.email.toLowerCase() === email.trim().toLowerCase() && u.password === pass
      );

      if (match) {
        const localProfile = match.profile;
        setUser({ id: localProfile.id, email: match.email } as User);
        setProfile(localProfile);
        setAuthSession(true, localProfile.id, match.email, localProfile);
        setIsLoading(false);
        return { success: true };
      }

      // Check default demo account (PIN: 123456 or password)
      if (pass === '123456' || email.includes('demo')) {
        const demoProfile: LandlordProfile = {
          id: 'demo-landlord-01',
          slug: 'kontrakan-berkah',
          business_name: 'Kontrakan Berkah Makmur',
          owner_name: 'Ahmad Fauzi',
          phone: '081234567890',
          bank_name: 'BCA',
          account_number: '8001234567',
          account_holder: 'Ahmad Fauzi',
          reminder_days_before: 7,
          default_cycle: 'semi_annual',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        setUser({ id: demoProfile.id, email: email || 'demo@kontrakinaja.com' } as User);
        setProfile(demoProfile);
        setAuthSession(true, demoProfile.id, email, demoProfile);
        setIsLoading(false);
        return { success: true };
      }

      setIsLoading(false);
      return { success: false, error: 'Email atau kata sandi tidak cocok.' };
    } catch {
      setIsLoading(false);
      return { success: false, error: 'Terjadi kesalahan sistem login lokal.' };
    }
  };

  const register = async (
    data: RegisterData
  ): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    const baseSlug = formatSlug(data.slug || data.businessName) || 'kontrakan';

    if (isSupabaseConfigured() && supabase) {
      try {
        // 1. Fetch any existing slugs that start with baseSlug to prevent collisions
        const { data: matches } = await supabase
          .from('profiles')
          .select('slug')
          .ilike('slug', `${baseSlug}%`);

        const existingSlugs = (matches || []).map((m: any) => m.slug).filter(Boolean);
        const cleanSlug = generateUniqueSlug(baseSlug, existingSlugs);

        // 2. Sign up user via Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: data.email.trim(),
          password: data.password,
          options: {
            data: {
              slug: cleanSlug,
              business_name: data.businessName.trim(),
              owner_name: data.ownerName.trim(),
              phone: data.phone.trim(),
            },
          },
        });

        if (authError) {
          setIsLoading(false);
          return { success: false, error: authError.message };
        }

        if (authData.user) {
          // If trigger didn't catch it or for immediate client availability, upsert profile
          const initialProfile: LandlordProfile = {
            id: authData.user.id,
            slug: cleanSlug,
            business_name: data.businessName.trim(),
            owner_name: data.ownerName.trim(),
            phone: data.phone.trim(),
            bank_name: 'BCA',
            account_number: '',
            account_holder: data.ownerName.trim(),
            reminder_days_before: 7,
            default_cycle: 'semi_annual',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };

          await supabase.from('profiles').upsert(initialProfile);

          setUser(authData.user);
          setProfile(initialProfile);
          setAuthSession(true, authData.user.id, authData.user.email, initialProfile);
          setIsLoading(false);
          return { success: true };
        }
      } catch (err: any) {
        setIsLoading(false);
        return { success: false, error: err?.message || 'Gagal mendaftar akun.' };
      }
    }

    // LocalStorage / Offline mode fallback with smart auto-deduplication
    try {
      const registeredUsers: any[] = getLocalRegisteredUsers();
      const existingSlugs = registeredUsers.map((u: any) => u.profile?.slug).filter(Boolean);
      const cleanSlug = generateUniqueSlug(baseSlug, existingSlugs);

      const newId = `owner-${Date.now()}`;
      const newProfile: LandlordProfile = {
        id: newId,
        slug: cleanSlug,
        business_name: data.businessName.trim(),
        owner_name: data.ownerName.trim(),
        phone: data.phone.trim(),
        bank_name: 'BCA',
        account_number: '',
        account_holder: data.ownerName.trim(),
        reminder_days_before: 7,
        default_cycle: 'semi_annual',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      registeredUsers.push({
        email: data.email.trim(),
        password: data.password,
        profile: newProfile,
      });
      localStorage.setItem(LOCAL_STORAGE_USERS_KEY, JSON.stringify(registeredUsers));

      setUser({ id: newId, email: data.email.trim() } as User);
      setProfile(newProfile);
      setAuthSession(true, newId, data.email.trim(), newProfile);
      setIsLoading(false);
      return { success: true };
    } catch {
      setIsLoading(false);
      return { success: false, error: 'Gagal menyimpan akun baru di browser.' };
    }
  };

  const logout = async (): Promise<void> => {
    setIsLoading(true);
    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.error('Supabase signOut error:', err);
      }
    }
    clearAuthSession();
    setUser(null);
    setProfile(null);
    setIsLoading(false);
    window.location.href = '/login';
  };

  const updateProfile = async (
    updates: Partial<LandlordProfile>
  ): Promise<{ success: boolean; error?: string }> => {
    if (!profile) return { success: false, error: 'Tidak ada profil aktif.' };

    const updatedProfile: LandlordProfile = {
      ...profile,
      ...updates,
      updated_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured() && supabase) {
      // 1. Triple-layer cloud persistence: Sync directly to Supabase Auth user_metadata
      try {
        await supabase.auth.updateUser({
          data: {
            business_name: updatedProfile.business_name,
            owner_name: updatedProfile.owner_name,
            phone: updatedProfile.phone,
            slug: updatedProfile.slug,
            bank_name: updatedProfile.bank_name,
            account_number: updatedProfile.account_number,
            account_holder: updatedProfile.account_holder,
            reminder_days_before: updatedProfile.reminder_days_before,
            default_cycle: updatedProfile.default_cycle,
            custom_wa_template: updatedProfile.custom_wa_template,
          },
        });
      } catch (authErr) {
        console.warn('Non-fatal: could not update Supabase user_metadata:', authErr);
      }

      // 2. Persist to app_settings table in Supabase
      try {
        const settingsPayload = {
          id: profile.id,
          bank_name: updatedProfile.bank_name || 'BCA',
          account_number: updatedProfile.account_number || '',
          account_holder: updatedProfile.account_holder || updatedProfile.owner_name || '',
          contact_phone: updatedProfile.phone || '',
          reminder_days_before: updatedProfile.reminder_days_before || 7,
          default_cycle: updatedProfile.default_cycle || 'semi_annual',
          custom_wa_template: updatedProfile.custom_wa_template || null,
          updated_at: updatedProfile.updated_at,
        };
        await supabase.from('app_settings').upsert(settingsPayload);
        await supabase.from('app_settings').upsert({ ...settingsPayload, id: 'default' });
      } catch (setErr) {
        console.warn('Non-fatal: could not update app_settings:', setErr);
      }

      // 3. Try updating profiles table
      try {
        await supabase
          .from('profiles')
          .upsert(updatedProfile);
      } catch (profErr) {
        console.warn('Non-fatal: could not upsert profiles table:', profErr);
      }
    }

    // 4. Update local registered users store if available
    try {
      const registeredUsers = getLocalRegisteredUsers();
      const updatedUsers = registeredUsers.map((u: any) =>
        u.profile?.id === profile.id ? { ...u, profile: updatedProfile } : u
      );
      localStorage.setItem(LOCAL_STORAGE_USERS_KEY, JSON.stringify(updatedUsers));
    } catch {}

    setProfile(updatedProfile);
    setAuthSession(true, profile.id, user?.email, updatedProfile);
    return { success: true };
  };

  const refreshProfile = async (): Promise<void> => {
    if (user && isSupabaseConfigured() && supabase) {
      const p = await fetchProfile(user.id, user);
      if (p) {
        setProfile(p);
        setAuthSession(true, user.id, user.email, p);
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isLoading,
        isAuthenticated: Boolean(user || profile),
        login,
        register,
        logout,
        updateProfile,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
