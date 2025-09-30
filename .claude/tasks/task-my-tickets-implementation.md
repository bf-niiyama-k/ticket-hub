# Task: マイチケットページ実装

**優先度**: 🔴 最高 (ユーザー体験のコア)

## 目的

ユーザーが購入したチケットを一覧表示し、QRコードを表示できるマイチケットページを実装する。

## 参照ドキュメント

- `.claude/spec/spec-remaining-features.md`
- `src/lib/database.ts` (ticketAPI)
- `src/hooks/useAuth.tsx`

## 実装計画

### Phase 1: 基本実装

#### 1-1. ハードコーディングデータの削除とDB取得
**ファイル**: `src/app/my-tickets/page.tsx`

- [ ] ハードコーディングされた`tickets`配列を削除
- [ ] `useAuth` で認証状態取得
- [ ] 未認証の場合はログインページへリダイレクト
- [ ] `ticketAPI.getUserTickets(userId)` でチケット取得
- [ ] ローディング・エラー状態実装

**実装例**:
```typescript
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { ticketAPI } from '@/lib/database';
import { LoadingScreen, ErrorScreen } from '@/components';
import type { TicketWithDetails } from '@/lib/supabase/types';

export default function MyTicketsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [tickets, setTickets] = useState<TicketWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.push('/login?redirect_to=/my-tickets');
      return;
    }

    const fetchTickets = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await ticketAPI.getUserTickets(user.id);
        setTickets(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'チケットの取得に失敗しました');
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, [user, authLoading, router]);

  if (authLoading || loading) {
    return <LoadingScreen />;
  }

  if (error) {
    return <ErrorScreen message={error} />;
  }

  // ... UI実装
}
```

#### 1-2. チケット一覧表示
- [ ] チケットカードコンポーネントの実装
- [ ] イベント情報の表示（タイトル、日時、会場）
- [ ] チケット種類の表示
- [ ] ステータス表示（有効/使用済み/キャンセル済み）
- [ ] QRコードの表示

