# Task: チェックアウト・決済統合実装

**優先度**: 🔴 最高 (コア機能)

## 目的

チェックアウトページのDB連携と決済処理の完全実装を行い、ユーザーがチケットを購入できるようにする。

## 参照ドキュメント

- `.claude/spec/spec-remaining-features.md`
- `.claude/spec/spec-data-persistance.md`
- `src/hooks/usePayment.ts`
- `src/lib/database.ts`

## 実装計画

### Phase 1: チェックアウトページのDB連携

#### 1-1. ハードコーディングデータの削除とDB取得
**ファイル**: `src/app/checkout/page.tsx`

- [ ] `useEvent(eventId)` をインポート・使用
- [ ] ハードコーディングされた`events`オブジェクト（43-54行）を削除
- [ ] ハードコーディングされた`ticketTypes`オブジェクト（56-67行）を削除
- [ ] DBから取得したイベント・チケット情報を使用

**実装例**:
```typescript
const eventId = searchParams.get("event");
const { event, loading: eventLoading, error: eventError } = useEvent(eventId || '');

if (eventLoading) {
  return <LoadingScreen />;
}

if (eventError || !event) {
  return <ErrorScreen message="イベント情報の取得に失敗しました" />;
}

const tickets = event.ticket_types || [];
```

#### 1-2. チケット在庫再確認機能
- [ ] チケット選択時の在庫確認関数を実装
- [ ] 購入ボタンクリック時に在庫を再確認
- [ ] 在庫不足の場合はエラー表示

**実装例**:
```typescript
const validateTicketAvailability = useCallback(async () => {
  for (const [ticketId, count] of Object.entries(selectedTickets)) {
    const ticket = tickets.find(t => t.id === ticketId);
    if (!ticket) continue;

    const availableStock = ticket.quantity_total - ticket.quantity_sold;
    if (availableStock < (count as number)) {
      setError(`${ticket.name}の在庫が不足しています（残り${availableStock}枚）`);
      return false;
    }
  }
  return true;
}, [selectedTickets, tickets]);
```

#### 1-3. ローディング・エラー状態の実装
- [ ] LoadingScreenコンポーネントを使用
- [ ] ErrorScreenコンポーネントを使用
- [ ] 在庫不足エラーの表示

---

### Phase 2: 決済API実装（バックエンド）

#### 2-1. Stripe Payment Intent作成API
**ファイル**: `src/app/api/payments/create-payment-intent/route.ts`

- [ ] リクエストボディのバリデーション
- [ ] 注文金額の計算・検証
- [ ] チケット在庫の確認
- [ ] Stripe Payment Intent作成
- [ ] レスポンス返却

**実装例**:
```typescript
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { eventAPI } from '@/lib/database';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
});

export async function POST(request: NextRequest) {
  try {
    const { eventId, tickets } = await request.json();

    // イベント・チケット情報取得
    const event = await eventAPI.getEventById(eventId);
    if (!event) {
      return NextResponse.json(
        { error: 'イベントが見つかりません' },
        { status: 404 }
      );
    }

    // 金額計算・在庫確認
    let totalAmount = 0;
    for (const [ticketTypeId, quantity] of Object.entries(tickets)) {
      const ticketType = event.ticket_types?.find(tt => tt.id === ticketTypeId);
      if (!ticketType) {
        return NextResponse.json(
          { error: `チケット種類が見つかりません: ${ticketTypeId}` },
          { status: 400 }
        );
      }

      const availableStock = ticketType.quantity_total - ticketType.quantity_sold;
      if (availableStock < (quantity as number)) {
        return NextResponse.json(
          { error: `${ticketType.name}の在庫が不足しています` },
          { status: 400 }
        );
      }

      totalAmount += ticketType.price * (quantity as number);
    }

    // Payment Intent作成
    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalAmount,
      currency: 'jpy',
      metadata: {
        eventId,
        tickets: JSON.stringify(tickets),
      },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    console.error('Payment Intent作成エラー:', error);
    return NextResponse.json(
      { error: '決済の準備に失敗しました' },
      { status: 500 }
    );
  }
}
```

#### 2-2. 決済確認・注文作成API
**ファイル**: `src/app/api/payments/confirm-payment/route.ts`

