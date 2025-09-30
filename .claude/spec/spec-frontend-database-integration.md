# フロントエンド・データベース完全連携仕様書

## 概要

現在ハードコーディングされているテストデータを削除し、データベースAPIとカスタムフックを使用した完全なDB連携を実装します。

---

## 1. 現状の問題点

### 1.1 DB連携済みページ ✅
- 管理画面イベント管理 (`/admin/events`)
- 管理画面注文管理 (`/admin/orders`)
- 管理画面顧客管理 (`/admin/customers`)

### 1.2 DB連携未完了ページ ❌
- ホームページ (`/`) - upcomingEvents配列がハードコーディング
- イベント一覧 (`/events`) - events配列がハードコーディング
- イベント詳細 (`/events/[id]`) - events/ticketTypesオブジェクトがハードコーディング
- イベント編集 (`/admin/events/[id]`) - dummyEventsオブジェクトがハードコーディング
- チェックアウト (`/checkout`) - events/ticketsオブジェクトがハードコーディング
- マイチケット (`/my-tickets`) - ticketsオブジェクトがハードコーディング

---

## 2. 使用可能なAPI・フック

### 2.1 既存実装されているカスタムフック

#### useEvents (src/hooks/useEvents.ts) ✅
```typescript
// 全イベント取得用
const { events, loading, error, createEvent, updateEvent, deleteEvent, toggleEventStatus } = useEvents(false);

// 公開イベントのみ取得用
const { events, loading, error } = useEvents(true);

// 単一イベント取得用
const { event, loading, error } = useEvent(eventId);
```

#### useOrders (src/hooks/useOrders.ts) ✅
```typescript
const { orders, loading, error, updateOrder } = useOrders();
```

#### useCustomers (src/hooks/useCustomers.ts) ✅
```typescript
const { customers, loading, error } = useCustomers();
```

### 2.2 データベースAPI (src/lib/database.ts)

#### eventAPI ✅
- `getPublishedEvents()` - 公開イベント一覧取得
- `getAllEvents()` - 全イベント取得（管理者用）
- `getEventById(id)` - 単一イベント取得
- `createEvent(data)` - イベント作成
- `updateEvent(id, updates)` - イベント更新
- `deleteEvent(id)` - イベント削除
- `toggleEventStatus(id)` - 公開状態切り替え

#### orderAPI (部分実装) ⚠️
現在実装されている機能は限定的。追加実装が必要。

#### ticketAPI (未実装) ❌
ユーザーのチケット取得機能が未実装。

---

## 3. 実装方針

### 3.1 基本方針

1. **既存のカスタムフックを最大限活用**
   - `useEvents`, `useOrders`, `useCustomers` を積極的に使用
   - 新規フックが必要な場合のみ追加実装

2. **ローディング・エラー状態の統一**
   - 全ページで統一されたローディングUI
   - エラー時の再読み込み機能実装

3. **型安全性の維持**
   - `EventWithTicketTypes`, `OrderWithItems` 等の型を使用
   - `any`型の使用禁止

---

## 4. ページ別実装詳細

### 4.1 ホームページ (`src/app/page.tsx`)

#### 現状
```typescript
const upcomingEvents: EventCardData[] = [
  { id: 1, title: "東京国際展示会2024", ... }, // ハードコーディング
  { id: 2, title: "ホテル春の特別ディナー", ... },
  { id: 3, title: "ビジネスセミナー2024", ... },
];
```

#### 実装後
```typescript
"use client";

import { useEvents } from "@/hooks";
import type { EventCardData } from "@/components";

export default function Home() {
  const { events, loading, error } = useEvents(true); // 公開イベントのみ取得

  // EventWithTicketTypes → EventCardData に変換
  const upcomingEvents: EventCardData[] = events.slice(0, 3).map(event => ({
    id: event.id,
    title: event.title,
    date: event.date_start,
    venue: event.location,
    price: event.ticket_types?.[0]?.price || 0,
    image: event.image_url || "/img/event.jpg",
    status: event.is_published ? "published" : "draft",
    category: "展示会", // DBにカテゴリがない場合はデフォルト値
  }));

  // ローディング・エラー処理
  if (loading) {
    return <div>読み込み中...</div>;
  }

  if (error) {
    return <div>エラー: {error}</div>;
  }

  // 既存のUIコンポーネントを使用
  return (
    <div>
      {/* 既存のUI */}
      {upcomingEvents.map(event => <EventCard key={event.id} data={event} />)}
    </div>
  );
}
```

