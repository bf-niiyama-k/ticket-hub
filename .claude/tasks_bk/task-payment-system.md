# Task: 決済システム実装

## 実装計画
優先度：**中** - データベース統合完了後に実装

## 調査・追跡対象ファイル
- `.claude\docs\directory-structure.md`
- `.claude\spec\spec-init.md`
- `.claude\tasks\TASK.md`
- `src/app/checkout/page.tsx`
- `src/app/purchase-complete/page.tsx`

### Phase 1: 調査・設計
- [ ] 調査・追跡対象ファイルから現在の実装状況や仕様の確認を行う
- [ ] 既存決済UI調査
- [ ] Stripe統合要件の確認
- [ ] PayPay・コンビニ決済の調査
- [ ] 設計方針決定（決済フロー、エラーハンドリング）

### Phase 2: 実装
- [ ] Stripe SDK統合
- [ ] 決済フォームコンポーネント実装
- [ ] クレジットカード決済実装
- [ ] PayPay決済統合（調査結果次第）
- [ ] コンビニ決済統合（調査結果次第）
- [ ] 決済状態管理
- [ ] 決済履歴・領収書機能
- [ ] 返金処理機能（管理画面）

### Phase 3: 検証
- [ ] 決済フロー動作確認（テスト環境）
- [ ] セキュリティテスト
- [ ] エラーハンドリング確認
- [ ] ビルド実行
- [ ] ESLintエラー・ワーニング解消

### Phase 4: タスク・ドキュメント更新
- [ ] 決済実装の知識を`.claude/docs/payment-implementation.md`として記載
- [ ] ディレクトリ情報を更新するため、src配下のディレクトリ構造を調査し、`.claude/docs/directory-structure.md`ファイルを更新
- [ ] 次のタスク（QRコード機能実装）を作成
- [ ] `.claude\tasks\TASK.md`を更新
- [ ] `.claude\tasks\`配下を調査し、次のタスクを特定・提案

## 仕様

### 決済要件
- **決済方式**: クレジットカード（Stripe）、PayPay、コンビニ決済
- **セキュリティ**: PCI DSS準拠、決済情報の非保存
- **UX**: ワンクリック決済対応、決済状況のリアルタイム表示
- **管理機能**: 返金処理、決済履歴管理

### 追跡対象ファイル
- `src/app/checkout/page.tsx`
- `src/app/purchase-complete/page.tsx`
- `src/app/admin/orders/page.tsx`

### 実装対象ファイル
- `src/lib/stripe.ts`（新規作成）
- `src/components/payment/`配下（新規作成）
- `src/types/payment.ts`（新規作成）
- `src/hooks/usePayment.ts`（新規作成）

## 進捗メモ
作業進捗を随時更新