# Task: ESLint・デプロイエラー修正

## 実行日時
2025年9月2日

## タスク概要
デプロイ時のESLintエラー・ワーニングを完全解消し、本番環境でのビルド・デプロイを可能にする。

## 修正対象
### ESLintエラー (4箇所)
- `@typescript-eslint/no-explicit-any` - any型使用箇所
- TypeScript型定義不備

### ESLintワーニング (6箇所)  
- `@next/next/no-img-element` - img要素の使用

## 修正内容

### 1. any型エラー修正
- **src/app/admin/orders/page.tsx**
  - `Order`インターフェース新規作成
  - `selectedOrder`、`showOrderDetail`関数の型定義
  - `qrCode: string | null`対応

- **src/app/admin/scanner/page.tsx**
  - `Ticket`、`ScanResult`インターフェース作成
  - `mockTickets`の型定義 (`Record<string, Ticket>`)
  - 複合ステータス型対応 (`'valid' | 'invalid' | 'used' | 'confirmed'`)

- **src/app/profile/page.tsx**  
  - `handleProfileUpdate`関数の型定義拡張 (`string | string[] | object`)

### 2. img要素のNext.js Image置換
- **src/app/admin/events/[id]/EventEdit.tsx** - イベント画像表示
- **src/app/events/[id]/EventDetail.tsx** - ヒーロー画像 (`fill`プロパティ使用)
- **src/app/events/page.tsx** - イベント一覧カード画像
- **src/app/my-tickets/page.tsx** - チケット画像・QRコード画像
- **src/app/purchase-complete/page.tsx** - QRコード画像

すべてに`width`、`height`プロパティ、適切な`alt`属性を設定。

## ビルド結果 ✅
```
✓ Compiled successfully in 4.6s
✓ Generating static pages (28/28)
Route (app)                         Size  First Load JS
┌ ○ /                            2.28 kB         164 kB
├ ○ /admin                       1.86 kB         164 kB
└ [その他26ページ]
```

## 成果
- ✅ **ESLintエラー・ワーニング 0件**
- ✅ **TypeScript型安全性向上**
- ✅ **Next.js最適化適用** (画像配信の最適化)
- ✅ **デプロイ準備完了** (28静的ページ生成成功)
- ✅ **ビルドサイズ最適化** (First Load JS: 164kB以下)

## タスク完了確認
**ESLint・デプロイエラー修正タスクは完了しました。** 本番環境へのデプロイが可能な状態です。