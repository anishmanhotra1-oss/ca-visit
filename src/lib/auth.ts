'use client';

import { supabase, isSupabaseConfigured } from './supabase';
import { LocalAppStore } from './store';
import { AspirantProfile } from './types';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  targetYear: number;
  optionalSubject: string;
  phone?: string;
  isCloudSynced: boolean;
}

export class AuthService {
  /**
   * Register a new aspirant profile
   */
  static async register(data: {
    fullName: string;
    email: string;
    password: string;
    targetYear: number;
    optionalSubject: string;
    phone?: string;
  }): Promise<AuthUser> {
    const isCloud = isSupabaseConfigured();

    if (isCloud) {
      // 1. Supabase Auth signup
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.fullName,
            target_year: data.targetYear,
            optional_subject: data.optionalSubject,
          },
        },
      });

      if (authError) {
        throw new Error(authError.message);
      }

      const userId = authData.user?.id || `asp-cloud-${Date.now()}`;

      // 2. Insert into aspirant_profiles table in Supabase DB
      const { error: profileError } = await supabase.from('aspirant_profiles').upsert({
        user_id: authData.user?.id,
        full_name: data.fullName,
        email: data.email.toLowerCase(),
        password_hash: '[supabase_auth]',
        target_year: data.targetYear,
        optional_subject: data.optionalSubject,
        phone: data.phone || '',
      });

      if (profileError) {
        console.warn('Supabase DB profile upsert notice:', profileError.message);
      }

      const profile: AspirantProfile = {
        id: userId,
        user_id: authData.user?.id,
        full_name: data.fullName,
        email: data.email,
        target_year: data.targetYear,
        optional_subject: data.optionalSubject,
        phone: data.phone,
      };

      LocalAppStore.setCurrentAspirant(profile);

      return {
        id: userId,
        name: data.fullName,
        email: data.email,
        targetYear: data.targetYear,
        optionalSubject: data.optionalSubject,
        phone: data.phone,
        isCloudSynced: true,
      };
    } else {
      // Local Auth Fallback
      const profile = LocalAppStore.registerAspirant({
        full_name: data.fullName,
        email: data.email,
        password_hash: data.password,
        target_year: data.targetYear,
        optional_subject: data.optionalSubject,
        phone: data.phone,
      });

      return {
        id: profile.id,
        name: profile.full_name,
        email: profile.email,
        targetYear: profile.target_year,
        optionalSubject: profile.optional_subject,
        phone: profile.phone,
        isCloudSynced: false,
      };
    }
  }

  /**
   * Login aspirant profile
   */
  static async login(email: string, password: string): Promise<AuthUser> {
    const isCloud = isSupabaseConfigured();

    if (isCloud) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw new Error(error.message);
      }

      const user = data.user;
      let fullName = user?.user_metadata?.full_name || email.split('@')[0];
      let targetYear = user?.user_metadata?.target_year || 2026;
      let optionalSubject = user?.user_metadata?.optional_subject || 'PSIR';

      // Attempt to fetch profile from DB table
      const { data: dbProfile } = await supabase
        .from('aspirant_profiles')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (dbProfile) {
        fullName = dbProfile.full_name || fullName;
        targetYear = dbProfile.target_year || targetYear;
        optionalSubject = dbProfile.optional_subject || optionalSubject;
      }

      const profile: AspirantProfile = {
        id: user?.id || `asp-${Date.now()}`,
        user_id: user?.id,
        full_name: fullName,
        email: user?.email || email,
        target_year: targetYear,
        optional_subject: optionalSubject,
      };

      LocalAppStore.setCurrentAspirant(profile);

      return {
        id: profile.id,
        name: fullName,
        email: user?.email || email,
        targetYear,
        optionalSubject,
        isCloudSynced: true,
      };
    } else {
      // Local Auth Fallback
      const profile = LocalAppStore.loginAspirant(email, password);

      if (!profile) {
        throw new Error('Invalid email or password. Please check your credentials or Sign Up.');
      }

      return {
        id: profile.id,
        name: profile.full_name,
        email: profile.email,
        targetYear: profile.target_year,
        optionalSubject: profile.optional_subject,
        phone: profile.phone,
        isCloudSynced: false,
      };
    }
  }

  /**
   * Get Current Session User
   */
  static getCurrentUser(): AuthUser | null {
    const aspirant = LocalAppStore.getCurrentAspirant();
    if (!aspirant || !aspirant.email || aspirant.email === 'aspirant@upsc-visit.local') return null;
    return {
      id: aspirant.id,
      name: aspirant.full_name,
      email: aspirant.email,
      targetYear: aspirant.target_year || 2026,
      optionalSubject: aspirant.optional_subject || 'PSIR',
      phone: aspirant.phone,
      isCloudSynced: isSupabaseConfigured(),
    };
  }

  /**
   * Logout user
   */
  static async logout(): Promise<void> {
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('cav_guest_mode');
      } catch (e) {
        // ignore
      }
    }
    if (isSupabaseConfigured()) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.warn('Supabase signout notice:', err);
      }
    }
    LocalAppStore.logoutAspirant();
  }
}