#### 必要な作業
- [x] `useEvents(true)` でDB取得
- [ ] データ変換ロジック実装
- [ ] ローディング・エラーUI実装
- [ ] 型安全性確保

---

### 4.2 イベント一覧ページ (`src/app/events/page.tsx`)

#### 現状
```typescript
const events = [
  { id: 1, title: "東京国際展示会2024", ... }, // 114行のハードコーディング
  // ...
];
```

#### 実装後
```typescript
"use client";

import { useEvents } from "@/hooks";

export default function EventsPage() {
  const { events, loading, error } = useEvents(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // フィルタリングロジックはほぼそのまま使用可能
  const filteredEvents = events.filter((event) => {
    const matchesSearch =
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (event.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);

    let matchesDateRange = true;
    if (startDate || endDate) {
      const eventDate = new Date(event.date_start);
      // 既存のフィルタリングロジック
    }

    return matchesSearch && matchesDateRange;
  });

  // ローディング・エラーUI
  if (loading) return <LoadingScreen />;
  if (error) return <ErrorScreen message={error} />;

  // 既存のUIコンポーネントを使用
  return (
    <div>
      {filteredEvents.map((event) => (
        <EventCard
          key={event.id}
          data={{
            id: event.id,
            title: event.title,
            date: event.date_start,
            venue: event.location,
            price: Math.min(...event.ticket_types.map(t => t.price)),
            image: event.image_url || "/img/event.jpg",
            status: "published",
          }}
        />
      ))}
    </div>
  );
}
```

#### 必要な作業
- [ ] `useEvents(true)` でDB取得
- [ ] フィルタリングロジックをDB型に対応
- [ ] ローディング・エラーUI実装
- [ ] 最安値チケット計算ロジック実装

---

### 4.3 イベント詳細ページ (`src/app/events/[id]/EventDetail.tsx`)

#### 現状
```typescript
const events = {
  "1": { id: "1", title: "東京国際展示会2024", ... }, // ハードコーディング
};
const tickets = ticketTypes[eventId] || [];
```

#### 実装後
```typescript
"use client";

import { useEvent } from "@/hooks/useEvents";

interface EventDetailProps {
  eventId: string;
}

export default function EventDetail({ eventId }: EventDetailProps) {
  const { event, loading, error } = useEvent(eventId);
  const [selectedTickets, setSelectedTickets] = useState<Record<string, number>>({});

  if (loading) return <LoadingScreen />;
  if (error || !event) return <ErrorScreen message={error || "イベントが見つかりません"} />;

  // チケット種類は event.ticket_types に含まれている
  const tickets = event.ticket_types || [];

  return (
    <div>
      <h1>{event.title}</h1>
      <p>{event.description}</p>

      {/* チケット選択UI */}
      {tickets.map((ticket) => {
        const available = ticket.quantity_total - ticket.quantity_sold;

        return (
          <div key={ticket.id}>
            <h3>{ticket.name}</h3>
            <p>¥{ticket.price}</p>
            <p>残り {available} 枚</p>
            {/* 数量選択UI */}
          </div>
        );
      })}
    </div>
  );
}
```

#### 必要な作業
- [ ] `useEvent(eventId)` でDB取得
- [ ] チケット在庫表示実装
- [ ] ローディング・エラーUI実装
- [ ] 404エラーハンドリング実装

---

### 4.4 チェックアウトページ (`src/app/checkout/page.tsx`)

#### 現状
```typescript
const events = {
  "1": { title: "東京国際展示会2024", ... }, // ハードコーディング
};
const tickets = ticketTypes[eventId] || [];
```

