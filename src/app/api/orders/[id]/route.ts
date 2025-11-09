import { dbAdapter } from "@/lib/database-adapter";
import { COLLECTIONS } from "@/types/mongodb";
import { NextRequest, NextResponse } from "next/server";

// ✅ GET single order
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;
    const service = await (dbAdapter as any).getService();

    const order = await service.findById(COLLECTIONS.ORDERS, id);

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

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

// ✅ PATCH: Update order status
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json(
        { error: "Status is required" },
        { status: 400 }
      );
    }

    const service = await (dbAdapter as any).getService();
    const updated = await service.updateOrder(
      COLLECTIONS.ORDERS,
      { _id: id },
      { $set: { status } }
    );

    if (!updated.modifiedCount) {
      return NextResponse.json(
        { error: "Failed to update order" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Order status updated",
    });
  } catch (error) {
    console.error("❌ Update order error:", error);
    return NextResponse.json(
      { error: "Failed to update order" },
      { status: 500 }
    );
  }
}

// ✅ DELETE: Delete order
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;
    const service = await (dbAdapter as any).getService();

    // Delete order items first
    await service.deleteMany(COLLECTIONS.ORDER_ITEMS, { orderId: id });
    // Then delete order
    const deleted = await service.deleteOrder(COLLECTIONS.ORDERS, { _id: id });

    if (!deleted.deletedCount) {
      return NextResponse.json(
        { error: "Order not found or failed to delete" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Order deleted successfully",
    });
  } catch (error) {
    console.error("❌ Delete order error:", error);
    return NextResponse.json(
      { error: "Failed to delete order" },
      { status: 500 }
    );
  }
}
