-- Supabase profiles テーブルのRLSポリシー修正用SQL
-- 無限再帰エラー（42P17）を解決するためのスクリプト

-- 使用方法：
-- 1. Supabaseダッシュボード > SQL Editor でこのSQLを実行
-- 2. または supabase CLI で実行

-- 既存のポリシーをすべて削除
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can access all profiles" ON profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON profiles;
DROP POLICY IF EXISTS "Enable update for users based on email" ON profiles;

-- 新しい安全なポリシーを作成（無限再帰を回避）

-- 1. 自分のプロファイルの読み取りを許可
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT
    USING (auth.uid() = id);

-- 2. 自分のプロファイルの更新を許可
CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- 3. 認証済みユーザーのプロファイル挿入を許可
CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT
    WITH CHECK (auth.uid() = id);

-- 注意: 管理者用ポリシーは削除しました
-- 管理者が他のユーザーのプロファイルにアクセスする必要がある場合は、
-- サーバーサイドでservice_roleキーを使用するか、
-- 専用のRPC関数を作成してください

-- 現在のポリシー一覧を確認
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'profiles';

-- プロファイル確認用クエリ（自分のプロファイルのみ表示されるはず）
SELECT id, email, full_name, role, is_guest, created_at
FROM profiles
WHERE id = auth.uid();