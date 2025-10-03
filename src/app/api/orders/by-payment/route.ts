import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "../../../../lib/supabase/admin";

export async function GET(request: NextRequest) {
  const supabase = createAdminClient();
  const { searchParams } = new URL(request.url);
  const paymentId = searchParams.get("payment_id");

  if (!paymentId) {
    return NextResponse.json(
      { error: "payment_id is required" },
      { status: 400 }
    );
  }

  try {
    const { data: order, error } = await supabase
      .from("orders")
      .select(`
        *,
        event:events(*),
        order_items(
          *,
          ticket_type:ticket_types(*)
        )
      `)
      .eq("payment_id", paymentId)
      .single();

    if (error) {
      console.error("Order fetch error:", error);
      return NextResponse.json(
        { error: "注文が見つかりません" },
        { status: 404 }
      );
    }

    return NextResponse.json({ order });
  } catch (error) {
    console.error("Order fetch error:", error);
    return NextResponse.json(
      { error: "サーバーエラーが発生しました" },
      { status: 500 }
    );
  }
}
