# Task: DB・フロントエンド統合の残作業

**優先度**: 🟡 高 (未完了のDB連携)

## 目的

ハードコーディングされているデータをDBから取得するように変更し、データの永続化と一貫性を確保する。

## 参照ドキュメント

- `.claude/spec/spec-data-persistance.md`
- `src/hooks/useOrders.ts`
- `src/hooks/useTickets.ts`
- `src/lib/database.ts`

## ハードコーディング箇所の調査結果

### ✅ 既に統合済み

1. **ホームページ** (`src/app/page.tsx`)
   - `useEvents(true)` でDBから公開イベントを取得済み
   - カテゴリはDBにないためデフォルト値を使用

2. **イベント一覧ページ** (`src/app/events/page.tsx`)
   - `useEvents(true)` でDBから公開イベントを取得済み
   - カテゴリフィルターは未実装（DBスキーマに追加が必要）

3. **イベント詳細ページ** (`src/app/events/[id]/EventDetail.tsx`)
   - `useEvent(eventId)` でDBからイベント情報を取得済み
   - LoadingScreen、ErrorScreenも実装済み

4. **チェックアウトページ** (`src/app/checkout/page.tsx`)
   - `useEvent(eventId)` でDBからイベント情報を取得済み
   - 在庫確認機能も実装済み

5. **管理画面 - イベント管理** (`src/app/admin/events/page.tsx`)
   - `useEvents(false)` でDBからすべてのイベントを取得済み
   - CRUD操作も実装済み

6. **管理画面 - 注文管理** (`src/app/admin/orders/page.tsx`)
   - `useOrders()` でDBから注文情報を取得済み
   - `useCustomers()` で顧客情報を取得済み
   - `useEvents(false)` でイベント情報を取得済み

---

### ❌ DB連携が必要な箇所

#### 0. **管理画面 - イベント詳細（編集）ページ** (`src/app/admin/events/[id]/EventEdit.tsx`)

**問題点**:
- イベント情報が完全にハードコーディング（40-137行目）
- チケット情報もハードコーディング
- 保存機能が未実装（alert表示のみ）
- `useEvent(eventId)` フックが使用されていない

**必要な実装**:
```typescript
// 既存のuseEventフックを使用
const { event, loading, error, refetch } = useEvent(eventId);

// チケット種類の更新用にticketTypeAPIを使用
import { ticketTypeAPI } from '@/lib/database';
```

**実装内容**:
- ✅ `useEvent(eventId)` でDBからイベント情報を取得
- ✅ イベント基本情報の更新処理を実装（`eventAPI.updateEvent`）
- ✅ `ticketTypeAPI.deleteTicketType(id)` を追加（`src/lib/database.ts`）
- ✅ チケット種類の作成・更新・削除処理を実装（`ticketTypeAPI`）
- ✅ LoadingScreen、ErrorScreenの統合
- ✅ 保存成功時のフィードバック（トースト通知など）
- [ ] チケット販売状況（sold数）をDBから取得（注文済みチケット数の集計）

---

#### 1. **購入完了ページ** (`src/app/purchase-complete\page.tsx`)

**問題点**:
- 注文情報が完全にハードコーディング（24-40行目）
- QRコード生成がシミュレーション（13-22行目）
- URLパラメータから注文IDを取得していない

**必要な実装**:
```typescript
// URLパラメータから注文IDを取得
const searchParams = useSearchParams();
const orderId = searchParams.get('orderId');

// 注文情報をDBから取得
const { order, loading, error } = useOrder(orderId);

// チケット情報を取得してQRコードを表示
const { tickets } = useTickets(orderId);
```

**実装内容**:
- ✅ `useOrder(orderId)` フックの実装（`src/hooks/useOrders.ts` に追加）
- ✅ `useTickets(orderId)` フックの実装（新規作成 `src/hooks/useTickets.ts`）
- ✅ URLパラメータから注文IDを取得
- ✅ DBから注文情報・チケット情報を取得
- ✅ QRコード表示（`tickets.qr_code` を使用）
- ✅ LoadingScreen、ErrorScreenの統合
- [ ] チケットPDFダウンロード機能の実装（実際のQRコード含む）- Phase 3で実装予定

---

#### 2. **マイチケットページ** (`src/app/my-tickets\page.tsx`)

**問題点**:
- チケット情報が完全にハードコーディング（17-82行目）
- ユーザー認証と連携していない
- 実際のQRコードを表示していない

**必要な実装**:
```typescript
// ユーザー認証
const { user } = useAuth();

// ユーザーのチケットをDBから取得
const { tickets, loading, error } = useUserTickets(user?.id);

// タブでフィルタリング
const upcomingTickets = tickets.filter(t => t.status === 'valid' && new Date(t.event.date_start) > new Date());
const pastTickets = tickets.filter(t => t.status === 'used' || new Date(t.event.date_start) <= new Date());
```