#### 実装後
```typescript
"use client";

import { useEvent } from "@/hooks/useEvents";
import { useSearchParams } from "next/navigation";

export default function CheckoutPage() {
  const searchParams = useSearchParams();
  const eventId = searchParams.get("event");
  const ticketsParam = searchParams.get("tickets");

  const { event, loading, error } = useEvent(eventId!);

  if (loading) return <LoadingScreen />;
  if (error || !event) return <ErrorScreen />;

  // ticketsParam を解析して選択されたチケットを取得
  const selectedTickets = parseTicketsParam(ticketsParam, event.ticket_types);

  return (
    <div>
      <h1>{event.title} - チェックアウト</h1>
      {selectedTickets.map(ticket => (
        <div key={ticket.id}>
          {ticket.name} x {ticket.quantity}
        </div>
      ))}
      {/* 決済フォーム */}
    </div>
  );
}
```

#### 必要な作業
- [ ] `useEvent()` でイベント・チケット情報取得
- [ ] URLパラメータ解析ロジック実装
- [ ] 在庫再確認機能実装

---

### 4.5 マイチケットページ (`src/app/my-tickets/page.tsx`)

#### 現状
```typescript
const tickets = {
  all: [
    { id: 1, eventTitle: "東京国際展示会2024", ... }, // ハードコーディング
  ],
};
```

#### 実装後

**⚠️ 前提条件**: `ticketAPI.getUserTickets()` の実装が必要

```typescript
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { ticketAPI } from "@/lib/database";
import type { TicketWithDetails } from "@/lib/supabase/types";

export default function MyTicketsPage() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<TicketWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    async function fetchTickets() {
      if (!user) return;

      try {
        setLoading(true);
        const data = await ticketAPI.getUserTickets(user.id);
        setTickets(data);
      } catch (err) {
        setError("チケットの取得に失敗しました");
      } finally {
        setLoading(false);
      }
    }

    fetchTickets();
  }, [user]);

  const filteredTickets = tickets.filter(ticket =>
    filterStatus === "all" || ticket.status === filterStatus
  );

  if (loading) return <LoadingScreen />;
  if (error) return <ErrorScreen message={error} />;

  return (
    <div>
      {filteredTickets.map((ticket) => (
        <div key={ticket.id}>
          <h3>{ticket.event.title}</h3>
          <p>{ticket.ticket_type.name}</p>
          <QRCodeDisplay qrCode={ticket.qr_code} />
        </div>
      ))}
    </div>
  );
}
```

#### 必要な作業
- [ ] **`ticketAPI.getUserTickets()` を実装** (最優先)
- [ ] 認証チェック実装
- [ ] ローディング・エラーUI実装
- [ ] QRコード表示統合

---

### 4.6 管理画面イベント編集 (`src/app/admin/events/[id]/EventEdit.tsx`)

#### 現状
```typescript
const dummyEvents = {
  "1": { title: "東京国際展示会2024", ... }, // ハードコーディング
};
```

#### 実装後
```typescript
"use client";

import { useEvent } from "@/hooks/useEvents";

interface EventEditProps {
  eventId: string;
}

export default function EventEdit({ eventId }: EventEditProps) {
  const { event, loading, error, refetch } = useEvent(eventId);
  const [formData, setFormData] = useState({...event});

  useEffect(() => {
    if (event) {
      setFormData(event);
    }
  }, [event]);

  const handleSubmit = async () => {
    await eventAPI.updateEvent(eventId, formData);
    await refetch(); // 再取得
  };

  if (loading) return <LoadingScreen />;
  if (error || !event) return <ErrorScreen />;

  return (
    <form onSubmit={handleSubmit}>
      {/* 編集フォーム */}
    </form>
  );
}
```

#### 必要な作業
- [ ] `useEvent()` でDB取得
- [ ] フォーム初期化ロジック実装
- [ ] 保存時の `updateEvent()` 呼び出し

---

## 5. 追加実装が必要なAPI

