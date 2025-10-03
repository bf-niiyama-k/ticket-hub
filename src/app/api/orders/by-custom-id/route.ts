import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "../../../../lib/supabase/admin";

interface OrderResponse {
  id: string;
  [key: string]: unknown;
}

export async function GET(request: NextRequest) {
  const supabase = createAdminClient();
  const { searchParams } = new URL(request.url);
  const customOrderId = searchParams.get("custom_order_id");

  if (!customOrderId) {
    return NextResponse.json(
      { error: "custom_order_id is required" },
      { status: 400 }
    );
  }

  try {
    // custom_order_idカラムで検索
    const { data: orders, error } = await supabase
      .from("orders")
      .select(`
        *,
        event:events(*),
        order_items(
          *,
          ticket_type:ticket_types(*)
        )
      `)
      .eq("custom_order_id", customOrderId)
      .returns<OrderResponse[]>();

    if (error) {
      console.error("Order fetch error:", error);
      return NextResponse.json(
        { error: "注文検索中にエラーが発生しました" },
        { status: 500 }
      );
    }

    const order = orders?.[0] || null;

    if (!order) {
      return NextResponse.json(
        { error: "注文が見つかりません", customOrderId },
        { status: 404 }
      );
    }

    // チケット情報を取得
    const { data: tickets, error: ticketsError } = await supabase
      .from("tickets")
      .select(`
        *,
        event:events(id, title, date_start, location, image_url),
        ticket_type:ticket_types(id, name, price),
        order_item:order_items!inner(order_id)
      `)
      .eq("order_item.order_id", order.id);

    if (ticketsError) {
      console.error("Tickets fetch error:", ticketsError);
    }

    return NextResponse.json({
      order,
      tickets: tickets || []
    });
  } catch (error) {
    console.error("Order fetch error:", error);
    return NextResponse.json(
      { error: "サーバーエラーが発生しました" },
      { status: 500 }
    );
  }
}
