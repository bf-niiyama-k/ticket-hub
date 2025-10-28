# 決済システム実装ドキュメント

## 実装完了日
2025年9月11日

## 概要
Stripe（クレジットカード・コンビニ決済）とPayPay公式APIを統合した決済システムを実装しました。既存のUIを活用し、実際の決済処理機能を追加しました。

## 実装した決済方式

### 1. Stripe統合
- **クレジットカード決済**: Stripe Elements使用
- **コンビニ決済**: Stripe Konbini機能使用
- **特徴**: PCI DSS準拠、セキュアな決済処理

### 2. PayPay統合
- **QRコード決済**: PayPay公式SDK使用
- **リダイレクト決済**: PayPayアプリまたはWebへの遷移
- **ポーリング**: 決済ステータスの定期確認

## アーキテクチャ

### ディレクトリ構造
```
src/
├── types/payment.ts              # 決済関連型定義
├── lib/
│   ├── stripe.ts                 # Stripe設定・ユーティリティ
│   └── paypay.ts                 # PayPay設定・API統合
├── hooks/
│   └── usePayment.ts             # 決済処理フック
├── app/
│   ├── api/payments/
│   │   ├── create-payment-intent/route.ts  # 決済作成API
│   │   └── confirm-payment/route.ts        # 決済確認API
│   └── checkout/page.tsx         # チェックアウトページ（更新）
```

### 決済フロー

#### 1. 決済Intent作成
```typescript
// フロントエンド
const result = await createPaymentIntent({
  amount: totalAmount,
  paymentMethod: "credit" | "paypay" | "convenience",
  orderItems,
  customerInfo: formData,
  eventId
});
```

#### 2. 決済方式別処理
- **クレジットカード**: Stripe Elements → 即座に決済確認
- **PayPay**: QRコード生成 → リダイレクト → ポーリング確認
- **コンビニ**: Stripe Konbini → 支払い番号発行 → 後日確認

#### 3. 決済完了処理
```typescript
// 決済成功時
router.push(`/purchase-complete?payment_intent=${paymentIntentId}&order_id=${orderId}&payment_method=${method}`);
```

## 主要コンポーネント

### 1. 型定義 (`src/types/payment.ts`)
```typescript
export type PaymentMethod = "credit" | "paypay" | "convenience";

export interface PaymentFormData {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  // クレジットカード情報
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  cardName: string;
}

export interface PaymentResult {
  success: boolean;
  paymentIntentId?: string;
  orderId?: string;
  error?: PaymentError;
  redirectUrl?: string;
}
```

### 2. Stripe設定 (`src/lib/stripe.ts`)
- **サーバーサイド**: Stripe SDK（Payment Intent作成・確認）
- **クライアントサイド**: @stripe/stripe-js（Elements UI）
- **コンビニ決済**: Konbini支払い方法設定
- **エラーハンドリング**: 日本語エラーメッセージ

### 3. PayPay設定 (`src/lib/paypay.ts`)
- **QRコード決済**: PayPay Official SDK使用
- **ポーリング**: 4秒間隔で決済ステータス確認
- **キャンセル機能**: 決済キャンセル処理
- **エラーハンドリング**: PayPay APIエラーの日本語化

### 4. 決済フック (`src/hooks/usePayment.ts`)
```typescript
export const usePayment = (): UsePaymentReturn => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<PaymentError | null>(null);
  const [paymentIntent, setPaymentIntent] = useState<PaymentIntent | null>(null);

  return {
    isProcessing,
    error,
    paymentIntent,
    createPaymentIntent,
    confirmPayment,
    cancelPayment,
    clearError,
  };
};
```

## API設計

### 1. 決済Intent作成 (`/api/payments/create-payment-intent`)
- **メソッド**: POST
- **入力**: 金額、決済方法、注文項目、顧客情報
- **出力**: PaymentIntent ID、クライアントシークレット、リダイレクトURL

### 2. 決済確認 (`/api/payments/confirm-payment`)
- **メソッド**: POST
- **入力**: PaymentIntent ID、決済方法、注文ID
- **出力**: 決済ステータス、完了フラグ

## 環境変数設定

