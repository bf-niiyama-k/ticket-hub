-- 既存のユーザーを管理者に変更するSQL
-- 使用方法：
-- 1. Supabaseダッシュボード > SQL Editor でこのSQLを実行
-- 2. your_email@example.com を実際のメールアドレスに変更してください

-- 例: テスト用の管理者ユーザーを作成/更新
UPDATE profiles
SET role = 'admin'
WHERE email = 'admin@example.com';

-- もしプロファイルが存在しない場合の新規作成用SQL（コメントアウト）
-- INSERT INTO profiles (id, email, full_name, role, is_guest, created_at, updated_at)
-- SELECT
--   auth.uid(),
--   'admin@example.com',
--   '管理者ユーザー',
--   'admin',
--   false,
--   now(),
--   now()
-- WHERE NOT EXISTS (
--   SELECT 1 FROM profiles WHERE email = 'admin@example.com'
-- );

-- 現在のプロファイル一覧を確認
SELECT id, email, full_name, role, is_guest, created_at
FROM profiles
ORDER BY created_at DESC;