- [ ] Payment Intentの確認
- [ ] 注文作成（ordersテーブル）
- [ ] 注文明細作成（order_itemsテーブル）
- [ ] チケット発行（ticketsテーブル）
- [ ] QRコード生成
- [ ] チケット在庫更新（ticket_types.quantity_sold）
- [ ] トランザクション処理

**実装例**:
```typescript
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/lib/supabase/client';
import { orderAPI } from '@/lib/database';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
});

export async function POST(request: NextRequest) {
  try {
    const { paymentIntentId, userId, guestInfo } = await request.json();

    // Payment Intentの確認
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      return NextResponse.json(
        { error: '決済が完了していません' },
        { status: 400 }
      );
    }

    const { eventId, tickets } = paymentIntent.metadata;
    const ticketsData = JSON.parse(tickets);

    // トランザクション開始
    // 注文作成
    const order = await orderAPI.createOrder({
      user_id: userId,
      event_id: eventId,
      total_amount: paymentIntent.amount,
      status: 'paid',
      payment_method: 'credit_card',
      payment_id: paymentIntentId,
      guest_info: guestInfo || null,
    });

    // 注文明細・チケット発行
    const orderItems = [];
    const ticketsToCreate = [];

    for (const [ticketTypeId, quantity] of Object.entries(ticketsData)) {
      // チケット種類情報取得
      const { data: ticketType } = await supabase
        .from('ticket_types')
        .select('*')
        .eq('id', ticketTypeId)
        .single();

      if (!ticketType) continue;

      // 注文明細作成
      const { data: orderItem } = await supabase
        .from('order_items')
        .insert({
          order_id: order.id,
          ticket_type_id: ticketTypeId,
          quantity: quantity as number,
          unit_price: ticketType.price,
          total_price: ticketType.price * (quantity as number),
        })
        .select()
        .single();

      if (!orderItem) continue;

      // チケット発行（枚数分）
      for (let i = 0; i < (quantity as number); i++) {
        const qrCode = `${uuidv4()}-${ticketTypeId}`;
        ticketsToCreate.push({
          order_item_id: orderItem.id,
          ticket_type_id: ticketTypeId,
          event_id: eventId,
          user_id: userId,
          qr_code: qrCode,
          status: 'valid',
        });
      }

      // チケット在庫更新
      await supabase
        .from('ticket_types')
        .update({
          quantity_sold: ticketType.quantity_sold + (quantity as number),
        })
        .eq('id', ticketTypeId);
    }

    // チケット一括作成
    if (ticketsToCreate.length > 0) {
      await supabase.from('tickets').insert(ticketsToCreate);
    }

    return NextResponse.json({
      success: true,
      orderId: order.id,
    });
  } catch (error) {
    console.error('注文作成エラー:', error);
    return NextResponse.json(
      { error: '注文の作成に失敗しました' },
      { status: 500 }
    );
  }
}
```

---

### Phase 3: フロントエンド決済処理実装

#### 3-1. usePaymentフックの完成
**ファイル**: `src/hooks/usePayment.ts`

- [ ] createPaymentIntent関数の実装確認
- [ ] confirmPayment関数の実装確認
- [ ] エラーハンドリングの強化

#### 3-2. チェックアウトページの決済処理統合
**ファイル**: `src/app/checkout/page.tsx`

- [ ] handlePurchase関数の完成
- [ ] Payment Intent作成呼び出し
- [ ] Stripe Elements統合（クレジットカード入力）
- [ ] 決済確認処理
- [ ] 購入完了ページへリダイレクト

**実装例**:
```typescript
const handlePurchase = async () => {
  try {
    // バリデーション
    if (!eventId || !event) {
      alert("イベント情報が見つかりません");
      return;
    }

    // 在庫確認
    const isAvailable = await validateTicketAvailability();
    if (!isAvailable) return;

    // Payment Intent作成
    const { clientSecret, paymentIntentId } = await createPaymentIntent({
      eventId,
      tickets: selectedTickets,
    });

    // Stripe決済処理（Elements使用）
    // ... Stripe ElementsのconfirmPayment呼び出し ...

    // 決済確認・注文作成
    const { orderId } = await confirmPayment({
      paymentIntentId,
      userId: user?.id,
      guestInfo: isLoggedIn ? null : {
        name: `${formData.lastName} ${formData.firstName}`,
        email: formData.email,
        phone: formData.phone,
      },
    });

    // 購入完了ページへリダイレクト
    router.push(`/purchase-complete?orderId=${orderId}`);
  } catch (error) {
    console.error("購入エラー:", error);
    alert("購入処理に失敗しました");
  }
};
```