**実装内容**:
- ✅ `useUserTickets(userId)` フックの実装（新規作成 `src/hooks/useTickets.ts`）
- [ ] ユーザー認証との統合（`useAuth`）- 認証機能未実装のため保留（TODO追加済み）
- ✅ DBからチケット情報・イベント情報を取得
- ✅ 実際のQRコードを表示（`ticket.qr_code`）
- ✅ LoadingScreen、ErrorScreenの統合
- [ ] 未ログイン時の処理（リダイレクトまたはメッセージ表示）- 認証機能未実装のため保留
- ✅ チケットステータスの判定（valid/used/expired）

---

#### 3. **カテゴリ機能の追加** (オプション)

**問題点**:
- イベント一覧のカテゴリフィルターが機能していない（30行目）
- DBにカテゴリフィールドがない

**必要な実装**:
- [ ] DBスキーマにカテゴリフィールドを追加（`events.category`）
- [ ] イベント作成・編集時にカテゴリを設定
- [ ] カテゴリフィルターの実装

---

## 実装計画

### Phase 1: 購入完了ページのDB連携

#### 1-1. useOrderフックの実装
**ファイル**: `src/hooks/useOrders.ts`

```typescript
export function useOrder(orderId: string | null) {
  const [order, setOrder] = useState<OrderWithItems | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      return;
    }

    const fetchOrder = async () => {
      try {
        setLoading(true);
        const data = await orderAPI.getOrderById(orderId);
        setOrder(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : '注文情報の取得に失敗しました');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  return { order, loading, error };
}
```

#### 1-2. useTicketsフックの実装
**ファイル**: `src/hooks/useTickets.ts` (新規作成)

```typescript
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import type { TicketWithDetails } from '@/types/database';

export function useTickets(orderId: string | null) {
  const [tickets, setTickets] = useState<TicketWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      return;
    }

    const fetchTickets = async () => {
      try {
        setLoading(true);

        // 注文IDに紐づくチケットを取得
        const { data: orderItems } = await supabase
          .from('order_items')
          .select('id')
          .eq('order_id', orderId);

        if (!orderItems || orderItems.length === 0) {
          setTickets([]);
          return;
        }

        const orderItemIds = orderItems.map(item => item.id);

        // チケットとイベント情報を取得
        const { data, error: fetchError } = await supabase
          .from('tickets')
          .select(`
            *,
            event:events(*),
            ticket_type:ticket_types(*)
          `)
          .in('order_item_id', orderItemIds);

        if (fetchError) throw fetchError;
        setTickets(data as TicketWithDetails[]);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'チケット情報の取得に失敗しました');
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, [orderId]);

  return { tickets, loading, error };
}

export function useUserTickets(userId: string | undefined) {
  const [tickets, setTickets] = useState<TicketWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchUserTickets = async () => {
      try {
        setLoading(true);

        const { data, error: fetchError } = await supabase
          .from('tickets')
          .select(`
            *,
            event:events(*),
            ticket_type:ticket_types(*)
          `)
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (fetchError) throw fetchError;
        setTickets(data as TicketWithDetails[]);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'チケット情報の取得に失敗しました');
      } finally {
        setLoading(false);
      }
    };

    fetchUserTickets();
  }, [userId]);

  return { tickets, loading, error, refetch: () => {} };
}
```

#### 1-3. 購入完了ページの更新
**ファイル**: `src/app/purchase-complete/page.tsx`

- [ ] ハードコーディングされた`orderDetails`を削除
- [ ] URLパラメータから注文IDを取得
- [ ] `useOrder(orderId)` でDBから注文情報を取得
- [ ] `useTickets(orderId)` でDBからチケット情報を取得
- [ ] 実際のQRコードを表示
- [ ] LoadingScreen、ErrorScreenを統合

---

### Phase 2: マイチケットページのDB連携

#### 2-1. マイチケットページの更新
**ファイル**: `src/app/my-tickets/page.tsx`

- [ ] ハードコーディングされた`tickets`オブジェクトを削除
- [ ] `useAuth()` でユーザー情報を取得
- [ ] `useUserTickets(user?.id)` でDBからチケット情報を取得
- [ ] チケットステータスの判定ロジックを実装
- [ ] LoadingScreen、ErrorScreenを統合
- [ ] 未ログイン時の処理（リダイレクト）

---

### Phase 3: QRコード生成とPDF生成の実装

#### 3-1. QRコード表示
- [ ] `qrcode` ライブラリのインストール (`npm install qrcode`)
- [ ] QRコードコンポーネントの実装（`ticket.qr_code` から生成）

#### 3-2. PDF生成
- [ ] `jsPDF` と `html2canvas` を使用したPDF生成
- [ ] チケットテンプレートの作成（QRコード、イベント情報、購入者情報）

---

## 技術的な注意点

### 認証
- マイチケットページは認証が必要（未ログイン時はログインページへリダイレクト）
- 購入完了ページは注文IDがあれば閲覧可能（ゲスト購入対応）

### QRコード
- DBに保存されている`qr_code`文字列からQR画像を生成
- QRコードモーダル、PDF、チケット一覧で使用

### エラーハンドリング
- 注文が見つからない場合の処理
- チケットが見つからない場合の処理
- ネットワークエラー

---

## 進捗メモ

### 完了日: 2025-10-01

### ビルドテスト完了: 2025-10-01

