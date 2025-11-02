import { dbAdapter } from "@/lib/database-adapter";
import { COLLECTIONS } from "@/types/mongodb";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;
    const service = await (dbAdapter as any).getService();

    // ✅ Get the order by ID
    const order = await service.findById(COLLECTIONS.ORDERS, id);

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // ✅ Get related order items
    const orderItems = await service.findMany(COLLECTIONS.ORDER_ITEMS, {
      orderId: id,
    });

    return NextResponse.json({
      success: true,
      order: {
        ...order,
        items: orderItems,
      },
    });
  } catch (error) {
    console.error("❌ Get order error:", error);
    return NextResponse.json(
      { error: "Failed to fetch order" },
      { status: 500 }
    );
  }
}
