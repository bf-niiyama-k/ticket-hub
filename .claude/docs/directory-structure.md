
# プロジェクト ディレクトリ構造

最終更新: 2025年9月11日 (QRコード・チケットシステム実装完了後)

## src/ ディレクトリ構造

```
src/
├── app/                        # Next.js 15 App Router
│   ├── admin/                  # 管理画面
│   │   ├── analytics/          # 売上分析ページ
│   │   │   └── page.tsx
│   │   ├── customers/          # 顧客管理ページ
│   │   │   └── page.tsx
│   │   ├── events/             # イベント管理
│   │   │   ├── [id]/           # 個別イベント編集
│   │   │   │   ├── EventEdit.tsx
│   │   │   │   └── page.tsx
│   │   │   └── page.tsx        # イベント一覧
│   │   ├── orders/             # 注文管理ページ
│   │   │   └── page.tsx
│   │   ├── scanner/            # QRスキャナーページ
│   │   │   └── page.tsx
│   │   └── page.tsx            # 管理画面メイン (✅ AdminLayout適用済み)
│   ├── api/                    # ✅ API Routes
│   │   ├── payments/           # ✅ 決済API
│   │   │   ├── create-payment-intent/
│   │   │   │   └── route.ts    # 決済Intent作成API
│   │   │   └── confirm-payment/
│   │   │       └── route.ts    # 決済確認API
│   │   └── tickets/            # ✅ チケットAPI (新規追加)
│   │       └── verify/         # ✅ QRコード検証API
│   │           └── route.ts    # チケット検証・使用済みマーク
│   ├── auth/                   # ✅ 認証関連 (新規追加)
│   │   └── callback/           # OAuth認証コールバック
│   │       └── page.tsx
│   ├── checkout/               # ✅ チェックアウトページ (決済統合済み)
│   │   └── page.tsx
│   ├── events/                 # イベント関連
│   │   ├── [id]/               # 個別イベント詳細
│   │   │   ├── EventDetail.tsx
│   │   │   └── page.tsx
│   │   └── page.tsx            # イベント一覧
│   ├── forgot-password/        # パスワード忘れページ
│   │   └── page.tsx
│   ├── login/                  # ログインページ
│   │   └── page.tsx
│   ├── my-tickets/             # マイチケットページ
│   │   └── page.tsx
│   ├── profile/                # プロフィールページ
│   │   └── page.tsx
│   ├── purchase-complete/      # 購入完了ページ
│   │   └── page.tsx
│   ├── register/               # 新規登録ページ
│   │   └── page.tsx
│   ├── globals.css             # ✅ shadcn/ui CSS変数適用済み
│   ├── layout.tsx              # ルートレイアウト
│   └── page.tsx                # ホームページ (✅ EventCard適用済み)
│
├── components/                 # ✅ UI再構造化済み
│   ├── ui/                     # shadcn/ui基本コンポーネント
│   │   ├── badge.tsx
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── form.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── select.tsx
│   │   ├── table.tsx
│   │   ├── textarea.tsx
│   │   └── index.ts            # クリーンなエクスポート
│   ├── shared/                 # 共通ビジネスコンポーネント
│   │   ├── EventCard.tsx       # ✅ イベント表示カード
│   │   ├── StatsCard.tsx       # ✅ 統計表示カード  
│   │   ├── TicketCard.tsx      # ✅ チケット表示カード (QRコード統合)
│   │   └── index.ts            # 型定義含むエクスポート
│   ├── layout/                 # レイアウトコンポーネント
│   │   ├── AdminLayout.tsx     # ✅ 管理画面レイアウト
│   │   ├── Footer.tsx          # フッター
│   │   ├── Header.tsx          # ヘッダー
│   │   └── index.ts            # エクスポート
│   ├── auth/                   # ✅ 認証コンポーネント (新規追加)
│   │   ├── ForgotPasswordForm.tsx
│   │   ├── LoginForm.tsx
│   │   ├── RegisterForm.tsx
│   │   └── index.ts
│   ├── ticket/                 # ✅ QRコード・チケットコンポーネント (新規追加)
│   │   ├── QRCodeDisplay.tsx   # ✅ QRコード表示
│   │   ├── QRCodeModal.tsx     # ✅ QRコードモーダル
│   │   └── QRCodeScanner.tsx   # ✅ QRコードスキャナー
│   └── index.ts                # 全体統合エクスポート
│
├── hooks/                      # ✅ カスタムフック
│   └── usePayment.ts           # ✅ 決済処理フック (新規追加)
├── lib/                        # ライブラリ・ユーティリティ
│   ├── auth/                   # ✅ 認証機能
│   │   └── index.ts            # 認証ユーティリティ関数
│   ├── supabase/               # ✅ Supabase設定
│   │   ├── client.ts           # クライアント設定
│   │   ├── server.ts           # サーバーサイド設定
│   │   ├── types.ts            # データベース型定義
│   │   └── index.ts            # エクスポート統合
│   ├── qr-generator.ts         # ✅ QRコード生成・検証 (新規追加)
│   ├── pdf-generator.ts        # ✅ PDF生成・QRコード統合 (新規追加)
│   ├── stripe.ts               # ✅ Stripe設定・ユーティリティ
│   ├── paypay.ts               # ✅ PayPay設定・API統合
│   └── utils.ts                # ✅ shadcn/ui cn()関数・日付フォーマット
├── types/                      # ✅ 型定義
│   ├── payment.ts              # ✅ 決済関連型定義
│   └── ticket.ts               # ✅ チケット・QR関連型定義 (新規追加)
└── utils/                      # ヘルパー関数 (今後追加予定)
```

