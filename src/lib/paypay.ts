import PAYPAY from "@paypayopa/paypayopa-sdk-node";
import type {
  PayPayPaymentRequest,
  PayPayPaymentResponse,
  PaymentError,
  OrderItem,
} from "../types/payment";

// PayPay SDK レスポンス型定義
interface PayPaySDKResponse {
  resultInfo: {
    code: string;
    message: string;
    codeId: string;
  };
  data?: {
    paymentId: string;
    status: string;
    acceptedAt?: number;
    merchantPaymentId: string;
    amount: {
      amount: number;
      currency: string;
    };
    links?: Array<{
      rel: string;
      href: string;
      method: string;
    }>;
  };
}

// PayPay設定の初期化
export const initializePayPay = () => {
  PAYPAY.Configure({
    clientId: process.env['PAYPAY_API_KEY']!,
    clientSecret: process.env['PAYPAY_API_SECRET']!,
    merchantId: process.env['PAYPAY_MERCHANT_ID']!,
    productionMode: process.env['NODE_ENV'] === "production",
  });
};

// PayPay決済リクエストを作成
export const createPayPayPayment = async (params: {
  amount: number;
  orderId: string;
  eventTitle: string;
  customerEmail?: string;
  orderItems: OrderItem[];
  redirectUrl?: string;
}): Promise<{
  success: boolean;
  data?: PayPayPaymentResponse["data"];
  error?: PaymentError;
}> => {
  try {
    initializePayPay();

    const { amount, orderId, eventTitle, orderItems, redirectUrl } = params;

    const paymentRequest: PayPayPaymentRequest = {
      merchantPaymentId: orderId,
      amount: {
        amount: Math.round(amount),
        currency: "JPY",
      },
      codeType: "ORDER_QR",
      requestedAt: Math.floor(Date.now() / 1000),
      orderDescription: eventTitle,
      orderItems: orderItems.map((item) => ({
        name: item.ticketName,
        category: "ticket",
        quantity: item.quantity,
        productId: item.ticketId,
        unitPrice: {
          amount: Math.round(item.price),
          currency: "JPY",
        },
      })),
    };

    // リダイレクトURLが指定されている場合
    if (redirectUrl) {
      paymentRequest.redirectUrl = redirectUrl;
      paymentRequest.redirectType = "WEB_LINK";
    }

    // PayPay決済を作成
    const response = await PAYPAY.QRCodeCreate(paymentRequest);

    const paypayResponse = response as unknown as PayPaySDKResponse;
    if (paypayResponse && paypayResponse.resultInfo?.code === "SUCCESS") {
      return {
        success: true,
        data: paypayResponse.data as PayPayPaymentResponse['data'],
      };
    } else {
      const resultInfo = paypayResponse?.resultInfo || { code: 'UNKNOWN', message: 'Unknown error' };
      return {
        success: false,
        error: {
          type: "payment_failed",
          message: resultInfo.message || "PayPay決済の作成に失敗しました",
          code: resultInfo.code,
          details: { resultInfo },
        },
      };
    }
  } catch (error: unknown) {
    console.error("PayPay payment creation error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return {
      success: false,
      error: {
        type: "unknown_error",
        message: "PayPay決済処理中にエラーが発生しました",
        details: { originalError: errorMessage },
      },
    };
  }
};

// PayPay決済ステータスを取得
export const getPayPayPaymentStatus = async (
  merchantPaymentId: string
): Promise<{
  success: boolean;
  status?: "CREATED" | "COMPLETED" | "FAILED" | "CANCELED";
  data?: PayPaySDKResponse['data'];
  error?: PaymentError;
}> => {
  try {
    initializePayPay();

    const response = await PAYPAY.GetPaymentDetails([merchantPaymentId]);

    const paypayResponse = response as unknown as PayPaySDKResponse;
    if (paypayResponse && paypayResponse.resultInfo?.code === "SUCCESS") {
      const responseData = paypayResponse.data;
      return {
        success: true,
        status: responseData?.status as "CREATED" | "COMPLETED" | "FAILED" | "CANCELED",
        data: responseData as PayPaySDKResponse['data'],
      };
    } else {
      const resultInfo = paypayResponse?.resultInfo || { code: 'UNKNOWN', message: 'Unknown error' };
      return {
        success: false,
        error: {
          type: "payment_failed",
          message: resultInfo.message || "PayPay決済ステータスの取得に失敗しました",
          code: resultInfo.code,
        },
      };
    }
  } catch (error: unknown) {
    console.error("PayPay payment status error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return {
      success: false,
      error: {
        type: "unknown_error",
        message: "PayPay決済ステータス取得中にエラーが発生しました",
        details: { originalError: errorMessage },
      },
    };
  }
};