### 必須環境変数
```bash
# Stripe設定
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# PayPay設定
PAYPAY_API_KEY=your_api_key
PAYPAY_API_SECRET=your_api_secret
PAYPAY_MERCHANT_ID=your_merchant_id

# アプリケーションURL
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

## セキュリティ対策

### 1. PCI DSS準拠
- Stripeによるカード情報の非保存
- クライアントサイドでのカード情報暗号化
- サーバーサイドでのカード情報非接触

### 2. APIセキュリティ
- 環境変数による秘密鍵管理
- リクエストバリデーション
- エラーハンドリングによる情報漏洩防止

### 3. データベース統合
- Supabaseでの決済ステータス管理
- 注文情報とのリレーション
- Row Level Security（RLS）による個人情報保護

## エラーハンドリング

### 1. Stripeエラー
```typescript
export const handleStripeError = (error: any): { code: string; message: string } => {
  if (error.type === "StripeCardError") {
    return {
      code: error.code || "card_error",
      message: "カードが拒否されました。別のカードをお試しください。",
    };
  }
  // その他のエラータイプ...
};
```

### 2. PayPayエラー
- APIエラーコードの日本語化
- ネットワークエラーの適切な処理
- タイムアウト処理（決済ポーリング）

### 3. UIエラー表示
- エラーメッセージのモーダル表示
- エラークリア機能
- ユーザーフレンドリーなメッセージ

## パフォーマンス最適化

### 1. 非同期処理
- PaymentIntent作成の非同期化
- PayPayポーリングのバックグラウンド処理
- エラー状態の適切な管理

### 2. キャッシュ戦略
- Stripe設定のシングルトン化
- PayPay設定の初期化最適化

## テスト戦略

### 1. テスト環境
- Stripeテストキー使用
- PayPayサンドボックス環境
- ダミーデータでの決済フロー確認

### 2. 確認項目
- [ ] クレジットカード決済フロー
- [ ] PayPay決済フロー
- [ ] コンビニ決済フロー
- [ ] エラーハンドリング
- [ ] 決済キャンセル
- [ ] データベース連携

## 既知の課題・制限事項

### 1. TypeScriptエラー
- PayPay SDKの型定義が不完全
- 一部のAPIレスポンス型の手動ハンドリング必要

### 2. 機能制限
- PayPay決済のリアルタイム通知未実装
- Webhook処理未実装（今後対応予定）
- ✅ 返金処理実装済み（2025年10月28日完了）

## 今後の拡張予定

### 1. Webhook統合
- Stripeウェブフック処理
- PayPay決済完了通知
- 自動的な注文ステータス更新

### 2. 管理機能
- 決済履歴管理
- ✅ 返金処理機能（2025年10月28日実装完了）
- 売上分析・レポート

### 3. UX改善
- 決済進捗の可視化
- PayPayアプリ連携の最適化
- エラー時のリトライ機能

## 参考資料
- [Stripe Documentation](https://stripe.com/docs)
- [PayPay for Developers](https://developer.paypay.ne.jp/)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript)

## 返金処理の実装（2025年10月28日追加）

### 返金API実装
**ファイル**: `src/app/api/payments/refund/route.ts`

#### 機能
- Stripe Refund API統合（クレジットカード決済の返金）
- PayPayは将来対応予定（現在はステータス更新のみ）
- 注文ステータス更新（`paid` → `refunded`）
- チケットステータス更新（`valid` → `cancelled`）
- チケット在庫復元（`quantity_sold`を減算）
- 詳細なエラーハンドリング

#### 返金処理フロー
```typescript
1. 注文情報取得（order_items、チケット情報含む）
2. 支払済み（paid）状態の確認
3. Stripe返金処理（クレジット決済の場合）
4. 注文ステータス更新（refunded）
5. チケットキャンセル（cancelled）
6. チケット在庫復元
```

#### 使用方法
```typescript
// フロントエンド（管理画面）
const response = await fetch('/api/payments/refund', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ orderId }),
});
```

### セキュリティ
- 管理画面からのみアクセス可能
- 支払済み注文のみ返金可能
- 返金後はロールバック不可（確認ダイアログ必須）

## 関連タスク
- ✅ task-payment-system.md（完了）
- ✅ task-admin-order-management.md（完了 - 返金処理含む）
- ✅ task-qr-ticket-system.md（QRコード・チケットシステム - 完了）
- 将来: Webhook処理の実装