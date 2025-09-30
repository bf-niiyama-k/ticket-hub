# Task: 管理画面注文管理実装

**優先度**: 🟡 高 (運用に必要)

## 目的

管理画面で注文一覧を表示し、注文詳細の確認・返金処理ができる機能を実装する。

## 参照ドキュメント

- `.claude/spec/spec-remaining-features.md`
- `src/hooks/useOrders.ts`
- `src/lib/database.ts`

## 実装計画

### Phase 1: 注文一覧ページの実装

#### 1-1. 基本実装
**ファイル**: `src/app/admin/orders/page.tsx`

- [ ] AdminLayoutの使用
- [ ] `useOrders()` でDB取得
- [ ] ローディング・エラー状態実装
- [ ] 注文一覧テーブル表示

**実装例**:
```typescript
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AdminLayout } from '@/components';
import { useOrders } from '@/hooks';
import type { OrderWithItems } from '@/types/database';

export default function OrderManagement() {
  const { orders, loading, error } = useOrders();
  const [selectedOrder, setSelectedOrder] = useState<OrderWithItems | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  if (loading) {
    return (
      <AdminLayout title="注文管理">
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout title="注文管理">
        <div className="text-center py-12">
          <p className="text-red-600">{error}</p>
        </div>
      </AdminLayout>
    );
  }

  // ... UI実装
}
```

#### 1-2. 統計カードの実装
- [ ] 総注文数
- [ ] 総売上
- [ ] 今日の注文数
- [ ] 今日の売上

**実装例**:
```typescript
const stats = useMemo(() => {
  const totalOrders = orders.length;
  const totalRevenue = orders
    .filter(order => order.status === 'paid')
    .reduce((sum, order) => sum + order.total_amount, 0);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayOrders = orders.filter(order => {
    const orderDate = new Date(order.created_at);
    orderDate.setHours(0, 0, 0, 0);
    return orderDate.getTime() === today.getTime();
  });

  const todayRevenue = todayOrders
    .filter(order => order.status === 'paid')
    .reduce((sum, order) => sum + order.total_amount, 0);

  return {
    totalOrders,
    totalRevenue,
    todayOrders: todayOrders.length,
    todayRevenue,
  };
}, [orders]);

// UI
<div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
  <StatsCard
    title="総注文数"
    value={stats.totalOrders}
    icon="ri-shopping-cart-line"
    iconColor="text-blue-600"
    iconBgColor="bg-blue-100"
  />
  <StatsCard
    title="総売上"
    value={`¥${stats.totalRevenue.toLocaleString()}`}
    icon="ri-money-yen-circle-line"
    iconColor="text-green-600"
    iconBgColor="bg-green-100"
  />
  <StatsCard
    title="今日の注文"
    value={stats.todayOrders}
    icon="ri-today-line"
    iconColor="text-purple-600"
    iconBgColor="bg-purple-100"
  />
  <StatsCard
    title="今日の売上"
    value={`¥${stats.todayRevenue.toLocaleString()}`}
    icon="ri-funds-line"
    iconColor="text-orange-600"
    iconBgColor="bg-orange-100"
  />
</div>
```

#### 1-3. 注文テーブルの実装
- [ ] 注文ID
- [ ] 顧客情報
- [ ] イベント名
- [ ] 注文日時
- [ ] 金額
- [ ] ステータス
- [ ] 決済方法
- [ ] 操作ボタン（詳細・返金）

**実装例**:
```typescript
<table className="w-full">
  <thead className="bg-gray-50">
    <tr>
      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
        注文ID
      </th>
      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
        顧客
      </th>
      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
        注文日時
      </th>
      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
        金額
      </th>
      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
        ステータス
      </th>
      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
        決済方法
      </th>
      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
        操作
      </th>
    </tr>
  </thead>
  <tbody className="bg-white divide-y divide-gray-200">
    {filteredOrders.map((order) => (
      <tr key={order.id} className="hover:bg-gray-50">
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="text-sm font-mono text-gray-900">
            #{order.id.slice(-8)}
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="text-sm text-gray-900">
            {order.guest_info?.name || 'ゲスト'}
          </div>
          <div className="text-sm text-gray-500">
            {order.guest_info?.email || '-'}
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="text-sm text-gray-900">
            {new Date(order.created_at).toLocaleDateString('ja-JP')}
          </div>
          <div className="text-sm text-gray-500">
            {new Date(order.created_at).toLocaleTimeString('ja-JP')}
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="text-sm font-semibold text-gray-900">
            ¥{order.total_amount.toLocaleString()}
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
            order.status === 'paid' ? 'bg-green-100 text-green-800' :
            order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
            order.status === 'cancelled' ? 'bg-gray-100 text-gray-800' :
            'bg-red-100 text-red-800'
          }`}>
            {order.status === 'paid' ? '支払済み' :
             order.status === 'pending' ? '保留中' :
             order.status === 'cancelled' ? 'キャンセル' :
             '返金済み'}
          </span>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="text-sm text-gray-900">
            {order.payment_method === 'credit_card' ? 'クレジットカード' :
             order.payment_method === 'paypal' ? 'PayPay' :
             order.payment_method === 'convenience_store' ? 'コンビニ決済' :
             '-'}
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
          <button
            onClick={() => showOrderDetail(order)}
            className="text-blue-600 hover:text-blue-900"
          >
            詳細
          </button>
          {order.status === 'paid' && (
            <button
              onClick={() => handleRefund(order.id)}
              className="text-red-600 hover:text-red-900"
            >
              返金
            </button>
          )}
        </td>
      </tr>
    ))}
  </tbody>
