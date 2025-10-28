
# プロジェクト ディレクトリ構造

最終更新: 2025年10月28日 (返金API追加)

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
│   ├── api/                    # ✅ API Routes (7エンドポイント)
│   │   ├── orders/             # ✅ 注文API
│   │   │   ├── by-custom-id/   # カスタムID検索
│   │   │   │   └── route.ts
│   │   │   └── by-payment/     # 決済ID検索
│   │   │       └── route.ts
│   │   ├── payments/           # ✅ 決済API
│   │   │   ├── create-payment-intent/
│   │   │   │   └── route.ts    # 決済Intent作成API
│   │   │   ├── confirm-payment/
│   │   │   │   └── route.ts    # 決済確認API
│   │   │   └── refund/         # ✅ 返金API (2025-10-28追加)
│   │   │       └── route.ts    # Stripe返金処理・在庫復元
│   │   ├── tickets/            # ✅ チケットAPI
│   │   │   └── verify/         # ✅ QRコード検証API
│   │   │       └── route.ts    # チケット検証・使用済みマーク
│   │   └── webhooks/           # ✅ Webhook
│   │       └── stripe/         # Stripe Webhook
│   │           └── route.ts    # 決済完了通知
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
│   ├── shared/                 # 共通ビジネスコンポーネント (5ファイル)
│   │   ├── ErrorScreen.tsx     # ✅ エラー画面コンポーネント
│   │   ├── EventCard.tsx       # ✅ イベント表示カード
│   │   ├── LoadingScreen.tsx   # ✅ ローディング画面コンポーネント
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
│   ├── ticket/                 # ✅ QRコード・チケットコンポーネント (4ファイル)
│   │   ├── QRCode.tsx          # ✅ QRコード画像生成 (react-qr-code使用)
│   │   ├── QRCodeDisplay.tsx   # ✅ QRコード表示
│   │   ├── QRCodeModal.tsx     # ✅ QRコードモーダル
│   │   └── QRCodeScanner.tsx   # ✅ QRコードスキャナー (基本実装のみ)
│   └── index.ts                # 全体統合エクスポート
│
├── hooks/                      # ✅ カスタムフック (7ファイル)
│   ├── useAnalytics.ts         # ✅ 売上分析データフック
│   ├── useAuth.ts              # ✅ 認証状態管理フック
│   ├── useCustomers.ts         # ✅ 顧客データ取得フック
│   ├── useEvents.ts            # ✅ イベントデータ取得フック
│   ├── useOrders.ts            # ✅ 注文データ取得フック
│   ├── usePayment.ts           # ✅ 決済処理フック
│   ├── useTickets.ts           # ✅ チケットデータ取得フック
│   └── index.ts                # エクスポート統合
├── lib/                        # ライブラリ・ユーティリティ (11ファイル)
│   ├── auth/                   # ✅ 認証機能
│   │   └── index.ts            # 認証ユーティリティ関数
│   ├── supabase/               # ✅ Supabase設定 (5ファイル)
│   │   ├── admin.ts            # 管理者用クライアント
│   │   ├── client.ts           # クライアント設定
│   │   ├── server.ts           # サーバーサイド設定
│   │   ├── types.ts            # データベース型定義
│   │   └── index.ts            # エクスポート統合
│   ├── database.ts             # ✅ データベースAPI (eventAPI, ticketAPI, orderAPIなど)
│   ├── qr-generator.ts         # ✅ QRコード生成・検証
│   ├── pdf-generator.ts        # ✅ PDF生成・QRコード統合
│   ├── stripe.ts               # ✅ Stripe設定・ユーティリティ (サーバー用)
│   ├── stripe-client.ts        # ✅ Stripe設定 (クライアント用)
│   ├── paypay.ts               # ✅ PayPay設定・API統合
│   └── utils.ts                # ✅ shadcn/ui cn()関数・日付フォーマット
├── types/                      # ✅ 型定義 (4ファイル)
│   ├── auth.ts                 # ✅ 認証関連型定義
│   ├── database.ts             # ✅ データベース型定義
│   ├── payment.ts              # ✅ 決済関連型定義
│   └── ticket.ts               # ✅ チケット・QR関連型定義
└── middleware.ts               # ✅ Next.js認証ミドルウェア
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

### 📊 統計情報（2025年10月5日時点）

- **総ファイル数**: 84ファイル (TypeScript/TSX)
- **ビルド成功**: 36ページすべて正常
- **TypeScriptエラー**: 0件
- **ESLint警告**: 2件（coverageフォルダのみ、影響なし）

### ⚠️ 未完了・改善点

**高優先度（機能未完了）**:
- `app/profile/page.tsx` - ハードコーディングデータ、DB連携未実装
- `app/admin/scanner/page.tsx` - 基本構造のみ、実際のQRスキャン機能未実装
- `app/admin/orders/page.tsx` - 返金処理が部分実装（Stripe API未統合）
- `app/my-tickets/page.tsx` - PDFダウンロード機能未実装
- `app/admin/analytics/page.tsx` - 売上分析のダミーデータ残存

**中優先度（機能追加）**:
- カテゴリ機能 - DBスキーマにカラム追加が必要
- イベント並び替え機能 - UI実装済みだが機能していない
- 検索機能 - 注文管理ページで未実装

**低優先度（品質向上）**:
- デバッグログの環境別制御（console.log 20+箇所）
- `any`型の削減（`src/lib/auth/index.ts:28`など）
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