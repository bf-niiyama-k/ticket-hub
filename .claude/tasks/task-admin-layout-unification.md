# Task: 管理画面レイアウト統一

**優先度**: 🔴 高（UI/UXの一貫性向上）

## 実装計画

全ての管理画面ページでAdminLayoutコンポーネントを使用し、UI/UXの一貫性を確保する。

## 調査・追跡対象ファイル
- `.claude/docs/directory-structure.md`
- `.claude/tasks/TASK.md`
- `src/components/layout/AdminLayout.tsx`
- `src/app/admin/customers/page.tsx`
- `src/app/admin/orders/page.tsx`
- `src/app/admin/analytics/page.tsx`
- `src/app/admin/scanner/page.tsx`

---

### Phase 1: 調査・設計

#### 1-1. 現在の実装状況確認
- [x] 調査完了：AdminLayoutを使用しているページを特定
  - ✅ 使用中: `admin/page.tsx`（ダッシュボード）
  - ❌ 未使用: `admin/customers/page.tsx`
  - ❌ 未使用: `admin/orders/page.tsx`
  - ❌ 未使用: `admin/analytics/page.tsx`
  - ❌ 未使用: `admin/scanner/page.tsx`

#### 1-2. AdminLayoutの仕様確認
- [ ] AdminLayoutのpropsを確認
  - `children`: React.ReactNode（必須）
  - `title`: string（必須）
  - `backHref`: string（オプション）
  - `actions`: React.ReactNode（オプション）
  - `isPremiumUser`: boolean（オプション、デフォルト: false）

#### 1-3. 各ページの独自ヘッダー機能を確認
- [ ] 顧客管理ページのヘッダー機能
  - 戻るボタン
  - タイトル表示
  - 検索バー
- [ ] 注文管理ページのヘッダー機能
  - 戻るボタン
  - タイトル表示
  - フィルタードロップダウン
- [ ] 売上分析ページのヘッダー機能
  - 戻るボタン
  - タイトル表示
  - プレミアムバッジ
  - 期間選択ドロップダウン

#### 1-4. 設計方針決定
- [ ] AdminLayoutの拡張が必要か判断
  - 検索バー、フィルタードロップダウンなどをactionsプロパティで実装可能
  - 既存のpropsで対応可能

---

### Phase 2: 実装

#### 2-1. 顧客管理ページの移行

**ファイル**: `src/app/admin/customers/page.tsx`

- [ ] 独自ヘッダー削除（58-73行目）
- [ ] AdminLayoutをインポート
- [ ] ページ全体をAdminLayoutでラップ
- [ ] 検索バーをactionsプロパティに移動

**実装例**:
```typescript
import { AdminLayout } from '@/components';

export default function CustomerManagement() {
  const { customers, loading, error } = useCustomers();
  const { orders } = useOrders();
  const [searchTerm, setSearchTerm] = useState('');

  // 検索バーコンポーネント
  const SearchBar = (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <i className="ri-search-line text-gray-400"></i>
      </div>
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
        placeholder="名前またはメールで検索"
      />
    </div>
  );

  if (loading) return <LoadingScreen />;
  if (error) return <ErrorScreen message={error} />;

  return (
    <AdminLayout
      title="顧客管理"
      backHref="/admin"
      actions={SearchBar}
    >
      {/* 統計カード */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {/* ... */}
      </div>

      {/* 顧客一覧テーブル */}
      <div className="bg-white rounded-lg shadow-sm">
        {/* ... */}
      </div>

      {/* モーダル */}
      {/* ... */}
    </AdminLayout>
  );
}
```

#### 2-2. 注文管理ページの移行

**ファイル**: `src/app/admin/orders/page.tsx`

- [ ] 独自ヘッダー削除
- [ ] AdminLayoutをインポート
- [ ] ページ全体をAdminLayoutでラップ
- [ ] フィルタードロップダウンをactionsプロパティに移動

**実装例**:
```typescript
import { AdminLayout } from '@/components';

export default function OrderManagement() {
  const { orders, loading, error } = useOrders();
  const [filterStatus, setFilterStatus] = useState('all');

  // フィルタードロップダウン
  const FilterDropdown = (
    <select
      value={filterStatus}
      onChange={(e) => setFilterStatus(e.target.value)}
      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
    >
      <option value="all">すべて</option>
      <option value="paid">支払済み</option>
      <option value="pending">保留中</option>
      <option value="cancelled">キャンセル</option>
      <option value="refunded">返金済み</option>
    </select>
  );

  if (loading) return <LoadingScreen />;
  if (error) return <ErrorScreen message={error} />;

  return (
    <AdminLayout
      title="注文管理"
      backHref="/admin"
      actions={FilterDropdown}
    >
      {/* 注文一覧 */}
      {/* ... */}
    </AdminLayout>
  );
}
```

#### 2-3. 売上分析ページの移行