</table>
```

---

### Phase 2: フィルタリング・検索機能

#### 2-1. ステータス別フィルタリング
- [ ] すべて
- [ ] 支払済み
- [ ] 保留中
- [ ] キャンセル
- [ ] 返金済み

**実装例**:
```typescript
const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'pending' | 'cancelled' | 'refunded'>('all');

const filteredOrders = useMemo(() => {
  let filtered = orders;

  // ステータスフィルター
  if (statusFilter !== 'all') {
    filtered = filtered.filter(order => order.status === statusFilter);
  }

  // 検索フィルター
  if (searchTerm) {
    filtered = filtered.filter(order =>
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.guest_info?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.guest_info?.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  return filtered;
}, [orders, statusFilter, searchTerm]);
```

#### 2-2. 検索機能
- [ ] 注文ID検索
- [ ] 顧客名検索
- [ ] メールアドレス検索

---

### Phase 3: 注文詳細モーダル

#### 3-1. 注文詳細の表示
- [ ] 注文情報（ID、日時、金額、ステータス）
- [ ] 顧客情報（名前、メール、電話番号）
- [ ] 注文明細（チケット種類、数量、単価、小計）
- [ ] 決済情報（決済方法、決済ID）

**実装例**:
```typescript
{showDetailModal && selectedOrder && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white rounded-lg p-6 w-full max-w-3xl mx-4 max-h-screen overflow-y-auto">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold text-gray-900">
          注文詳細 #{selectedOrder.id.slice(-8)}
        </h3>
        <button
          onClick={() => setShowDetailModal(false)}
          className="p-1 hover:bg-gray-100 rounded"
        >
          <i className="ri-close-line text-2xl"></i>
        </button>
      </div>

      {/* 注文情報 */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <h4 className="font-semibold text-gray-900 mb-3">注文情報</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">注文ID</p>
            <p className="font-mono text-gray-900">#{selectedOrder.id.slice(-8)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">注文日時</p>
            <p className="text-gray-900">
              {new Date(selectedOrder.created_at).toLocaleString('ja-JP')}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">ステータス</p>
            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
              selectedOrder.status === 'paid' ? 'bg-green-100 text-green-800' :
              selectedOrder.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              {selectedOrder.status === 'paid' ? '支払済み' :
               selectedOrder.status === 'pending' ? '保留中' :
               '返金済み'}
            </span>
          </div>
          <div>
            <p className="text-sm text-gray-600">合計金額</p>
            <p className="text-lg font-semibold text-gray-900">
              ¥{selectedOrder.total_amount.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* 顧客情報 */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <h4 className="font-semibold text-gray-900 mb-3">顧客情報</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">氏名</p>
            <p className="text-gray-900">{selectedOrder.guest_info?.name || '-'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">メールアドレス</p>
            <p className="text-gray-900">{selectedOrder.guest_info?.email || '-'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">電話番号</p>
            <p className="text-gray-900">{selectedOrder.guest_info?.phone || '-'}</p>
          </div>
        </div>
      </div>

      {/* 注文明細 */}
      <div className="mb-6">
        <h4 className="font-semibold text-gray-900 mb-3">注文明細</h4>
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                チケット種類
              </th>
              <th className="px-4 py-2 text-right text-sm font-medium text-gray-700">
                単価
              </th>
              <th className="px-4 py-2 text-right text-sm font-medium text-gray-700">
                数量
              </th>
              <th className="px-4 py-2 text-right text-sm font-medium text-gray-700">
                小計
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {selectedOrder.order_items?.map((item) => (
              <tr key={item.id}>
                <td className="px-4 py-3 text-sm text-gray-900">
                  {item.ticket_type.name}
                </td>
                <td className="px-4 py-3 text-sm text-right text-gray-900">
                  ¥{item.unit_price.toLocaleString()}
                </td>
                <td className="px-4 py-3 text-sm text-right text-gray-900">
                  {item.quantity}
                </td>
                <td className="px-4 py-3 text-sm text-right font-semibold text-gray-900">
                  ¥{item.total_price.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-gray-50">
            <tr>
              <td colSpan={3} className="px-4 py-3 text-right font-semibold text-gray-900">
                合計
              </td>
              <td className="px-4 py-3 text-right text-lg font-bold text-gray-900">
                ¥{selectedOrder.total_amount.toLocaleString()}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* 決済情報 */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-semibold text-gray-900 mb-3">決済情報</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">決済方法</p>
            <p className="text-gray-900">
              {selectedOrder.payment_method === 'credit_card' ? 'クレジットカード' :
               selectedOrder.payment_method === 'paypal' ? 'PayPay' :
               'コンビニ決済'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">決済ID</p>
            <p className="font-mono text-sm text-gray-900">
              {selectedOrder.payment_id || '-'}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
)}
```

---

### Phase 4: 返金処理

#### 4-1. 返金機能の実装
- [ ] 返金確認ダイアログ
- [ ] Stripe Refund API呼び出し
- [ ] 注文ステータス更新
- [ ] チケットステータス更新（cancelled）
- [ ] チケット在庫復元

**新規ファイル**: `src/app/api/payments/refund/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabase } from '@/lib/supabase/client';
import { orderAPI } from '@/lib/database';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
});

export async function POST(request: NextRequest) {
  try {
    const { orderId } = await request.json();

    // 注文情報取得
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      return NextResponse.json(
        { error: '注文が見つかりません' },
        { status: 404 }
      );
    }

    if (order.status !== 'paid') {
      return NextResponse.json(
        { error: '返金できない注文です' },
        { status: 400 }
      );
    }

    // Stripe返金処理
    if (order.payment_id) {
      await stripe.refunds.create({
        payment_intent: order.payment_id,
      });
    }

    // 注文ステータス更新
    await orderAPI.updateOrder(orderId, {
      status: 'refunded',
    });

    // チケットキャンセル
    const { data: tickets } = await supabase
      .from('tickets')
      .select('id, ticket_type_id')
      .in('order_item_id', order.order_items.map((item: any) => item.id));

    if (tickets) {
      await supabase
        .from('tickets')
        .update({ status: 'cancelled' })
        .in('id', tickets.map(t => t.id));
    }

    // チケット在庫復元
    for (const item of order.order_items) {
      const { data: ticketType } = await supabase
        .from('ticket_types')
        .select('quantity_sold')
        .eq('id', item.ticket_type_id)
        .single();

      if (ticketType) {
        await supabase
          .from('ticket_types')
          .update({
            quantity_sold: Math.max(0, ticketType.quantity_sold - item.quantity),
          })
          .eq('id', item.ticket_type_id);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('返金処理エラー:', error);
    return NextResponse.json(
      { error: '返金処理に失敗しました' },
      { status: 500 }
    );
  }
}
```

**フロントエンド実装**:
```typescript
const handleRefund = async (orderId: string) => {
  if (!confirm('この注文を返金してもよろしいですか？\nチケットはキャンセルされ、在庫が復元されます。')) {
    return;
  }

  try {
    const response = await fetch('/api/payments/refund', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId }),
    });

    if (!response.ok) {
      throw new Error('返金処理に失敗しました');
    }

    alert('返金処理が完了しました');
    // 注文リストを再取得
    window.location.reload();
  } catch (error) {
    console.error('返金エラー:', error);
    alert('返金処理に失敗しました');
  }
};
```

---

### Phase 5: 検証

- [ ] 注文一覧が正しく表示される
- [ ] 統計カードが正しく計算される
- [ ] フィルタリングが正常に動作する
- [ ] 検索機能が正常に動作する
- [ ] 注文詳細モーダルが正しく表示される
- [ ] 返金処理が正常に動作する
- [ ] チケットがキャンセルされる
- [ ] 在庫が復元される
- [ ] TypeScript型エラー解消
- [ ] ESLint警告解消
- [ ] ビルドエラー解消

---

## 技術的な注意点

### 返金処理
- Stripe Refund APIは即座に返金を実行
- 返金後はロールバック不可
- 確認ダイアログを必ず表示

### トランザクション処理
- 注文ステータス更新、チケットキャンセル、在庫復元は一連の処理

### パフォーマンス
- 大量の注文がある場合はページネーション検討
- 統計計算はuseMemoでメモ化

---

## 進捗メモ
<!-- 作業進捗を随時更新 -->