プロダクションビルドが成功しました。すべてのTypeScriptエラーとビルドエラーを修正しました。

**修正したエラー**:
1. LoadingScreen/ErrorScreenのexport/import不一致を修正（default exportに統一）
2. my-tickets/page.tsxのJSX構文エラーを修正（テンプレートリテラル使用）
3. EventEdit.tsxのTypeScript型エラーを修正
   - `time_start`, `venue`フィールドを削除（DB型定義に存在しない）
   - `location`, `date_end`フィールドを使用
   - `quantity`を`quantity_total`/`quantity_sold`に変更
   - `updateTicketType`関数にboolean型を追加
4. purchase-complete/page.tsxのフィールド名を修正
   - `subtotal` → `total_price`
   - `customer_name`, `customer_email` → `guest_info.name`, `guest_info.email`
5. QRCodeコンポーネントのインポートを修正（default import使用）
6. `marginSize`プロップを削除（react-qr-codeライブラリに存在しない）
7. purchase-complete/page.tsxに`Suspense`を追加（useSearchParamsのため）

**ビルド結果**:
- 33ページすべて正常にビルド完了
- TypeScriptエラー: 0件
- ESLint警告: 2件（useCallbackのdependency最適化の推奨のみ）

### 実装内容

#### Phase 0: 管理画面 - イベント詳細ページのDB連携 ✅
- `ticketTypeAPI.deleteTicketType(id)` を追加（`src/lib/database.ts`）
- `EventEdit.tsx` を完全にDB連携
  - `useEvent(eventId)` でDBからイベント情報を取得
  - イベント基本情報の更新処理を実装
  - チケット種類のCRUD処理を実装（作成・更新・削除）
  - LoadingScreen、ErrorScreenの統合
  - 保存成功時のフィードバック実装

#### Phase 1: 購入完了ページのDB連携 ✅
- `useOrder(orderId)` フックを `src/hooks/useOrders.ts` に追加
- `useTickets(orderId)` フックを新規作成（`src/hooks/useTickets.ts`）
- `orderAPI.getOrderById(orderId)` を追加（`src/lib/database.ts`）
- `purchase-complete/page.tsx` を完全にDB連携
  - URLパラメータから注文IDを取得
  - DBから注文情報・チケット情報を取得
  - 実際のQRコード文字列を表示（画像生成はPhase 3）
  - LoadingScreen、ErrorScreenの統合

#### Phase 2: マイチケットページのDB連携 ✅
- `useUserTickets(userId)` フックを実装（`src/hooks/useTickets.ts`）
- `my-tickets/page.tsx` を完全にDB連携
  - DBからユーザーのチケット情報を取得
  - チケットステータスの判定（valid/used）
  - イベント日時による自動フィルタリング（予定/過去）
  - LoadingScreen、ErrorScreenの統合
  - 認証フックは未実装のため、仮のユーザーIDを使用（TODO追加済み）

### 実装したファイル一覧

**新規作成**:
- `src/hooks/useTickets.ts` - チケット情報取得フック
- `src/components/ticket/QRCode.tsx` - QRコード画像生成コンポーネント

**更新**:
- `src/lib/database.ts` - `ticketTypeAPI.deleteTicketType`, `orderAPI.getOrderById` を追加
- `src/hooks/useOrders.ts` - `useOrder` フックを追加
- `src/app/admin/events/[id]/EventEdit.tsx` - 完全DB連携
- `src/app/purchase-complete/page.tsx` - 完全DB連携、QRコード画像統合
- `src/app/my-tickets/page.tsx` - 完全DB連携
- `src/components/ticket/QRCodeModal.tsx` - シンプルな実装に変更、QRコード画像表示

#### Phase 3: QRコード画像生成の実装 ✅
- `react-qr-code` ライブラリのインストール
- QRCodeコンポーネントの新規作成（`src/components/ticket/QRCode.tsx`）
- 購入完了ページにQRコード画像を統合
- QRCodeModalコンポーネントを更新して実際のQRコード画像を表示

**新規作成したファイル**:
- `src/components/ticket/QRCode.tsx` - QRコード画像生成コンポーネント

**更新したファイル**:
- `src/app/purchase-complete/page.tsx` - QRコード画像を統合
- `src/components/ticket/QRCodeModal.tsx` - シンプルな実装に変更、QRコード画像を表示

### 今後の改善点

1. **PDF生成機能の実装**（Phase 3の一部、未実装）
   - `jsPDF`, `html2canvas` のインストール
   - チケットPDFダウンロード機能の実装（QRコード画像含む）

2. **認証機能の統合**
   - `useAuth` フックの実装
   - マイチケットページの認証チェック実装
   - 未ログイン時のリダイレクト処理

3. **カテゴリ機能の追加**（オプション）
   - DBスキーマにカテゴリフィールドを追加
   - イベント一覧のカテゴリフィルター実装

4. **チケット販売状況の集計**
   - 管理画面イベント詳細ページで、実際の販売済みチケット数（sold数）をDBから集計して表示

5. **エラーハンドリングの強化**
   - より詳細なエラーメッセージ
   - ネットワークエラーのリトライ機能
