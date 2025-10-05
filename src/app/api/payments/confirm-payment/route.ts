import { NextRequest, NextResponse } from "next/server";
import { confirmPaymentIntent, retrievePaymentIntent, handleStripeError } from "../../../../lib/stripe";
import { getPayPayPaymentStatus } from "../../../../lib/paypay";
import { createAdminClient } from "../../../../lib/supabase/admin";
import { orderAPI } from "../../../../lib/database";
import { randomUUID } from "crypto";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const supabase = createAdminClient() as any;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      paymentIntentId,
      paymentMethod,
      orderId,
      userId,
      guestInfo,
    }: {
      paymentIntentId: string;
      paymentMethod: "credit" | "paypay" | "convenience";
      orderId?: string;
      userId?: string;
      guestInfo?: {
        name: string;
        email: string;
        phone: string;
      };
    } = body;

    if (!paymentIntentId) {
      return NextResponse.json(
        { error: { type: "validation_error", message: "Payment Intent IDが必要です" } },
        { status: 400 }
      );
    }

    let paymentStatus: "succeeded" | "pending" | "failed" = "pending";
    let paymentMetadata: Record<string, string> = {};

    // 決済ステータスの確認
    if (paymentMethod === "paypay") {
      if (!orderId) {
        return NextResponse.json(
          { error: { type: "validation_error", message: "Order IDが必要です" } },
          { status: 400 }
        );
      }

      const result = await getPayPayPaymentStatus(orderId);

      if (result.success && result.status === "COMPLETED") {
        paymentStatus = "succeeded";
      } else if (result.status === "FAILED" || result.status === "CANCELED") {
        paymentStatus = "failed";
        return NextResponse.json({
          success: false,
          error: {
            type: "payment_failed",
            message: result.status === "CANCELED" ? "決済がキャンセルされました" : "決済に失敗しました",
          },
        });
      } else {
        return NextResponse.json({
          success: false,
          error: {
            type: "payment_failed",
            message: "決済がまだ完了していません",
          },
        });
      }
    } else {
      // Stripe決済の場合
      try {
        const paymentIntent = await retrievePaymentIntent(paymentIntentId);

        if (paymentIntent.status === "succeeded") {
          paymentStatus = "succeeded";
          paymentMetadata = paymentIntent.metadata as Record<string, string>;
        } else if (paymentIntent.status === "requires_confirmation") {
          const confirmedPayment = await confirmPaymentIntent(paymentIntentId);

          if (confirmedPayment.status === "succeeded") {
            paymentStatus = "succeeded";
            paymentMetadata = confirmedPayment.metadata as Record<string, string>;
          } else {
            paymentStatus = "failed";
            return NextResponse.json({
              success: false,
              error: {
                type: "payment_failed",
                message: "決済の確認に失敗しました",
              },
            });
          }
        } else {
          paymentStatus = "failed";
          return NextResponse.json({
            success: false,
            error: {
              type: "payment_failed",
              message: `決済ステータス: ${paymentIntent.status}`,
            },
          });
        }
      } catch (error: unknown) {
        console.error("Stripe payment confirmation error:", error);
        const stripeError = handleStripeError(error);

        return NextResponse.json(
          {
            success: false,
            error: {
              type: "payment_failed",
              message: stripeError.message,
              code: stripeError.code,
            },
          },
          { status: 400 }
        );
      }
    }

    // 決済が成功した場合、注文作成・チケット発行を実行
    if (paymentStatus === "succeeded") {
      try {
        let order;
        let orderItemsData;

        if (paymentMethod === "paypay" && orderId) {
          // PayPayの場合：既存の注文を取得して更新
          console.log("Searching for order with custom_order_id:", orderId);
          const { data: existingOrders, error: searchError } = await supabase
            .from("orders")
            .select(`
              *,
              order_items(
                *,
                ticket_type:ticket_types(*)
              )
            `)
            .eq("custom_order_id", orderId)
            .single();

          console.log("Order search result:", existingOrders, "Error:", searchError);

          if (!existingOrders) {
            return NextResponse.json({
              success: false,
              error: {
                type: "validation_error",
                message: "注文が見つかりません",
                details: { orderId, searchError },
              },
            }, { status: 404 });
          }

          // 注文ステータスを更新
          const { error: updateError } = await supabase
            .from("orders")
            .update({ status: "paid" })
            .eq("id", existingOrders.id);

          if (updateError) {
            console.error("Failed to update order status:", updateError);
          }

          order = { ...existingOrders, status: "paid" };
          orderItemsData = existingOrders.order_items;
        } else {
          // Stripeの場合：メタデータから注文情報を取得して新規作成
          const eventId = paymentMetadata['eventId'];
          const orderItems = JSON.parse(paymentMetadata['orderItems'] || "[]");
          const totalAmount = parseInt(paymentMetadata['amount'] || "0", 10);

          if (!eventId || !orderItems || orderItems.length === 0) {
            return NextResponse.json({
              success: false,
              error: {
                type: "validation_error",
                message: "注文情報が不足しています",
              },
            });
          }

          // 注文作成
          order = await orderAPI.createOrder({
            user_id: userId || 'guest', // TODO: ゲストユーザーの処理を後で改善
            event_id: eventId,
            total_amount: totalAmount,
            status: "paid",
            payment_method: paymentMethod === 'credit' ? 'credit_card' : paymentMethod === 'paypay' ? 'paypal' : 'convenience_store',
            payment_id: paymentIntentId,
            guest_info: guestInfo ? guestInfo as unknown as Record<string, unknown> : null,
          } as Parameters<typeof orderAPI.createOrder>[0]);

          // 注文明細を作成
          for (const item of orderItems) {
            const { ticketId, quantity } = item;

            // チケット種類情報取得
            const { data: ticketType } = await supabase
              .from("ticket_types")
              .select("*")
              .eq("id", ticketId)
              .single();

            if (!ticketType) {
              console.error(`Ticket type not found: ${ticketId}`);
              continue;
            }

            // 注文明細作成
            await supabase
              .from("order_items")
              .insert({
                order_id: order.id,
                ticket_type_id: ticketId,
                quantity: quantity,
                unit_price: ticketType.price,
                total_price: ticketType.price * quantity,
              });
          }

          // 注文明細を取得
          const { data: createdOrderItems } = await supabase
            .from("order_items")
            .select(`
              *,
              ticket_type:ticket_types(*)
            `)
            .eq("order_id", order.id);

          orderItemsData = createdOrderItems || [];
        }

        // チケット発行
        const ticketsToCreate = [];

        for (const item of orderItemsData) {
          const ticketTypeId = item.ticket_type_id;
          const quantity = item.quantity;
          const eventId = item.ticket_type?.event_id || order.event_id;

          // チケット発行（枚数分）
          for (let i = 0; i < quantity; i++) {
            const qrCode = `${randomUUID()}-${ticketTypeId}`;
            ticketsToCreate.push({
              order_item_id: item.id,
              ticket_type_id: ticketTypeId,
              event_id: eventId,
              user_id: order.user_id,
              qr_code: qrCode,
              status: "valid",
            });
          }

          // チケット在庫更新
          const { data: ticketType } = await supabase
            .from("ticket_types")
            .select("quantity_sold")
            .eq("id", ticketTypeId)
            .single();

          if (ticketType) {
            await supabase
              .from("ticket_types")
              .update({
                quantity_sold: ticketType.quantity_sold + quantity,
              })
              .eq("id", ticketTypeId);
          }
        }

        // チケット一括作成
        if (ticketsToCreate.length > 0) {
          await supabase.from("tickets").insert(ticketsToCreate);
        }

        return NextResponse.json({
          success: true,
          status: "completed",
          orderId: order.id,
        });
      } catch (dbError: unknown) {
        console.error("Database operation error:", dbError);
        return NextResponse.json(
          {
            success: false,
            error: {
              type: "database_error",
              message: "注文の作成に失敗しました",
              details: dbError instanceof Error ? dbError.message : String(dbError),
            },
          },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      success: false,
      error: {
        type: "payment_failed",
        message: "決済処理が完了していません",
      },
    });
  } catch (error: unknown) {
    console.error("Payment confirmation error:", error);

    return NextResponse.json(
      {
        success: false,
        error: {
          type: "unknown_error",
          message: "決済確認中にエラーが発生しました",
          details: error instanceof Error ? error.message : String(error),
        },
      },
      { status: 500 }
    );
  }
}