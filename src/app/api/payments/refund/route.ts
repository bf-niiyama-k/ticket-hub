import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createAdminClient } from '../../../../lib/supabase/admin';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const supabase = createAdminClient() as any;

const stripe = new Stripe(process.env['STRIPE_SECRET_KEY']!, {
  apiVersion: '2025-08-27.basil',
});

export async function POST(request: NextRequest) {
  try {
    const { orderId } = await request.json();

    if (!orderId) {
      return NextResponse.json(
        { error: '注文IDが必要です' },
        { status: 400 }
      );
    }

    // 注文情報取得
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        *,
        order_items(
          *,
          ticket_type:ticket_types(*)
        )
      `)
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      return NextResponse.json(
        { error: '注文が見つかりません' },
        { status: 404 }
      );
    }

    if (order.status !== 'paid') {
      return NextResponse.json(
        { error: '返金できない注文です（支払済みの注文のみ返金可能）' },
        { status: 400 }
      );
    }

    // Stripe返金処理
    if (order.payment_id && order.payment_method !== 'paypay') {
      try {
        await stripe.refunds.create({
          payment_intent: order.payment_id,
        });
      } catch (stripeError: unknown) {
        console.error('Stripe refund error:', stripeError);
        return NextResponse.json(
          {
            error: 'Stripe返金処理に失敗しました',
            details: stripeError instanceof Error ? stripeError.message : String(stripeError)
          },
          { status: 500 }
        );
      }
    }

    // 注文ステータス更新
    const { error: updateOrderError } = await supabase
      .from('orders')
      .update({ status: 'refunded' })
      .eq('id', orderId);

    if (updateOrderError) {
      console.error('Failed to update order status:', updateOrderError);
      return NextResponse.json(
        { error: '注文ステータスの更新に失敗しました' },
        { status: 500 }
      );
    }

    // チケットキャンセル（order_items経由で取得）
    const orderItemIds = order.order_items?.map((item: { id: string }) => item.id) || [];

    if (orderItemIds.length > 0) {
      const { data: tickets, error: ticketsError } = await supabase
        .from('tickets')
        .select('id, ticket_type_id')
        .in('order_item_id', orderItemIds);

      if (ticketsError) {
        console.error('Failed to fetch tickets:', ticketsError);
      } else if (tickets && tickets.length > 0) {
        // チケットステータスを cancelled に更新
        const { error: updateTicketsError } = await supabase
          .from('tickets')
          .update({ status: 'cancelled' })
          .in('id', tickets.map((t: { id: string }) => t.id));

        if (updateTicketsError) {
          console.error('Failed to update ticket status:', updateTicketsError);
        }
      }
    }

    // チケット在庫復元
    for (const item of order.order_items || []) {
      const { data: ticketType } = await supabase
        .from('ticket_types')
        .select('quantity_sold')
        .eq('id', item.ticket_type_id)
        .single();

      if (ticketType) {
        const newQuantitySold = Math.max(0, ticketType.quantity_sold - item.quantity);

        const { error: updateStockError } = await supabase
          .from('ticket_types')
          .update({ quantity_sold: newQuantitySold })
          .eq('id', item.ticket_type_id);

        if (updateStockError) {
          console.error('Failed to restore ticket stock:', updateStockError);
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: '返金処理が完了しました'
    });
  } catch (error: unknown) {
    console.error('返金処理エラー:', error);
    return NextResponse.json(
      {
        error: '返金処理に失敗しました',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