### 5.1 ticketAPI (優先度: 高)

```typescript
// src/lib/database.ts に追加

export const ticketAPI = {
  // ユーザーのチケット一覧取得
  async getUserTickets(userId: string): Promise<TicketWithDetails[]> {
    try {
      const { data, error } = await supabase
        .from('tickets')
        .select(`
          *,
          ticket_types (*),
          events (*),
          order_items (*)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw new DatabaseError('チケット取得に失敗しました', error);
      return data || [];
    } catch (error) {
      throw new DatabaseError('チケット取得に失敗しました', error as Error);
    }
  },

  // QRコードからチケット検索
  async getTicketByQR(qrCode: string): Promise<TicketWithDetails | null> {
    try {
      const { data, error } = await supabase
        .from('tickets')
        .select(`
          *,
          ticket_types (*),
          events (*),
          order_items (*)
        `)
        .eq('qr_code', qrCode)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        throw new DatabaseError('チケット取得に失敗しました', error);
      }
      return data;
    } catch (error) {
      throw new DatabaseError('チケット取得に失敗しました', error as Error);
    }
  },

  // チケット使用済みマーク
  async useTicket(id: string): Promise<Ticket> {
    try {
      const { data, error } = await supabase
        .from('tickets')
        .update({
          status: 'used',
          used_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw new DatabaseError('チケット使用処理に失敗しました', error);
      return data;
    } catch (error) {
      throw new DatabaseError('チケット使用処理に失敗しました', error as Error);
    }
  },
};
```

---

## 6. UI共通コンポーネント

### 6.1 ローディング画面

```typescript
// src/components/shared/LoadingScreen.tsx

export function LoadingScreen() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">読み込み中...</p>
      </div>
    </div>
  );
}
```

### 6.2 エラー画面

```typescript
// src/components/shared/ErrorScreen.tsx

interface ErrorScreenProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorScreen({ message = "エラーが発生しました", onRetry }: ErrorScreenProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <i className="ri-error-warning-line text-2xl text-red-600"></i>
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">{message}</h3>
        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
          >
            再読み込み
          </button>
        )}
      </div>
    </div>
  );
}
```

---

## 7. 実装優先順位

### 🔴 最優先 (即座に実装)
1. **ticketAPI.getUserTickets()** - マイチケットページで必須
2. **ホームページDB連携** - ユーザー体験の入口
3. **イベント一覧DB連携** - 主要機能

### 🟡 高優先度
4. **イベント詳細DB連携** - チケット購入フロー
5. **チェックアウトDB連携** - 決済フロー
6. **LoadingScreen/ErrorScreen共通化** - UX向上

### 🟢 中優先度
7. **管理画面イベント編集DB連携** - 管理機能

---

## 8. テスト項目

### 8.1 機能テスト
- [ ] 公開イベントのみ表示されることを確認
- [ ] イベント検索・フィルタリングが正常動作
- [ ] チケット在庫が正確に表示
- [ ] ローディング状態が適切に表示
- [ ] エラー時の再読み込みが動作

### 8.2 パフォーマンステスト
- [ ] 初回ロード時間が3秒以内
- [ ] フィルタリング操作が即座に反映

### 8.3 セキュリティテスト
- [ ] 未公開イベントが一般ユーザーに表示されない
- [ ] 他ユーザーのチケットが表示されない

---

## 9. 参考ファイル

### データベース関連
- `src/lib/database.ts` - データベースAPI
- `src/lib/supabase/types.ts` - TypeScript型定義

### フック
- `src/hooks/useEvents.ts` - イベント関連フック
- `src/hooks/useOrders.ts` - 注文関連フック
- `src/hooks/useCustomers.ts` - 顧客関連フック

### 実装対象ファイル
- `src/app/page.tsx`
- `src/app/events/page.tsx`
- `src/app/events/[id]/EventDetail.tsx`
- `src/app/admin/events/[id]/EventEdit.tsx`
- `src/app/checkout/page.tsx`
- `src/app/my-tickets/page.tsx`