**チケットカードUI例**:
```typescript
<div className="bg-white rounded-lg shadow-md overflow-hidden">
  <div className="relative h-48">
    <Image
      src={ticket.event.image_url || '/img/event.jpg'}
      alt={ticket.event.title}
      fill
      className="object-cover"
    />
    <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-semibold ${
      ticket.status === 'valid' ? 'bg-green-500 text-white' :
      ticket.status === 'used' ? 'bg-gray-500 text-white' :
      'bg-red-500 text-white'
    }`}>
      {ticket.status === 'valid' ? '有効' :
       ticket.status === 'used' ? '使用済み' :
       'キャンセル済み'}
    </div>
  </div>

  <div className="p-6">
    <h3 className="text-xl font-semibold text-gray-900 mb-2">
      {ticket.event.title}
    </h3>

    <div className="space-y-2 mb-4">
      <div className="flex items-center text-gray-600">
        <i className="ri-ticket-line mr-2"></i>
        <span>{ticket.ticket_type.name}</span>
      </div>
      <div className="flex items-center text-gray-600">
        <i className="ri-calendar-line mr-2"></i>
        <span>
          {new Date(ticket.event.date_start).toLocaleDateString('ja-JP', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </span>
      </div>
      <div className="flex items-center text-gray-600">
        <i className="ri-map-pin-line mr-2"></i>
        <span>{ticket.event.location}</span>
      </div>
    </div>

    {ticket.status === 'valid' && (
      <button
        onClick={() => showQRCode(ticket)}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium"
      >
        QRコードを表示
      </button>
    )}
  </div>
</div>
```

---

### Phase 2: フィルタリング機能

#### 2-1. ステータス別フィルタリング
- [ ] フィルタータブの実装（すべて/有効/使用済み/キャンセル済み）
- [ ] フィルター状態管理
- [ ] フィルター適用ロジック

**実装例**:
```typescript
const [statusFilter, setStatusFilter] = useState<'all' | 'valid' | 'used' | 'cancelled'>('all');

const filteredTickets = useMemo(() => {
  if (statusFilter === 'all') return tickets;
  return tickets.filter(ticket => ticket.status === statusFilter);
}, [tickets, statusFilter]);

// UI
<div className="flex space-x-2 mb-6">
  <button
    onClick={() => setStatusFilter('all')}
    className={`px-4 py-2 rounded-lg ${
      statusFilter === 'all'
        ? 'bg-blue-600 text-white'
        : 'bg-gray-200 text-gray-700'
    }`}
  >
    すべて ({tickets.length})
  </button>
  <button
    onClick={() => setStatusFilter('valid')}
    className={`px-4 py-2 rounded-lg ${
      statusFilter === 'valid'
        ? 'bg-green-600 text-white'
        : 'bg-gray-200 text-gray-700'
    }`}
  >
    有効 ({tickets.filter(t => t.status === 'valid').length})
  </button>
  <button
    onClick={() => setStatusFilter('used')}
    className={`px-4 py-2 rounded-lg ${
      statusFilter === 'used'
        ? 'bg-gray-600 text-white'
        : 'bg-gray-200 text-gray-700'
    }`}
  >
    使用済み ({tickets.filter(t => t.status === 'used').length})
  </button>
  <button
    onClick={() => setStatusFilter('cancelled')}
    className={`px-4 py-2 rounded-lg ${
      statusFilter === 'cancelled'
        ? 'bg-red-600 text-white'
        : 'bg-gray-200 text-gray-700'
    }`}
  >
    キャンセル済み ({tickets.filter(t => t.status === 'cancelled').length})
  </button>
</div>
```

---

### Phase 3: QRコード表示機能

#### 3-1. QRコードモーダルの実装
- [ ] QRコード生成ライブラリのインストール（`qrcode.react`）
- [ ] QRコード表示モーダルの実装
- [ ] チケット詳細情報の表示
- [ ] 注意事項の表示

**インストール**:
```bash
npm install qrcode.react
npm install --save-dev @types/qrcode.react
```

**実装例**:
```typescript
import { QRCodeSVG } from 'qrcode.react';

const [selectedTicket, setSelectedTicket] = useState<TicketWithDetails | null>(null);
const [showQRModal, setShowQRModal] = useState(false);

const showQRCode = (ticket: TicketWithDetails) => {
  setSelectedTicket(ticket);
  setShowQRModal(true);
};

// QRコードモーダル
{showQRModal && selectedTicket && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold text-gray-900">チケットQRコード</h3>
        <button
          onClick={() => setShowQRModal(false)}
          className="p-1 hover:bg-gray-100 rounded"
        >
          <i className="ri-close-line text-2xl"></i>
        </button>
      </div>

      {/* QRコード */}
      <div className="flex justify-center mb-6">
        <div className="p-4 bg-white border-4 border-gray-200 rounded-lg">
          <QRCodeSVG
            value={selectedTicket.qr_code}
            size={200}
            level="H"
            includeMargin={true}
          />
        </div>
      </div>

      {/* チケット情報 */}
      <div className="space-y-3 mb-6">
        <div>
          <p className="text-sm text-gray-600">イベント</p>
          <p className="font-medium text-gray-900">{selectedTicket.event.title}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">チケット種類</p>
          <p className="font-medium text-gray-900">{selectedTicket.ticket_type.name}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">日時</p>
          <p className="font-medium text-gray-900">
            {new Date(selectedTicket.event.date_start).toLocaleDateString('ja-JP', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-600">会場</p>
          <p className="font-medium text-gray-900">{selectedTicket.event.location}</p>
        </div>
      </div>

      {/* 注意事項 */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
          <i className="ri-error-warning-line text-yellow-600 mr-2"></i>
          ご注意
        </h4>
        <ul className="text-sm text-gray-700 space-y-1">
          <li>• 入場時にこのQRコードをスタッフに提示してください</li>
          <li>• QRコードのスクリーンショットは無効です</li>
          <li>• 一度使用したチケットは再利用できません</li>
          <li>• チケットの転売は禁止されています</li>
        </ul>
      </div>
    </div>
  </div>
)}
```

---

### Phase 4: 追加機能

#### 4-1. チケットの並び替え
- [ ] 開催日順（近い順/遠い順）
- [ ] 購入日順（新しい順/古い順）

#### 4-2. 空の状態の表示
- [ ] チケットがない場合のメッセージ
- [ ] イベント一覧へのリンク

**実装例**:
```typescript
{filteredTickets.length === 0 && (
  <div className="text-center py-12">
    <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
      <i className="ri-ticket-2-line text-4xl text-gray-400"></i>
    </div>
    <h3 className="text-xl font-semibold text-gray-900 mb-2">
      {statusFilter === 'all'
        ? 'まだチケットを購入していません'
        : `${statusFilter === 'valid' ? '有効な' : statusFilter === 'used' ? '使用済みの' : 'キャンセル済みの'}チケットはありません`
      }
    </h3>
    <p className="text-gray-600 mb-6">
      イベント一覧からお気に入りのイベントを見つけてチケットを購入しましょう
    </p>
    <Link
      href="/events"
      className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium"
    >
      イベントを探す
    </Link>
  </div>
)}
```

---

### Phase 5: 検証

- [ ] 認証チェックが正常に動作する
- [ ] チケット一覧が正しく表示される
- [ ] フィルタリングが正常に動作する
- [ ] QRコードが正しく表示される
- [ ] ローディング状態が表示される
- [ ] エラー状態が表示される
- [ ] 空の状態が表示される
- [ ] TypeScript型エラー解消
- [ ] ESLint警告解消
- [ ] ビルドエラー解消

---

## 技術的な注意点

### QRコード生成
- `qrcode.react` ライブラリを使用
- QRコードのサイズは200px程度が適切
- エラー訂正レベルは'H'（高）を推奨

### セキュリティ
- QRコードは一意の値（UUID + チケットID）
- QRコードの転売防止策を検討

### パフォーマンス
- チケット一覧は useMemo でメモ化
- 大量のチケットがある場合はページネーション検討

---

## 進捗メモ
<!-- 作業進捗を随時更新 -->