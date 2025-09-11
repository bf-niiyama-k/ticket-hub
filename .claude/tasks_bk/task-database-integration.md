# Task: データベース統合・データ連携実装

## 実装計画
優先度：**高** - 認証システム完了後の次優先

## 調査・追跡対象ファイル
- `.claude\docs\directory-structure.md`
- `.claude\spec\spec-init.md`
- `.claude\tasks\TASK.md`
- `.claude\tasks\task-002-database-auth-setup.md`
- `supabase/migrations/`
- 各画面コンポーネントファイル

### Phase 1: 調査・設計
- [x] 調査・追跡対象ファイルから現在の実装状況や仕様の確認を行う
- [x] 既存コード調査（静的データを使用している箇所の特定）
- [x] データベーススキーマの最終確認
- [x] 設計方針決定（データ取得戦略、キャッシング）

### Phase 2: 実装
- [x] Supabaseデータアクセス層実装（`src/lib/database.ts`）
- [x] 型定義ファイル整備（`src/types/database.ts`）
- [x] イベント管理機能のデータ連携
- [x] チケット管理機能のデータ連携
- [x] 顧客管理機能のデータ連携
- [x] 注文管理機能のデータ連携
- [x] 統計・分析機能のデータ連携

### Phase 3: 検証
- [x] データ取得・更新動作確認
- [ ] パフォーマンステスト
- [x] エラーハンドリング確認
- [x] ビルド実行
- [x] ESLintエラー・ワーニング解消

### Phase 4: タスク・ドキュメント更新
- [ ] データベース統合の知識を`.claude/docs/database-integration.md`として記載
- [ ] ディレクトリ情報を更新するため、src配下のディレクトリ構造を調査し、`.claude/docs/directory-structure.md`ファイルを更新
- [ ] 次のタスク（決済システム実装）を作成
- [ ] `.claude\tasks\TASK.md`を更新
- [ ] `.claude\tasks\`配下を調査し、次のタスクを特定・提案

## 仕様

### データ連携要件
- **リアルタイム性**: Supabase Realtime対応
- **データ整合性**: トランザクション対応
- **パフォーマンス**: ページング、フィルタリング対応
- **エラーハンドリング**: リトライ機構、ユーザーフィードバック

### 追跡対象ファイル
- `src/app/admin/events/page.tsx`
- `src/app/admin/customers/page.tsx`
- `src/app/admin/orders/page.tsx`
- `src/app/admin/analytics/page.tsx`
- `src/app/events/page.tsx`

### 実装対象ファイル
- `src/lib/database.ts`（新規作成）
- `src/types/database.ts`（新規作成）
- `src/hooks/useEvents.ts`（新規作成）
- `src/hooks/useTickets.ts`（新規作成）
- `src/hooks/useOrders.ts`（新規作成）

## 進捗メモ

### 2025-09-11 完了
- **Phase 1-3完了**: データベース統合基盤実装完了
- **主要成果物**:
  - `src/lib/database.ts`: 包括的なSupabase API実装
  - `src/types/database.ts`: 拡張型定義 
  - `src/hooks/`: カスタムフック4種 (useEvents, useOrders, useCustomers, useAnalytics)
  - 管理画面4種のデータベース連携完了
- **品質確保**: ESLintエラー・ワーニング完全解消、型安全性確保
- **残作業**: パフォーマンステストとドキュメント作成のみ

### 実装詳細
- 静的データ→実データベース完全移行
- CRUD操作対応（作成・読取・更新・削除）
- エラーハンドリング実装
- リアルタイム更新対応
- TypeScript型安全性確保