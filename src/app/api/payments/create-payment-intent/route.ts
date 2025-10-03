import { NextRequest, NextResponse } from "next/server";
import { createPaymentLink, handleStripeError } from "../../../../lib/stripe";
import { createPayPayPayment } from "../../../../lib/paypay";
import { eventAPI } from "../../../../lib/database";
import type { PaymentMethod, OrderItem } from "../../../../types/payment";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      amount,
      paymentMethod,
      orderItems,
      customerInfo,
      eventId,
      eventTitle,
      userId,
    }: {
      amount: number;
      paymentMethod: PaymentMethod;
      orderItems: OrderItem[];
      customerInfo: {
        email: string;
        firstName: string;
        lastName: string;
        phone: string;
      };
      eventId: string;
      eventTitle: string;
      userId?: string;
    } = body;

    // バリデーション
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: { type: "validation_error", message: "有効な金額を入力してください" } },
        { status: 400 }
      );
    }

    if (!paymentMethod || !["credit", "paypay", "convenience"].includes(paymentMethod)) {
      return NextResponse.json(
        { error: { type: "validation_error", message: "有効な決済方法を選択してください" } },
        { status: 400 }
      );
    }

    if (!orderItems || orderItems.length === 0) {
      return NextResponse.json(
        { error: { type: "validation_error", message: "注文項目が必要です" } },
        { status: 400 }
      );
    }

    if (!customerInfo?.email) {
      return NextResponse.json(
        { error: { type: "validation_error", message: "メールアドレスが必要です" } },
        { status: 400 }
      );
    }

    // イベント情報とチケット種類を取得
    const event = await eventAPI.getEventById(eventId);
    if (!event) {
      return NextResponse.json(
        { error: { type: "validation_error", message: "イベントが見つかりません" } },
        { status: 404 }
      );
    }

    // チケット在庫確認と金額計算
    let calculatedAmount = 0;
    for (const item of orderItems) {
      const ticketType = event.ticket_types?.find(tt => tt.id === item.ticketId);
      if (!ticketType) {
        return NextResponse.json(
          { error: { type: "validation_error", message: `チケット種類が見つかりません: ${item.ticketId}` } },
          { status: 400 }
        );
      }

      const availableStock = ticketType.quantity_total - ticketType.quantity_sold;
      if (availableStock < item.quantity) {
        return NextResponse.json(
          { error: { type: "validation_error", message: `${ticketType.name}の在庫が不足しています（残り${availableStock}枚）` } },
          { status: 400 }
        );
      }

      calculatedAmount += ticketType.price * item.quantity;
    }

    // システム手数料を追加（5%）
    calculatedAmount += Math.floor(calculatedAmount * 0.05);

    // 金額検証（改ざん防止）
    if (Math.abs(calculatedAmount - amount) > 1) {
      return NextResponse.json(
        { error: { type: "validation_error", message: "金額が一致しません" } },
        { status: 400 }
      );
    }

    // 注文IDを生成
    const orderId = `ORDER-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    if (paymentMethod === "paypay") {
      // PayPay決済の場合
      const result = await createPayPayPayment({
        amount,
        orderId,
        eventTitle,
        customerEmail: customerInfo.email,
        orderItems,
        redirectUrl: `${process.env['NEXT_PUBLIC_BASE_URL']}/purchase-complete?payment_method=paypay&order_id=${orderId}`,
      });

      if (result.success && result.data) {
        return NextResponse.json({
          success: true,
          paymentIntentId: result.data.paymentId,
          orderId,
          paymentMethod: "paypay",
          redirectUrl: result.data.links?.find(link => link.rel === "redirect")?.href,
          qrCodeUrl: result.data.links?.find(link => link.rel === "qrcode")?.href,
        });
      } else {
        return NextResponse.json(
          { 
            success: false,
            error: result.error || { type: "payment_failed", message: "PayPay決済の作成に失敗しました" }
          },
          { status: 400 }
        );
      }
    } else {
      // Stripe決済の場合（クレジットカード・コンビニ決済）
      try {
        // Payment Linkで使用するline_itemsを構築
        const lineItems = orderItems.map(item => {
          const ticketType = event.ticket_types?.find(tt => tt.id === item.ticketId);
          if (!ticketType) {
            throw new Error(`チケット種類が見つかりません: ${item.ticketId}`);
          }

          return {
            priceData: {
              productName: `${eventTitle} - ${ticketType.name}`,
              currency: 'jpy',
              unitAmount: ticketType.price,
            },
            quantity: item.quantity,
          };
        });

        // システム手数料を追加
        const systemFee = Math.floor(calculatedAmount * 0.05);
        if (systemFee > 0) {
          lineItems.push({
            priceData: {
              productName: 'システム手数料',
              currency: 'jpy',
              unitAmount: systemFee,
            },
            quantity: 1,
          });
        }

        // リダイレクト先URLを構築（NEXT_PUBLIC_APP_URLまたはNEXT_PUBLIC_SITE_URLを使用）
        const baseUrl = process.env['NEXT_PUBLIC_APP_URL'] ||
                       process.env['NEXT_PUBLIC_SITE_URL'] ||
                       'http://localhost:3000';

        // カスタムorderIdをリダイレクトURLに含める
        const afterCompletionUrl = `${baseUrl}/purchase-complete?payment_method=${paymentMethod}&order_id=${orderId}`;

        // Payment Linkを作成
        const paymentLink = await createPaymentLink({
          lineItems,
          metadata: {
            orderId,
            eventId,
            eventTitle,
            customerEmail: customerInfo.email,
            customerName: `${customerInfo.lastName} ${customerInfo.firstName}`,
            customerPhone: customerInfo.phone,
            orderItems: JSON.stringify(orderItems),
            paymentMethod,
            userId: userId || '',
          },
          afterCompletionUrl,
        });

        return NextResponse.json({
          success: true,
          paymentLinkId: paymentLink.id,
          paymentLinkUrl: paymentLink.url,
          orderId,
          paymentMethod,
        });
      } catch (error: unknown) {
        console.error("Stripe payment link creation error:", error);
        const stripeError = handleStripeError(error);

        return NextResponse.json(
          {
            success: false,
            error: {
              type: "payment_failed",
              message: stripeError.message,
              code: stripeError.code,
            }
          },
          { status: 400 }
        );
      }
    }
  } catch (error: unknown) {
    console.error("Payment intent creation error:", error);
    
    return NextResponse.json(
      {
        success: false,
        error: {
          type: "unknown_error",
          message: "決済処理中にエラーが発生しました",
          details: error instanceof Error ? error.message : String(error),
        },
      },
      { status: 500 }
    );
  }
}