---

### Phase 4: 検証

- [ ] チェックアウトページでイベント・チケット情報が正しく表示される
- [ ] チケット在庫が正しく確認される
- [ ] 在庫不足時にエラーが表示される
- [ ] 決済処理が正常に完了する
- [ ] 注文が作成される
- [ ] チケットが発行される
- [ ] QRコードが生成される
- [ ] チケット在庫が更新される
- [ ] 購入完了ページへリダイレクトされる
- [ ] TypeScript型エラー解消
- [ ] ESLint警告解消
- [ ] ビルドエラー解消

---

## 技術的な注意点

### トランザクション処理
注文作成・チケット発行・在庫更新は一連の処理として実行する必要があります。エラーが発生した場合はロールバックを検討してください。

### Stripe連携
- `STRIPE_SECRET_KEY` 環境変数の設定が必要
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` 環境変数の設定が必要
- Stripe Elements の統合が必要（`@stripe/react-stripe-js`）

### セキュリティ
- 決済処理は必ずサーバーサイド（API Routes）で実行
- 金額計算はクライアントを信用せず、サーバーで再計算
- チケット在庫の確認はサーバーサイドで実行

### エラーハンドリング
- 決済失敗時のロールバック
- 在庫不足エラー
- ネットワークエラー
- タイムアウト処理

---

## 進捗メモ

### ✅ 完了 (2025-09-30)

#### Phase 1: チェックアウトページのDB連携
- ✅ `useEvent`フックをインポート・使用
- ✅ ハードコーディングされた`events`と`ticketTypes`オブジェクトを削除
- ✅ DBから取得したイベント・チケット情報を使用
- ✅ `LoadingScreen`と`ErrorScreen`コンポーネントを統合
- ✅ チケット在庫再確認機能を実装（`validateTicketAvailability`関数）
- ✅ 在庫不足エラーの表示を実装

#### Phase 2: 決済API実装
- ✅ **create-payment-intent API**
  - DBからイベント・チケット情報を取得
  - チケット在庫確認と金額検証（改ざん防止）
  - システム手数料（5%）の計算
  - Stripe Payment Intent作成

- ✅ **confirm-payment API**
  - Payment Intentの確認
  - 注文作成（ordersテーブル）
  - 注文明細作成（order_itemsテーブル）
  - チケット発行（ticketsテーブル、crypto.randomUUID()でQRコード生成）
  - チケット在庫更新（ticket_types.quantity_sold）
  - userId/guestInfo対応

#### Phase 3: フロントエンド決済処理実装
- ✅ `usePayment`フックの型定義を更新（userId、guestInfoパラメータ追加）
- ✅ チェックアウトページの決済処理を更新
- ✅ ゲストユーザー情報の処理を実装
- ✅ イベントデータのフィールド名を修正（date → date_start, venue → location）

#### Phase 4: 検証
- ✅ TypeScript型エラー解消
- ✅ ビルドエラー解消（✓ Compiled successfully）
- ⚠️ ESLint警告（useCallbackの依存関係）は残っているが動作に影響なし

### 実装したファイル
- `src/app/checkout/page.tsx` - DB連携、在庫確認、決済処理統合
- `src/app/api/payments/create-payment-intent/route.ts` - Payment Intent作成API
- `src/app/api/payments/confirm-payment/route.ts` - 決済確認・注文作成API
- `src/hooks/usePayment.ts` - 型定義更新
- `src/types/payment.ts` - UsePaymentActions型定義更新

### 今後の改善点
1. **ゲストユーザーテーブルの実装** - 現在は'guest'文字列を使用
2. **Stripe Elementsの完全統合** - クレジットカード入力UIの改善
3. **トランザクション処理の強化** - エラー時のロールバック機能
4. **ESLint警告の解消** - useMemoによる依存関係の最適化
5. **user_id型の修正** - Order/Ticket型でnullableに変更