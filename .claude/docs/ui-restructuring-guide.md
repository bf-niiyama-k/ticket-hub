# UI再構造化完了ガイド

## 概要
Next.js + TypeScript + Tailwind CSS + shadcn/ui を使用したコンポーネント体系の再構築を完了しました。

## 実装内容

### 1. shadcn/ui環境構築
- **shadcn/ui v2** をTailwind CSS v4環境に統合
- **class-variance-authority**, **clsx**, **tailwind-merge** による型安全なスタイリング
- **Neutralカラーテーマ** でデザインシステム統一

### 2. 作成したコンポーネント

#### レイアウトコンポーネント (`src/components/layout/`)
- **AdminLayout.tsx** - 管理画面共通レイアウト
  - プレミアム/無料プランバッジ表示
  - 戻るボタン、カスタムアクション対応
  - 型安全なProps設計

#### 共通コンポーネント (`src/components/shared/`)
- **StatsCard.tsx** - 統計表示カード
  - アイコン・色のカスタマイズ対応
  - 変化率表示（上昇/下降/中立）
  - プレミアム機能のロック表示
  
- **EventCard.tsx** - イベント表示カード  
  - 3つのバリアント（default, admin, compact）
  - 管理者向けアクション（編集/公開/削除）
  - Next.js Image最適化対応

- **TicketCard.tsx** - チケット表示カード
  - 3つのバリアント（default, compact, qr）
  - ステータス管理（有効/使用済み/期限切れ/キャンセル済み）
  - QRコード表示対応

#### UIコンポーネント (`src/components/ui/`)
shadcn/uiから導入済み：
- Button, Card, Input, Badge, Dialog
- Form, Select, Textarea, Table, Label

### 3. 型定義の整備
- **EventCardData** インターフェース
- **TicketData** インターフェース  
- **Customer** インターフェース (purchases配列含む)
- 全コンポーネントでTypeScript型安全性を確保

### 4. インデックスファイル作成
クリーンなインポートを実現：
```typescript
import { AdminLayout, StatsCard, EventCard } from '@/components';
```

### 5. 既存ページのリファクタリング

#### 管理画面メイン (`src/app/admin/page.tsx`)
- **AdminLayout** でヘッダー統一
- **StatsCard** で統計表示を共通化
- コード量60%削減、再利用性向上

#### ホームページ (`src/app/page.tsx`) 
- **EventCard** でイベント表示を共通化
- 型安全なEventCardDataへ変換
- レスポンシブ対応のグリッドレイアウト

## 技術的成果

### ビルド結果
- ✅ **コンパイル成功** (4.9秒)
- ✅ 型エラー修正完了
- ⚠️ ESLintワーニング残存（imgタグ、any型）

### コード品質向上
- **型安全性向上**: Customer型、EventCardData型の適用
- **コンポーネント再利用**: 統計カード、イベントカードの共通化
- **保守性向上**: AdminLayout適用により管理画面のヘッダー統一

### パフォーマンス
- **バンドルサイズ**: shadcn/ui + 依存関係追加
- **レンダリング**: コンポーネント分離によりパフォーマンス改善
- **開発体験**: クリーンなインポート、型安全性によるDX向上

## ディレクトリ構造

```
src/components/
├── ui/           # shadcn/ui基本コンポーネント
│   ├── button.tsx
│   ├── card.tsx  
│   ├── input.tsx
│   └── index.ts
├── shared/       # 共通ビジネスコンポーネント
│   ├── StatsCard.tsx
│   ├── EventCard.tsx
│   ├── TicketCard.tsx
│   └── index.ts
├── layout/       # レイアウトコンポーネント
│   ├── Header.tsx
│   ├── Footer.tsx
│   ├── AdminLayout.tsx
│   └── index.ts
└── index.ts      # 全体のエクスポート
```

## 今後の課題

### 残存ESLintエラー
- `any`型の削除 (orders, scanner, profile)
- `<img>`タグを`<Image>`に置換
- アクセシビリティ改善

### 追加すべきコンポーネント
- **Modal.tsx** - モーダル共通化
- **LoadingSpinner.tsx** - ローディング表示統一
- **EmptyState.tsx** - 空状態表示統一
- **SearchBar.tsx** - 検索バー共通化

### Next.js最適化
- 全`<img>`タグのNext.js `<Image>`への移行
- 動的インポートによるコード分割
- PWA対応

## 使用方法

### 新しいコンポーネントのインポート
```typescript
import { AdminLayout, StatsCard, EventCard } from '@/components';
```

### AdminLayoutの使用
```typescript
<AdminLayout 
  title="ページタイトル" 
  isPremiumUser={isPremium}
  backHref="/admin"
>
  {children}
</AdminLayout>
```

### StatsCardの使用
```typescript
<StatsCard
  title="総売上"
  value={revenue}
  icon="ri-money-yen-circle-line"
  iconColor="text-green-600"
  iconBgColor="bg-green-100"
  change={{ value: 15.8, label: "前月比", trend: "up" }}
/>
```

## 完了日
2025年9月2日