import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { validateWebhookSignature, retrieveCheckoutSession } from "../../../../lib/stripe";
import { createAdminClient } from "../../../../lib/supabase/admin";
import { randomUUID } from "crypto";
import Stripe from "stripe";

interface ExistingOrder {
  id: string;
}

interface OrderResult {
  id: string;
  [key: string]: unknown;
}

interface TicketTypeResult {
  id: string;
  price: number;
  quantity_sold: number;
  [key: string]: unknown;
}

interface OrderItemResult {
  id: string;
  [key: string]: unknown;
}

export async function POST(request: NextRequest) {
  // 管理者権限のSupabaseクライアント（RLSをバイパス）
  const supabase = createAdminClient();

  try {
    const body = await request.text();
    const headersList = await headers();
    const signature = headersList.get("stripe-signature");

    if (!signature) {
      return NextResponse.json(
        { error: { type: "validation_error", message: "署名がありません" } },
        { status: 400 }
      );
    }

    const webhookSecret = process.env['STRIPE_WEBHOOK_SECRET'];
    if (!webhookSecret) {
      console.error("STRIPE_WEBHOOK_SECRET is not set");
      return NextResponse.json(
        { error: { type: "configuration_error", message: "Webhook設定エラー" } },
        { status: 500 }
      );
    }

    // Webhookの署名を検証
    let event: Stripe.Event;
    try {
      event = validateWebhookSignature(body, signature, webhookSecret);
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      return NextResponse.json(
        { error: { type: "validation_error", message: "署名検証に失敗しました" } },
        { status: 400 }
      );
    }

    // イベントタイプに応じた処理
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        // セッション詳細を取得（line_itemsとpayment_intentを展開）
        const fullSession = await retrieveCheckoutSession(session.id);

        // メタデータから注文情報を取得
        const metadata = fullSession.metadata || {};
        const orderId = metadata['orderId'];
        const eventId = metadata['eventId'];
        const customerEmail = metadata['customerEmail'];
        const customerName = metadata['customerName'];
        const customerPhone = metadata['customerPhone'];
        const orderItemsStr = metadata['orderItems'];
        const paymentMethod = metadata['paymentMethod'] as 'credit' | 'convenience';
        const userId = metadata['userId'] || null;

        if (!orderId || !eventId || !orderItemsStr) {
          console.error("必要なメタデータが不足しています:", metadata);
          return NextResponse.json(
            { error: { type: "validation_error", message: "必要な情報が不足しています" } },
            { status: 400 }
          );
        }

        const orderItems = JSON.parse(orderItemsStr);

        // 既存の注文を確認（重複処理を防ぐ）
        const { data: existingOrders, error: existingOrderError } = await supabase
          .from("orders")
          .select("id")
          .eq("payment_id", session.payment_intent as string)
          .returns<ExistingOrder[]>();

        if (existingOrders && existingOrders.length > 0 && !existingOrderError) {
          const existingOrderId = existingOrders[0]?.id;
          if (existingOrderId) {
            console.log("Order already processed:", existingOrderId);
            return NextResponse.json({ received: true, orderId: existingOrderId });
          }
        }

        // 注文作成（認証ユーザーの場合はuser_idを使用、ゲストの場合はnullでguest_infoに保存）
        const orderData: {
          user_id: string | null;
          event_id: string;
          total_amount: number;
          status: string;
          payment_method: string;
          payment_id: string;
          custom_order_id: string;
          guest_info?: {
            name: string;
            email: string;
            phone: string;
          };
        } = {
          user_id: userId, // 認証ユーザーの場合はuserIdを使用、ゲストの場合はnull
          event_id: eventId,
          total_amount: fullSession.amount_total ? fullSession.amount_total / 100 : 0, // Stripeは最小通貨単位で返す
          status: "paid",
          payment_method: paymentMethod === 'credit' ? 'credit_card' : 'convenience_store',
          payment_id: session.payment_intent as string,
          custom_order_id: orderId, // カスタム注文IDを専用カラムに保存
        };

        // ゲストユーザーの場合のみguest_infoを追加
        if (!userId) {
          orderData.guest_info = {
            name: customerName || fullSession.customer_details?.name || '',
            email: customerEmail || fullSession.customer_details?.email || '',
            phone: customerPhone || fullSession.customer_details?.phone || '',
          };
        }

        const { data: order, error: orderError } = (await supabase
          .from("orders")
          .insert(orderData as never)
          .select()
          .single()) as { data: OrderResult | null; error: unknown };

        if (orderError || !order) {
          console.error("Order creation failed:", orderError);
          return NextResponse.json(
            { error: { type: "database_error", message: "注文作成に失敗しました" } },
            { status: 500 }
          );
        }

        // 注文明細・チケット発行
        const ticketsToCreate = [];

        for (const item of orderItems) {
          const { ticketId, quantity } = item;

          // チケット種類情報取得
          const { data: ticketType } = (await supabase
            .from("ticket_types")
            .select("*")
            .eq("id", ticketId)
            .single()) as { data: TicketTypeResult | null; error: unknown };

          if (!ticketType) {
            console.error(`Ticket type not found: ${ticketId}`);
            continue;
          }

          // 注文明細作成
          const { data: orderItem } = (await supabase
            .from("order_items")
            .insert({
              order_id: order.id,
              ticket_type_id: ticketId,
              quantity: quantity,
              unit_price: ticketType.price,
              total_price: ticketType.price * quantity,
            } as never)
            .select()
            .single()) as { data: OrderItemResult | null; error: unknown };

          if (!orderItem) {
            console.error(`Failed to create order item for ticket: ${ticketId}`);
            continue;
          }

          // チケット発行（枚数分）
          for (let i = 0; i < quantity; i++) {
            const qrCode = `${randomUUID()}-${ticketId}`;
            ticketsToCreate.push({
              order_item_id: orderItem.id,
              ticket_type_id: ticketId,
              event_id: eventId,
              user_id: userId, // 認証ユーザーの場合はuserIdを使用、ゲストの場合はnull
              qr_code: qrCode,
              status: "valid",
            });
          }

          // チケット在庫更新
          await supabase
            .from("ticket_types")
            .update({
              quantity_sold: ticketType.quantity_sold + quantity,
            } as never)
            .eq("id", ticketId);
        }

        // チケット一括作成
        if (ticketsToCreate.length > 0) {
          await supabase.from("tickets").insert(ticketsToCreate as never);
        }

        console.log("Order created successfully:", order.id);
        return NextResponse.json({ received: true, orderId: order.id });
      }

      case "checkout.session.expired": {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log("Checkout session expired:", session.id);
        // 必要に応じて期限切れ処理を追加
        return NextResponse.json({ received: true });
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
        return NextResponse.json({ received: true });
    }
  } catch (error: unknown) {
    console.error("Webhook processing error:", error);

    return NextResponse.json(
      {
        error: {
          type: "webhook_error",
          message: "Webhook処理中にエラーが発生しました",
          details: error instanceof Error ? error.message : String(error),
        },
      },
      { status: 500 }
    );
  }
}
