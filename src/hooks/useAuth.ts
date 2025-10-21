"use client";

import { useState, useEffect } from "react";
import { User } from "@supabase/supabase-js";
import {
  getCurrentUser,
  getUserProfile,
  onAuthStateChange,
  signOut as authSignOut,
} from "@/lib/auth";

interface Profile {
  id: string;
  email: string;
  phone: string;
  full_name: string | null;
  avatar_url: string | null;
  role: "customer" | "admin" | "staff";
  is_guest: boolean;
}

export interface UseAuthReturn {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  error: Error | null;
  isAuthenticated: boolean;
  signOut: () => Promise<void>;
}

export const useAuth = (): UseAuthReturn => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // クライアントサイドでのみ実行
    if (typeof window === "undefined") {
      setLoading(false);
      return;
    }

    // 初回ユーザー情報取得
    const fetchUser = async () => {
      try {
        const { user: currentUser, error: userError } = await getCurrentUser();

        if (userError) {
          setError(userError);
          setLoading(false);
          return;
        }

        setUser(currentUser);

        // ユーザーがいる場合、プロファイル情報も取得
        if (currentUser) {
          const { profile: userProfile, error: profileError } =
            await getUserProfile(currentUser.id);

          if (profileError) {
            console.error("プロファイル取得エラー:", profileError);
          } else {
            setProfile(userProfile);
          }
        }
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("認証エラーが発生しました")
        );
      } finally {
        setLoading(false);
      }
    };

    fetchUser();

    // セッション変更の監視
    const unsubscribe = onAuthStateChange(async (newUser) => {
      setUser(newUser);

      if (newUser) {
        const { profile: userProfile } = await getUserProfile(newUser.id);
        setProfile(userProfile);
      } else {
        setProfile(null);
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await authSignOut();
    setUser(null);
    setProfile(null);
  };

  return {
    user,
    profile,
    loading,
    error,
    isAuthenticated: !!user,
    signOut,
  };
};
