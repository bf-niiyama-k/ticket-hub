import { useState, useCallback } from "react";
import type {
  UsePaymentReturn,
  PaymentMethod,
  OrderItem,
  PaymentFormData,
  PaymentError,
  PaymentIntent,
  PaymentResult,
} from "../types/payment";

export const usePayment = (): UsePaymentReturn => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<PaymentError | null>(null);
  const [paymentIntent, setPaymentIntent] = useState<PaymentIntent | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const createPaymentIntent = useCallback(
    async (data: {
      amount: number;
      paymentMethod: PaymentMethod;
      orderItems: OrderItem[];
      customerInfo: Partial<PaymentFormData>;
      eventId: string;
      userId?: string;
    }): Promise<PaymentResult> => {
      setIsProcessing(true);
      setError(null);

      try {
        // バリデーション
        if (!data.customerInfo.email || !data.customerInfo.firstName || !data.customerInfo.lastName) {
          const validationError: PaymentError = {
            type: "validation_error",
            message: "お名前とメールアドレスは必須項目です",
          };
          setError(validationError);
          return { success: false, error: validationError };
        }

        if (data.amount <= 0) {
          const validationError: PaymentError = {
            type: "validation_error",
            message: "有効な金額を入力してください",
          };
          setError(validationError);
          return { success: false, error: validationError };
        }

        // APIリクエスト
        const response = await fetch("/api/payments/create-payment-intent", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            amount: data.amount,
            paymentMethod: data.paymentMethod,
            orderItems: data.orderItems,
            customerInfo: data.customerInfo,
            eventId: data.eventId,
            eventTitle: data.orderItems[0]?.ticketName || "チケット購入",
            userId: data.userId,
          }),
        });

        const result = await response.json();

        if (result.success) {
          const intent: PaymentIntent = {
            id: result.paymentLinkId || result.paymentIntentId,
            amount: data.amount,
            currency: "jpy",
            status: "pending",
            paymentMethod: data.paymentMethod,
            orderId: result.orderId,
            eventId: data.eventId,
            metadata: {
              customerEmail: data.customerInfo.email!,
              customerName: `${data.customerInfo.lastName} ${data.customerInfo.firstName}`,
            },
          };

          setPaymentIntent(intent);

          return {
            success: true,
            paymentIntentId: result.paymentLinkId || result.paymentIntentId,
            orderId: result.orderId,
            redirectUrl: result.paymentLinkUrl || result.redirectUrl,
          };
        } else {
          setError(result.error);
          return { success: false, error: result.error };
        }
      } catch (err: unknown) {
        const networkError: PaymentError = {
          type: "network_error",
          message: "ネットワークエラーが発生しました",
          details: { originalError: err instanceof Error ? err.message : "Unknown error" },
        };
        setError(networkError);
        return { success: false, error: networkError };
      } finally {
        setIsProcessing(false);
      }
    },
    []
  );

  const confirmPayment = useCallback(
    async (
      paymentIntentId: string
    ): Promise<PaymentResult> => {
      setIsProcessing(true);
      setError(null);

      try {
        if (!paymentIntent) {
          const validationError: PaymentError = {
            type: "validation_error",
            message: "Payment Intentが見つかりません",
          };
          setError(validationError);
          return { success: false, error: validationError };
        }

        // Payment Links方式では、決済はStripeのホストページで完了し、
        // Webhookで注文作成が行われるため、ここでは成功として返す
        return {
          success: true,
          paymentIntentId,
          orderId: paymentIntent.orderId,
        };
      } catch (err: unknown) {
        const networkError: PaymentError = {
          type: "network_error",
          message: "ネットワークエラーが発生しました",
          details: { originalError: err instanceof Error ? err.message : "Unknown error" },
        };
        setError(networkError);
        return { success: false, error: networkError };
      } finally {
        setIsProcessing(false);
      }
    },
    [paymentIntent]
  );

  const cancelPayment = useCallback(
    async (paymentIntentId: string): Promise<boolean> => {
      setIsProcessing(true);
      setError(null);

      try {
        // キャンセル処理の実装（必要に応じて）
        console.log("Cancelling payment intent:", paymentIntentId);
        if (paymentIntent) {
          setPaymentIntent({ ...paymentIntent, status: "canceled" });
        }
        return true;
      } catch (err: unknown) {
        const networkError: PaymentError = {
          type: "network_error",
          message: "キャンセル処理中にエラーが発生しました",
          details: { originalError: err instanceof Error ? err.message : "Unknown error" },
        };
        setError(networkError);
        return false;
      } finally {
        setIsProcessing(false);
      }
    },
    [paymentIntent]
  );

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