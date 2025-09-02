
# プロジェクト ディレクトリ構造

最終更新: 2025年9月2日 (UI再構造化タスク完了後)

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
│   ├── checkout/               # チェックアウトページ
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
│   │   ├── EventCard.tsx       # ✅ 新規作成
│   │   ├── StatsCard.tsx       # ✅ 新規作成  
│   │   ├── TicketCard.tsx      # ✅ 新規作成
│   │   └── index.ts            # 型定義含むエクスポート
│   ├── layout/                 # レイアウトコンポーネント
│   │   ├── AdminLayout.tsx     # ✅ 新規作成
│   │   ├── Footer.tsx          # 既存
│   │   ├── Header.tsx          # 既存
│   │   └── index.ts            # エクスポート
│   └── index.ts                # 全体統合エクスポート
│
├── hooks/                      # カスタムフック (今後追加予定)
├── lib/                        # ユーティリティ
│   └── utils.ts                # ✅ shadcn/ui cn()関数
├── types/                      # 型定義 (今後追加予定)
└── utils/                      # ヘルパー関数 (今後追加予定)
```

## 主要な変更点 (UI再構造化)

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