# Task: QRコード・チケット表示システム実装

## 実装計画
優先度：**中** - 決済システム完了後に実装

## 調査・追跡対象ファイル
- `.claude\docs\directory-structure.md`
- `.claude\spec\spec-init.md`
- `.claude\tasks\TASK.md`
- `src/app/my-tickets/page.tsx`
- `src/app/admin/scanner/page.tsx`

### Phase 1: 調査・設計
- [ ] 調査・追跡対象ファイルから現在の実装状況や仕様の確認を行う
- [ ] 既存チケット表示UI調査
- [ ] QRコード生成ライブラリ調査
- [ ] QRコードスキャン機能調査
- [ ] 設計方針決定（QRコード仕様、セキュリティ）

### Phase 2: 実装
- [ ] QRコード生成ライブラリ統合
- [ ] チケットQRコード生成機能
- [ ] QRコード付きチケット表示コンポーネント
- [ ] チケットPDF出力機能
- [ ] QRコードスキャナー実装（管理画面）
- [ ] 使用済みチケット管理
- [ ] チケット検証API実装

### Phase 3: 検証
- [ ] QRコード生成・読み取り動作確認
- [ ] セキュリティテスト（QRコード偽造対策）
- [ ] モバイル対応確認
- [ ] ビルド実行
- [ ] ESLintエラー・ワーニング解消

### Phase 4: タスク・ドキュメント更新
- [ ] QRコード実装の知識を`.claude/docs/qr-ticket-implementation.md`として記載
- [ ] ディレクトリ情報を更新するため、src配下のディレクトリ構造を調査し、`.claude/docs/directory-structure.md`ファイルを更新
- [ ] 次のタスク（テスト・品質向上）を作成
- [ ] `.claude\tasks\TASK.md`を更新
- [ ] `.claude\tasks\`配下を調査し、次のタスクを特定・提案

## 仕様

### QRコード要件
- **形式**: 一意なチケットID + セキュリティハッシュ
- **セキュリティ**: 時限付きトークン、使用済み管理
- **UX**: 高精細QRコード、オフライン対応
- **管理機能**: バルクスキャン、使用状況統計

### 追跡対象ファイル
- `src/app/my-tickets/page.tsx`
- `src/app/admin/scanner/page.tsx`
- `src/components/shared/TicketCard.tsx`

### 実装対象ファイル
- `src/lib/qr-generator.ts`（新規作成）
- `src/components/ticket/`配下（新規作成）
- `src/types/ticket.ts`（新規作成）
- `src/hooks/useTicketScanner.ts`（新規作成）

## 進捗メモ
作業進捗を随時更新