import type { SupabaseClient } from '@supabase/supabase-js';
import type { UserProfileGateway } from '../../domain/userProfiles';
import type { Database } from '../../../types/database';
import type { UserProfile } from '../../../types';
import { SUPERADMIN_EMAILS } from '../../../config/plans';

function normalizeEmail(email?: string | null) {
  return email?.trim().toLowerCase() ?? null;
}

export function createSupabaseUserProfileGateway(client: SupabaseClient<Database>): UserProfileGateway {
  return {
    async getOrCreateProfile(userId, email) {
      const normalizedEmail = normalizeEmail(email);
      const isSuperadmin = normalizedEmail ? SUPERADMIN_EMAILS.includes(normalizedEmail) : false;

      const { data: existing, error } = await client
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) throw error;

      if (existing) {
        const updates: Partial<UserProfile> = {};

        if (normalizedEmail && existing.email !== normalizedEmail) {
          updates.email = normalizedEmail;
        }

        if (isSuperadmin && (existing.role !== 'superadmin' || existing.plan !== 'pro')) {
          updates.role = 'superadmin';
          updates.plan = 'pro';
        }

        if (Object.keys(updates).length > 0) {
          const { data: updated, error: updateError } = await client
            .from('user_profiles')
            .update(updates)
            .eq('user_id', userId)
            .select()
            .single();

          if (updateError) throw updateError;
          return updated as UserProfile;
        }

        return existing as UserProfile;
      }

      const { data: profile, error: insertError } = await client
        .from('user_profiles')
        .insert({
          user_id: userId,
          email: normalizedEmail,
          plan: isSuperadmin ? 'pro' : 'free',
          role: isSuperadmin ? 'superadmin' : 'user',
        })
        .select()
        .single();

      if (insertError) throw insertError;
      return profile as UserProfile;
    },
  };
}