**ファイル**: `src/app/admin/analytics/page.tsx`

- [ ] 独自ヘッダー削除（76-114行目）
- [ ] AdminLayoutをインポート
- [ ] ページ全体をAdminLayoutでラップ
- [ ] 期間選択ドロップダウンをactionsプロパティに移動
- [ ] プレミアムユーザー判定をAdminLayoutに委任

**実装例**:
```typescript
import { AdminLayout } from '@/components';

export default function Analytics() {
  const { user } = useAuth();
  const { stats, eventSales, loading, error } = useAnalytics();
  const [dateRange, setDateRange] = useState('7days');

  const isPremiumUser = user?.role === 'admin';

  // 期間選択ドロップダウン
  const DateRangeSelector = (
    <select
      value={dateRange}
      onChange={(e) => setDateRange(e.target.value)}
      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
    >
      <option value="7days">過去7日</option>
      <option value="30days">過去30日</option>
      <option value="90days">過去90日</option>
    </select>
  );

  if (loading) return <LoadingScreen />;
  if (error) return <ErrorScreen message={error} />;
  if (!stats) return <ErrorScreen message="データがありません" />;

  return (
    <AdminLayout
      title="売上分析"
      backHref="/admin"
      actions={DateRangeSelector}
      isPremiumUser={isPremiumUser}
    >
      {/* グラフ・統計 */}
      {/* ... */}
    </AdminLayout>
  );
}
```

#### 2-4. QRスキャナーページの確認と移行

**ファイル**: `src/app/admin/scanner/page.tsx`

- [ ] 現在のヘッダー実装を確認
- [ ] AdminLayoutへ移行

---

### Phase 3: 検証

#### 3-1. 各ページの動作確認
- [ ] 顧客管理ページ
  - [ ] ページ表示確認
  - [ ] 検索機能動作確認
  - [ ] レスポンシブデザイン確認
  - [ ] 戻るボタン動作確認
  - [ ] ログアウト機能確認

- [ ] 注文管理ページ
  - [ ] ページ表示確認
  - [ ] フィルター機能動作確認
  - [ ] レスポンシブデザイン確認
  - [ ] 戻るボタン動作確認

- [ ] 売上分析ページ
  - [ ] ページ表示確認
  - [ ] 期間選択機能動作確認
  - [ ] プレミアムバッジ表示確認
  - [ ] レスポンシブデザイン確認

- [ ] QRスキャナーページ
  - [ ] ページ表示確認
  - [ ] レスポンシブデザイン確認

#### 3-2. UI/UXの一貫性確認
- [ ] 全ページでヘッダーの高さが統一されている
- [ ] ロゴ・ナビゲーションが統一されている
- [ ] ログアウトボタンが統一されている
- [ ] プレミアムバッジが統一されている

#### 3-3. テスト実行
- [ ] TypeScriptエラー確認
  ```bash
  npx tsc --noEmit
  ```

- [ ] ESLint警告確認
  ```bash
  npm run lint
  ```

- [ ] ビルド実行
  ```bash
  npm run build
  ```

- [ ] ビルドエラー解消

---

### Phase Last: タスク・ドキュメント更新

- [ ] `.claude/docs/directory-structure.md` の更新
  - AdminLayout使用状況を更新

- [ ] `.claude/tasks/TASK.md` の更新
  - 完了タスクとして記載

- [ ] 進捗メモの更新
  - 実装内容、完了日、改善点を記載

---

## 仕様

### AdminLayoutコンポーネント仕様

**ファイル**: `src/components/layout/AdminLayout.tsx`

```typescript
interface AdminLayoutProps {
  children: React.ReactNode;  // 必須: ページコンテンツ
  title: string;              // 必須: ページタイトル
  backHref?: string;          // オプション: 戻るボタンのリンク先
  actions?: React.ReactNode;  // オプション: ヘッダー右側のカスタムアクション
  isPremiumUser?: boolean;    // オプション: プレミアムユーザーフラグ
}
```

**機能**:
- ✅ 認証情報表示（ユーザー名・メール）
- ✅ プレミアムバッジ表示
- ✅ ログアウト機能
- ✅ 戻るボタン
- ✅ 「サイトを見る」リンク
- ✅ カスタムアクション領域

### 追跡対象ファイル

- `src/components/layout/AdminLayout.tsx` - レイアウトコンポーネント
- `src/components/shared/LoadingScreen.tsx` - ローディング画面
- `src/components/shared/ErrorScreen.tsx` - エラー画面

### 実装対象ファイル

1. `src/app/admin/customers/page.tsx` - 顧客管理ページ
2. `src/app/admin/orders/page.tsx` - 注文管理ページ
3. `src/app/admin/analytics/page.tsx` - 売上分析ページ
4. `src/app/admin/scanner/page.tsx` - QRスキャナーページ

---

## 進捗メモ
<!-- 作業進捗を随時更新 -->
