import Stripe from "stripe";

// サーバーサイド用のStripe設定
// 注意: このファイルはサーバーサイドでのみ使用してください
// クライアントサイドでは stripe-client.ts を使用してください
export const stripe = new Stripe(process.env['STRIPE_SECRET_KEY']!, {
  apiVersion: "2025-08-27.basil",
  typescript: true,
});

// Stripe用のユーティリティ関数
export const formatAmountForStripe = (amount: number, currency: string = "jpy"): number => {
  // 日本円は最小単位が1円なので変換不要
  if (currency.toLowerCase() === "jpy") {
    return Math.round(amount);
  }
  // その他の通貨は100倍（セント単位）
  return Math.round(amount * 100);
};

export const formatAmountFromStripe = (amount: number, currency: string = "jpy"): number => {
  // 日本円は最小単位が1円なので変換不要
  if (currency.toLowerCase() === "jpy") {
    return amount;
  }
  // その他の通貨は100で割る
  return amount / 100;
};

// PaymentIntentを作成
export const createPaymentIntent = async (params: {
  amount: number;
  currency?: string;
  paymentMethod?: string;
  customerEmail?: string;
  metadata?: Record<string, string>;
}): Promise<Stripe.PaymentIntent> => {
  const {
    amount,
    currency = "jpy",
    paymentMethod,
    customerEmail,
    metadata = {},
  } = params;

  const paymentIntentParams: Stripe.PaymentIntentCreateParams = {
    amount: formatAmountForStripe(amount, currency),
    currency,
    automatic_payment_methods: {
      enabled: true,
    },
    metadata: {
      ...metadata,
      customerEmail: customerEmail || "",
    },
  };

  // 特定の決済方法が指定された場合
  if (paymentMethod) {
    if (paymentMethod === "convenience") {
      // コンビニ決済の場合
      paymentIntentParams.payment_method_types = ["konbini"];
      paymentIntentParams.payment_method_options = {
        konbini: {
          product_description: metadata['eventTitle'] || "チケット購入",
          expires_after_days: 3, // 3日間有効
        },
      };
    } else if (paymentMethod === "credit") {
      // クレジットカード決済の場合
      paymentIntentParams.payment_method_types = ["card"];
    }
  }

  return await stripe.paymentIntents.create(paymentIntentParams);
};

// PaymentIntentを確認
export const confirmPaymentIntent = async (
  paymentIntentId: string,
  paymentMethodId?: string
): Promise<Stripe.PaymentIntent> => {
  const params: Stripe.PaymentIntentConfirmParams = {};
  
  if (paymentMethodId) {
    params.payment_method = paymentMethodId;
  }

  return await stripe.paymentIntents.confirm(paymentIntentId, params);
};

// PaymentIntentを取得
export const retrievePaymentIntent = async (
  paymentIntentId: string
): Promise<Stripe.PaymentIntent> => {
  return await stripe.paymentIntents.retrieve(paymentIntentId);
};

// Customerを作成または取得
export const createOrRetrieveCustomer = async (params: {
  email: string;
  name?: string;
  phone?: string;
}): Promise<Stripe.Customer> => {
  const { email, name, phone } = params;

  // 既存顧客を検索
  const existingCustomers = await stripe.customers.list({
    email,
    limit: 1,
  });

  if (existingCustomers.data.length > 0 && existingCustomers.data[0]) {
    return existingCustomers.data[0];
  }

  // 新規顧客を作成
  const customerData: Stripe.CustomerCreateParams = {
    email,
  };
  if (name !== undefined) {
    customerData.name = name;
  }
  if (phone !== undefined) {
    customerData.phone = phone;
  }
  return await stripe.customers.create(customerData);
};

// Webhookの署名を検証
export const validateWebhookSignature = (
  payload: string | Buffer,
  signature: string,
  secret: string
): Stripe.Event => {
  return stripe.webhooks.constructEvent(payload, signature, secret);
};

// エラーハンドリング用のユーティリティ
export const handleStripeError = (error: unknown): { code: string; message: string } => {
  // Stripeエラーの型ガード
  const isStripeError = (err: unknown): err is { type: string; code?: string; message?: string } => {
    return err !== null && typeof err === 'object' && 'type' in err;
  };

  if (isStripeError(error) && error.type === "StripeCardError") {
    return {
      code: error.code || "card_error",
      message: "カードが拒否されました。別のカードをお試しください。",
    };
  } else if (isStripeError(error) && error.type === "StripeRateLimitError") {
    return {
      code: "rate_limit",
      message: "リクエストが多すぎます。しばらく時間をおいてからお試しください。",
    };
  } else if (isStripeError(error) && error.type === "StripeInvalidRequestError") {
    return {
      code: "invalid_request",
      message: "無効なリクエストです。",
    };
  } else if (isStripeError(error) && error.type === "StripeAPIError") {
    return {
      code: "api_error",
      message: "決済処理中にエラーが発生しました。しばらく時間をおいてからお試しください。",
    };
  } else if (isStripeError(error) && error.type === "StripeConnectionError") {
    return {
      code: "connection_error",
      message: "ネットワークエラーが発生しました。インターネット接続を確認してください。",
    };
  } else if (isStripeError(error) && error.type === "StripeAuthenticationError") {
    return {
      code: "authentication_error",
      message: "認証エラーが発生しました。",
    };
  } else {
    return {
      code: "unknown_error",
      message: "予期しないエラーが発生しました。",
    };
  }
};