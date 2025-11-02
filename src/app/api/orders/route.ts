// app/api/orders/route.ts
import { createDatabaseAdapter } from "@/lib/database-adapter";
import { COLLECTIONS } from "@/types/mongodb";
import { NextRequest, NextResponse } from "next/server";
import ZAI from "z-ai-web-dev-sdk";

const dbAdapter = createDatabaseAdapter();

// export async function POST(req: NextRequest) {
//   try {
//     const body = await req.json();

//     const { userId, items, total, shippingInfo, paymentMethod, status } = body;

//     const db = await dbAdapter();
//     const orders = db.collection(COLLECTIONS.ORDERS);

//     const newOrder = {
//       userId: new ObjectId(userId),
//       items,
//       total,
//       shippingInfo,
//       paymentMethod,
//       status: status || "pending",
//       createdAt: new Date(),
//     };

//     const result = await orders.insertOne(newOrder);

//     return NextResponse.json({ success: true, orderId: result.insertedId });
//   } catch (error) {
//     console.error(error);
//     return NextResponse.json(
//       { success: false, error: "Order creation failed" },
//       { status: 500 }
//     );
//   }
// }

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      items,
      shippingAddress,
      paymentMethod,
      subtotal,
      tax,
      shipping,
      total,
      notes,
      guestEmail,
      userId,
    } = body;

    // Generate unique order number
    const orderNumber = `ORD-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 4)
      .toUpperCase()}`;

    const service = await (dbAdapter as any).getService();

    // ✅ 1️⃣ Create order
    const order = await service.create(COLLECTIONS.ORDERS, {
      orderNumber,
      userId,
      guestEmail,
      status: "PENDING",
      paymentStatus: "PENDING",
      paymentMethod,
      subtotal,
      tax,
      shipping,
      total,
      notes,
      address: shippingAddress,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // ✅ 2️⃣ Create order items & update stock
    for (const item of items) {
      await service.create(COLLECTIONS.ORDER_ITEMS, {
        orderId: order._id.toString(),
        productId: item.productId,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        total: item.price * item.quantity,
      });

      // Update product stock
      await service.updateMany(
        COLLECTIONS.PRODUCTS,
        // { _id: new ObjectId(item.productId) }, //replace when react product id available
        { _id: item.productId },
        { $inc: { quantity: -item.quantity } } // decrement stock
      );
    }

    // ✅ 3️⃣ Send confirmation email (mock)
    try {
      const zai = await ZAI.create();
      const emailContent = `
        Order Confirmation - ${orderNumber}

        Thank you for your order!

        Order Details:
        - Order Number: ${orderNumber}
        - Total: $${total}
        - Payment Method: ${paymentMethod}
        - Shipping Address: ${shippingAddress.address1}, ${
        shippingAddress.city
      }, ${shippingAddress.province}

        Items:
        ${items
          .map(
            (item: any) => `- ${item.name} x${item.quantity} - $${item.price}`
          )
          .join("\n")}
      `;

      console.log("📧 Email content generated:", emailContent);
    } catch (emailError) {
      console.error("⚠️ Failed to send confirmation email:", emailError);
    }

    return NextResponse.json({
      success: true,
      order: {
        id: order._id.toString(),
        orderNumber: order.orderNumber,
        status: order.status,
        total: order.total,
      },
    });
  } catch (error) {
    console.error("❌ Create order error:", error);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    const service = await (dbAdapter as any).getService();
    const filter = userId ? { userId } : {};

    // ✅ 1️⃣ Get orders
    const orders = await service.findMany(COLLECTIONS.ORDERS, filter, {
      sort: { createdAt: -1 },
      skip,
      limit,
    });

    // ✅ 2️⃣ Count total
    const total = await service.count(COLLECTIONS.ORDERS, filter);

    // ✅ 3️⃣ Attach items and products
    const ordersWithItems = await Promise.all(
      orders.map(async (order: any) => {
        const orderItems = await service.findMany(COLLECTIONS.ORDER_ITEMS, {
          orderId: order._id.toString(),
        });

        const itemsWithProducts = await Promise.all(
          orderItems.map(async (item: any) => {
            const product = await service.findById(
              COLLECTIONS.PRODUCTS,
              item.productId
            );
            return {
              ...item,
              product: product
                ? {
                    name: product.name,
                    images: product.images ? JSON.parse(product.images) : [],
                  }
                : null,
            };
          })
        );

        return {
          ...order,
          id: order._id.toString(),
          items: itemsWithProducts,
        };
      })
    );

    return NextResponse.json({
      orders: ordersWithItems,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("❌ Get orders error:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}