## プロジェクトルート構造追加

```
ticket-hub/
├── .claude/                    # Claude Code設定・ドキュメント
│   ├── docs/                   # プロジェクト設計ドキュメント
│   │   ├── auth-design.md      # ✅ 認証システム設計
│   │   ├── database-schema.md  # ✅ データベース設計
│   │   ├── directory-structure.md
│   │   ├── payment-implementation.md # ✅ 決済システム実装
│   │   ├── qr-ticket-implementation.md # ✅ QRコード・チケットシステム実装 (新規)
│   │   ├── supabase-setup-complete.md # ✅ セットアップ完了レポート
│   │   └── ui-restructuring-guide.md
│   └── tasks/                  # タスク管理
├── supabase/                   # ✅ Supabase設定 (新規追加)
│   └── migrations/             # データベースマイグレーション
│       ├── 001_create_initial_tables.sql
│       └── 002_setup_row_level_security.sql
├── .env.example               # ✅ 環境変数テンプレート (新規)
└── [既存の設定ファイル...]
```

## 主要な変更点 (QRコード・チケットシステム実装完了)

### ✅ 新規追加（QRコード・チケットシステム）
- `src/lib/qr-generator.ts` - QRコード生成・検証・セキュリティライブラリ
- `src/lib/pdf-generator.ts` - PDF生成・QRコード統合ライブラリ
- `src/components/ticket/` - QRコード関連コンポーネント (3ファイル)
- `src/types/ticket.ts` - チケット・QR関連型定義
- `src/app/api/tickets/verify/` - QRコード検証API
- `.claude/docs/qr-ticket-implementation.md` - QRシステム実装ドキュメント

### ✅ インストール済み（追加ライブラリ）
- `qrcode.react` - React用QRコード生成
- `html5-qrcode` - ブラウザQRコードスキャン（モバイル対応）
- `jspdf` - PDF生成
- `qrcode` - QRコード画像生成（PDF用）

### ✅ 機能統合完了
- マイチケットページ: QRコード表示・PDF出力機能統合
- 管理画面スキャナー: html5-qrcodeベースの高精度スキャン機能
- チケットカードコンポーネント: QRコード表示機能統合
- セキュリティ: SHA256署名・時限トークン・偽造対策完備

## 従来の変更点 (UI再構造化)

### ✅ 新規追加
- `components/ui/` - shadcn/ui基本コンポーネント (10ファイル)
- `components/shared/` - 共通ビジネスコンポーネント (3ファイル)
- `components/layout/AdminLayout.tsx` - 管理画面レイアウト
- 各ディレクトリの`index.ts` - クリーンなインポート対応
- `lib/utils.ts` - Tailwind CSS統合ユーティリティ

### ✅ 更新済み
- `app/admin/page.tsx` - AdminLayout + StatsCard適用
- `app/page.tsx` - EventCard適用
- `app/globals.css` - shadcn/ui CSS変数統合
- `package.json` - shadcn/ui依存関係追加

### ⚠️ 今後対応予定
- `app/admin/customers/page.tsx` - 型エラー修正済み、UI統合は未実装
- `app/admin/orders/page.tsx` - any型残存
- `app/admin/scanner/page.tsx` - any型残存
- `app/profile/page.tsx` - any型残存
- 全ての`<img>`タグのNext.js `<Image>`への移行

## 技術スタック

### コア
- **Next.js 15** (App Router + Turbopack)
- **React 19.1.0**
- **TypeScript**

### スタイリング
- **Tailwind CSS v4** 
- **shadcn/ui v2** (New York style)
- **class-variance-authority**
- **tailwind-merge** + **clsx**

### 開発・テスト
- **Jest** (テストフレームワーク)
- **ESLint** (コード品質)
- **TypeScript** (型安全性)