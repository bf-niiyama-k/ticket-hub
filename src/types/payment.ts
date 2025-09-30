// 決済関連の型定義

export type PaymentMethod = "credit" | "paypay" | "convenience";

export interface PaymentFormData {
  // 顧客情報
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

export interface OrderItem {
  ticketId: string;
  ticketName: string;
  price: number;
  quantity: number;
}

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: "jpy";
  status: "pending" | "processing" | "succeeded" | "failed" | "canceled";
  paymentMethod: PaymentMethod;
  orderId: string;
  eventId: string;
  customerId?: string;
  metadata?: Record<string, string>;
}

export interface StripePaymentResult {
  success: boolean;
  paymentIntentId?: string;
  error?: {
    code: string;
    message: string;
  };
}

export interface PayPayPaymentRequest {
  merchantPaymentId: string;
  amount: {
    amount: number;
    currency: "JPY";
  };
  codeType: "ORDER_QR";
  requestedAt: number;
  redirectUrl?: string;
  redirectType?: "WEB_LINK";
  userAgent?: string;
  storeInfo?: {
    storeId: string;
    storeName?: string;
  };
  orderDescription?: string;
  orderItems?: Array<{
    name: string;
    category: "ticket";
    quantity: number;
    productId?: string;
    unitPrice: {
      amount: number;
      currency: "JPY";
    };
  }>;
}

export interface PayPayPaymentResponse {
  resultInfo: {
    code: string;
    message: string;
    codeId: string;
  };
  data?: {
    paymentId: string;
    status: "CREATED" | "COMPLETED" | "FAILED" | "CANCELED";
    acceptedAt?: number;
    merchantPaymentId: string;
    amount: {
      amount: number;
      currency: "JPY";
    };
    links?: Array<{
      rel: string;
      href: string;
      method: "GET" | "POST";
    }>;
  };
}

export interface ConvenienceStorePayment {
  type: "convenience_store";
  convenience_store: {
    code: string; // コンビニコード
    store: "seven_eleven" | "lawson" | "family_mart" | "mini_stop" | "daily_yamazaki" | "seicomart";
  };
}

export interface PaymentError {
  type: "validation_error" | "payment_failed" | "network_error" | "unknown_error";
  message: string;
  code?: string;
  details?: Record<string, unknown>;
}

export interface PaymentResult {
  success: boolean;
  paymentIntentId?: string;
  orderId?: string;
  error?: PaymentError;
  redirectUrl?: string; // PayPay等のリダイレクトURL
}

// Hook用の型定義
export interface UsePaymentState {
  isProcessing: boolean;
  error: PaymentError | null;
  paymentIntent: PaymentIntent | null;
}

export interface UsePaymentActions {
  createPaymentIntent: (data: {
    amount: number;
    paymentMethod: PaymentMethod;
    orderItems: OrderItem[];
    customerInfo: Partial<PaymentFormData>;
    eventId: string;
  }) => Promise<PaymentResult>;
  confirmPayment: (
    paymentIntentId: string,
    options?: {
      userId?: string;
      guestInfo?: {
        name: string;
        email: string;
        phone: string;
      };
    }
  ) => Promise<PaymentResult>;
  cancelPayment: (paymentIntentId: string) => Promise<boolean>;
  clearError: () => void;
}

export type UsePaymentReturn = UsePaymentState & UsePaymentActions;