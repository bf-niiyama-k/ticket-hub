import { NextRequest, NextResponse } from "next/server";
import { confirmPaymentIntent, retrievePaymentIntent, handleStripeError } from "../../../../lib/stripe";
import { getPayPayPaymentStatus } from "../../../../lib/paypay";
// import { createClient } from "../../../../lib/supabase/server"; // 一時的に未使用

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      paymentIntentId,
      paymentMethod,
      orderId,
    }: {
      paymentIntentId: string;
      paymentMethod: "credit" | "paypay" | "convenience";
      orderId?: string;
    } = body;

    if (!paymentIntentId) {
      return NextResponse.json(
        { error: { type: "validation_error", message: "Payment Intent IDが必要です" } },
        { status: 400 }
      );
    }

    // const supabase = await createClient(); // 一時的に未使用

    if (paymentMethod === "paypay") {
      // PayPay決済の場合
      if (!orderId) {
        return NextResponse.json(
          { error: { type: "validation_error", message: "Order IDが必要です" } },
          { status: 400 }
        );
      }

      const result = await getPayPayPaymentStatus(orderId);

      if (result.success && result.status === "COMPLETED") {
        // 決済成功をデータベースに記録
        // TODO: Supabase型定義の問題により一時的にコメントアウト
        // const { error: dbError } = await supabase
        //   .from("orders")
        //   .update({
        //     status: "paid" as const,
        //     payment_id: paymentIntentId,
        //   })
        //   .eq("id", orderId);

        // if (dbError) {
        //   console.error("Database update error:", dbError);
        // }

        console.log("PayPay payment completed for order:", orderId);

        return NextResponse.json({
          success: true,
          status: "completed",
          orderId,
        });
      } else if (result.status === "FAILED" || result.status === "CANCELED") {
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
        // PaymentIntentの現在のステータスを確認
        const paymentIntent = await retrievePaymentIntent(paymentIntentId);

        if (paymentIntent.status === "succeeded") {
          // 決済成功をデータベースに記録
          // TODO: Supabase型定義の問題により一時的にコメントアウト
          // const orderIdFromMetadata = paymentIntent.metadata?.orderId;
          
          // if (orderIdFromMetadata) {
          //   const { error: dbError } = await supabase
          //     .from("orders")
          //     .update({
          //       payment_status: "completed",
          //       payment_intent_id: paymentIntentId,
          //       updated_at: new Date().toISOString(),
          //     })
          //     .eq("order_id", orderIdFromMetadata);

          //   if (dbError) {
          //     console.error("Database update error:", dbError);
          //   }
          // }

          console.log("Stripe payment completed for payment intent:", paymentIntentId);

          return NextResponse.json({
            success: true,
            status: "completed",
            orderId: paymentIntent.metadata?.orderId || null,
          });
        } else if (paymentIntent.status === "requires_confirmation") {
          // 確認が必要な場合
          const confirmedPayment = await confirmPaymentIntent(paymentIntentId);
          
          if (confirmedPayment.status === "succeeded") {
            // 決済成功をデータベースに記録
            // TODO: Supabase型定義の問題により一時的にコメントアウト
            // const orderIdFromMetadata = confirmedPayment.metadata?.orderId;
            
            // if (orderIdFromMetadata) {
            //   const { error: dbError } = await supabase
            //     .from("orders")
            //     .update({
            //       payment_status: "completed",
            //       payment_intent_id: paymentIntentId,
            //       updated_at: new Date().toISOString(),
            //     })
            //     .eq("order_id", orderIdFromMetadata);

            //   if (dbError) {
            //     console.error("Database update error:", dbError);
            //   }
            // }

            console.log("Payment confirmed successfully for payment intent:", paymentIntentId);

            return NextResponse.json({
              success: true,
              status: "completed",
              orderId: confirmedPayment.metadata?.orderId || null,
            });
          } else {
            return NextResponse.json({
              success: false,
              error: {
                type: "payment_failed",
                message: "決済の確認に失敗しました",
              },
            });
          }
        } else if (paymentIntent.status === "requires_payment_method") {
          return NextResponse.json({
            success: false,
            error: {
              type: "payment_failed",
              message: "決済方法が無効です",
            },
          });
        } else if (paymentIntent.status === "canceled") {
          return NextResponse.json({
            success: false,
            error: {
              type: "payment_failed",
              message: "決済がキャンセルされました",
            },
          });
        } else {
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