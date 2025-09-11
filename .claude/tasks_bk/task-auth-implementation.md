# Task: 認証システム実装

## 実装計画
優先度：**最高** - 他の機能の前提となる基盤機能

## 調査・追跡対象ファイル
- `.claude\docs\directory-structure.md`
- `.claude\spec\spec-init.md`
- `.claude\tasks\TASK.md`
- `.claude\tasks\task-002-database-auth-setup.md`
- `supabase/migrations/`
- `src/app/login/page.tsx`
- `src/app/auth/callback/page.tsx`

### Phase 1: 調査・設計
- [ ] 調査・追跡対象ファイルから現在の実装状況や仕様の確認を行う
- [ ] 既存コード調査（認証関連ページ・コンポーネント）
- [ ] Supabase認証設定の確認・テスト
- [ ] 設計方針決定（認証フロー、セッション管理）

### Phase 2: 実装
- [ ] Supabaseクライアント設定（`src/lib/supabase.ts`）
- [ ] 認証ミドルウェア実装（セッション検証）
- [ ] ログイン・登録UIコンポーネント実装
- [ ] Google OAuth設定・実装
- [ ] パスワードリセット機能実装
- [ ] ゲスト認証機能実装

### Phase 3: 検証
- [ ] 認証フロー動作確認
- [ ] セッション管理テスト
- [ ] レスポンシブ対応確認
- [ ] ビルド実行
- [ ] ESLintエラー・ワーニング解消

### Phase 4: タスク・ドキュメント更新
- [ ] 認証実装の知識を`.claude/docs/auth-implementation.md`として記載
- [ ] ディレクトリ情報を更新するため、src配下のディレクトリ構造を調査し、`.claude/docs/directory-structure.md`ファイルを更新
- [ ] `.claude\tasks\TASK.md`を更新
- [ ] `.claude\tasks\`配下を調査し、次のタスクを特定・提案

## 仕様

### 認証要件
- **認証方式**: メール認証、Google OAuth、ゲスト購入
- **セッション管理**: JWT + サーバーサイドセッション
- **セキュリティ**: RLS（行レベルセキュリティ）対応
- **UI/UX**: レスポンシブ対応、アクセシビリティ対応

### 追跡対象ファイル
- `supabase/migrations/20240902_initial_schema.sql`
- `src/app/login/page.tsx`
- `src/app/register/page.tsx`（新規作成予定）
- `src/app/forgot-password/page.tsx`
- `src/app/auth/callback/page.tsx`

### 実装対象ファイル
- `src/lib/supabase.ts`（新規作成）
- `src/middleware.ts`（新規作成）
- `src/components/auth/`配下（新規作成）
- `src/types/auth.ts`（新規作成）
- `src/hooks/useAuth.ts`（新規作成）

## 進捗メモ
作業進捗を随時更新