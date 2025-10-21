"use client";

import { useState, useEffect } from "react";
import { useAuth } from "./useAuth";
import type { Profile } from "@/lib/supabase/types";

export interface UseProfileReturn {
  profile: Profile | null;
  loading: boolean;
  error: string | null;
  updateProfile: (data: Partial<Profile>) => Promise<void>;
  refetch: () => Promise<void>;
}

export const useMyProfile = (): UseProfileReturn => {
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async () => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/profile');

      if (!response.ok) {
        throw new Error('プロフィールの取得に失敗しました');
      }

      const data = await response.json();
      setProfile(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      fetchProfile();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading]);

  const updateProfile = async (data: Partial<Profile>) => {
    try {
      setError(null);

      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'プロフィールの更新に失敗しました');
      }

      const updatedProfile = await response.json();
      setProfile(updatedProfile);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました');
      throw err;
    }
  };

  return {
    profile,
    loading: authLoading || loading,
    error,
    updateProfile,
    refetch: fetchProfile,
  };
};