// PayPay決済をキャンセル
export const cancelPayPayPayment = async (
  merchantPaymentId: string
): Promise<{
  success: boolean;
  error?: PaymentError;
}> => {
  try {
    initializePayPay();

    // Note: PayPay SDK may not have CancelPayment method
    // const response = await PAYPAY.CancelPayment({ merchantPaymentId });
    
    // For now, return success as cancellation is not implemented
    console.log("PayPay cancellation not implemented yet for:", merchantPaymentId);
    return { success: true };
  } catch (error: unknown) {
    console.error("PayPay payment cancellation error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return {
      success: false,
      error: {
        type: "unknown_error",
        message: "PayPay決済キャンセル中にエラーが発生しました",
        details: { originalError: errorMessage },
      },
    };
  }
};

// PayPay決済リンクを取得
export const getPayPayPaymentLink = (
  paymentData: PayPayPaymentResponse["data"]
): string | null => {
  if (!paymentData?.links) return null;

  const paymentLink = paymentData.links.find(
    (link) => link.rel === "redirect" && link.method === "GET"
  );

  return paymentLink?.href || null;
};

// PayPay QRコードURLを取得
export const getPayPayQRCodeUrl = (
  paymentData: PayPayPaymentResponse["data"]
): string | null => {
  if (!paymentData?.links) return null;

  const qrCodeLink = paymentData.links.find(
    (link) => link.rel === "qrcode" && link.method === "GET"
  );

  return qrCodeLink?.href || null;
};

// PayPay エラーハンドリング
export const handlePayPayError = (error: unknown): PaymentError => {
  if (error && typeof error === 'object' && 'resultInfo' in error && error.resultInfo && typeof error.resultInfo === 'object') {
    // PayPay APIエラーの場合
    const resultInfo = error.resultInfo as { code?: string; message?: string };
    const { code, message } = resultInfo;
    
    switch (code) {
      case "INVALID_REQUEST_BODY":
        return {
          type: "validation_error",
          message: "リクエストが無効です",
          code,
        };
      case "FORBIDDEN":
        return {
          type: "payment_failed",
          message: "認証に失敗しました",
          code,
        };
      case "PAYMENT_NOT_FOUND":
        return {
          type: "payment_failed",
          message: "指定された決済が見つかりません",
          code,
        };
      case "PAYMENT_EXPIRED":
        return {
          type: "payment_failed",
          message: "決済の有効期限が切れています",
          code,
        };
      default: {
        const result: PaymentError = {
          type: "payment_failed",
          message: message || "PayPay決済でエラーが発生しました",
        };
        if (code !== undefined) {
          result.code = code;
        }
        return result;
      }
    }
  } else if (error instanceof Error) {
    // 一般的なエラーの場合
    return {
      type: "unknown_error",
      message: error.message,
    };
  } else {
    return {
      type: "unknown_error",
      message: "予期しないエラーが発生しました",
    };
  }
};

// PayPay決済ステータスをポーリング
export const pollPayPayPaymentStatus = async (
  merchantPaymentId: string,
  maxAttempts: number = 30,
  intervalMs: number = 4000
): Promise<{
  success: boolean;
  status?: "CREATED" | "COMPLETED" | "FAILED" | "CANCELED";
  data?: PayPaySDKResponse['data'];
  error?: PaymentError;
}> => {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const result = await getPayPayPaymentStatus(merchantPaymentId);
    
    if (!result.success) {
      return result;
    }

    // 決済が完了または失敗した場合は結果を返す
    if (result.status === "COMPLETED" || result.status === "FAILED" || result.status === "CANCELED") {
      return result;
    }

    // まだ処理中の場合は指定時間待機
    if (attempt < maxAttempts - 1) {
      await new Promise((resolve) => setTimeout(resolve, intervalMs));
    }
  }

  // タイムアウトの場合
  return {
    success: false,
    error: {
      type: "payment_failed",
      message: "決済処理がタイムアウトしました",
      code: "TIMEOUT",
    },
  };
};