/**
 * 認証関連のユーティリティ関数
 * Supabase公式ドキュメントのベストプラクティスに従って実装
 * @see https://supabase.com/docs/guides/auth/server-side/nextjs
 */
import { supabase } from "@/lib/supabase";
import type { AuthError, User } from "@supabase/supabase-js";

interface ProfileInsert {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: 'customer' | 'admin' | 'staff';
  is_guest: boolean;
}

interface ProfileUpdate {
  full_name?: string;
  avatar_url?: string;
  updated_at?: string;
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: AuthError | null;
}

export interface SignUpData {
  email: string;
  password: string;
  fullName?: string;
}

export interface SignInData {
  email: string;
  password: string;
}

export interface GuestInfo {
  email: string;
  fullName: string;
}

// メール認証でのサインアップ
export async function signUp(data: SignUpData) {
  const { email, password, fullName } = data;

  const { data: authData, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  });

  return { user: authData.user, error };
}

// メール認証でのサインイン
export async function signIn(data: SignInData) {
  const { email, password } = data;

  const { data: authData, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  return { user: authData.user, error };
}

// Google認証でのサインイン
export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${process.env['NEXT_PUBLIC_SITE_URL'] || window.location.origin}/auth/callback`,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  });

  return { data, error };
}

// ゲストユーザーとして一時アカウント作成
export async function createGuestUser(guestInfo: GuestInfo) {
  // 匿名ユーザーとしてサインアップ
  const { data: authData, error } = await supabase.auth.signInAnonymously();

  if (error) {
    return { user: null, error };
  }

  // ゲスト情報をプロファイルに保存
  if (authData.user) {
    const profileData: ProfileInsert = {
      id: authData.user.id,
      email: guestInfo.email,
      full_name: guestInfo.fullName,
      avatar_url: null,
      is_guest: true,
      role: 'customer',
    };

    const { error: profileError } = await supabase
      .from("profiles")
      .insert([profileData]);

    if (profileError) {
      console.error("プロファイル作成エラー:", profileError);
    }
  }

  return { user: authData.user, error };
}

// サインアウト
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  return { error };
}

// パスワードリセット
export async function resetPassword(email: string) {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth/reset-password`,
  });

  return { data, error };
}

// パスワード更新
export async function updatePassword(password: string) {
  const { data, error } = await supabase.auth.updateUser({
    password,
  });

  return { user: data.user, error };
}

// 現在のユーザーを取得
export async function getCurrentUser() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  return { user, error };
}

// ユーザープロファイルを取得
export async function getUserProfile(userId: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  return { profile: data, error };
}

// ユーザープロファイルを更新
export async function updateUserProfile(
  userId: string,
  updates: {
    full_name?: string;
    avatar_url?: string;
  }
) {
  const updateData: ProfileUpdate = {
    ...updates,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("profiles") 
    .update(updateData)
    .eq("id", userId)
    .select()
    .single();

  return { profile: data, error };
}

// セッション監視
export function onAuthStateChange(callback: (user: User | null) => void) {
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user ?? null);
  });

  return () => subscription.unsubscribe();
}
