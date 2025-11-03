// app/api/orders/route.ts
import { createDatabaseAdapter } from "@/lib/database-adapter";
import { COLLECTIONS } from "@/types/mongodb";
import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
const dbAdapter = createDatabaseAdapter();

// Configure email transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
});
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
      const customerEmail = shippingAddress?.email;
      // const customerEmail = guestEmail || userId || shippingAddress?.email;
      console.log("🚀 ~ POST ~ customerEmail:", customerEmail);

      await transporter.sendMail({
        from: `"Your Store" <${process.env.EMAIL_USER}>`,
        to: customerEmail,
        subject: `Order Confirmation - ${orderNumber}`,
        html: generateOrderEmailHTML(
          orderNumber,
          items,
          total,
          paymentMethod,
          shippingAddress,
          subtotal,
          tax,
          shipping
        ),
      });

      console.log("✅ Confirmation email sent to:", customerEmail);
    } catch (emailError) {
      console.error("⚠️ Failed to send confirmation email:", emailError);
      // Don't fail the order if email fails
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

// Helper function to generate email HTML
function generateOrderEmailHTML(
  orderNumber: string,
  items: any[],
  total: number,
  paymentMethod: string,
  shippingAddress: any,
  subtotal: number,
  tax: number,
  shipping: number
): string {
  const itemsHTML = items
    .map(
      (item) => `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #eee;">
            ${item.name}
          </td>
          <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">
            ${item.quantity}
          </td>
          <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">
            $${item.price.toFixed(2)}
          </td>
          <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right; font-weight: bold;">
            $${(item.price * item.quantity).toFixed(2)}
          </td>
        </tr>
      `
    )
    .join("");

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
        <div style="background-color: #fff; padding: 40px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <div style="background-color: #2563eb; padding: 30px; border-radius: 10px; margin-bottom: 30px; text-align: center;">
            <h1 style="color: #fff; margin: 0 0 10px 0; font-size: 28px;">Order Confirmed! 🎉</h1>
            <p style="color: #e0e7ff; font-size: 16px; margin: 0;">Thank you for your order</p>
          </div>

          <!-- Order Info -->
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #1f2937; font-size: 18px; margin-top: 0;">Order Information</h2>
            <table style="width: 100%;">
              <tr>
                <td style="padding: 8px 0;"><strong>Order Number:</strong></td>
                <td style="padding: 8px 0; text-align: right; color: #2563eb; font-weight: bold;">${orderNumber}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0;"><strong>Payment Method:</strong></td>
                <td style="padding: 8px 0; text-align: right;">${paymentMethod}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0;"><strong>Order Status:</strong></td>
                <td style="padding: 8px 0; text-align: right;"><span style="background-color: #fef3c7; color: #92400e; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: bold;">PENDING</span></td>
              </tr>
            </table>
          </div>

          <!-- Shipping Address -->
          <div style="background-color: #fff; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #1f2937; font-size: 18px; margin-top: 0;">📦 Shipping Address</h2>
            <p style="margin: 5px 0; line-height: 1.8;">
              ${shippingAddress.address1}<br>
              ${
                shippingAddress.address2
                  ? `${shippingAddress.address2}<br>`
                  : ""
              }
              ${shippingAddress.city}, ${shippingAddress.province} ${
    shippingAddress.postalCode
  }<br>
              ${shippingAddress.country}
            </p>
          </div>

          <!-- Order Items -->
          <div style="background-color: #fff; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #1f2937; font-size: 18px; margin-top: 0;">🛍️ Order Items</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr style="background-color: #f9fafb;">
                  <th style="padding: 12px; text-align: left; border-bottom: 2px solid #e5e7eb; font-weight: 600;">Item</th>
                  <th style="padding: 12px; text-align: center; border-bottom: 2px solid #e5e7eb; font-weight: 600;">Qty</th>
                  <th style="padding: 12px; text-align: right; border-bottom: 2px solid #e5e7eb; font-weight: 600;">Price</th>
                  <th style="padding: 12px; text-align: right; border-bottom: 2px solid #e5e7eb; font-weight: 600;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHTML}
              </tbody>
            </table>
          </div>

          <!-- Order Summary -->
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px;">
            <table style="width: 100%; font-size: 15px;">
              <tr>
                <td style="padding: 8px 0;">Subtotal:</td>
                <td style="padding: 8px 0; text-align: right;">$${subtotal.toFixed(
                  2
                )}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0;">Tax:</td>
                <td style="padding: 8px 0; text-align: right;">$${tax.toFixed(
                  2
                )}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; border-bottom: 2px solid #d1d5db;">Shipping:</td>
                <td style="padding: 8px 0; text-align: right; border-bottom: 2px solid #d1d5db;">$${shipping.toFixed(
                  2
                )}</td>
              </tr>
              <tr>
                <td style="padding: 12px 0; font-size: 20px; font-weight: bold;">Total:</td>
                <td style="padding: 12px 0; text-align: right; font-size: 24px; font-weight: bold; color: #2563eb;">$${total.toFixed(
                  2
                )}</td>
              </tr>
            </table>
          </div>

          <!-- Footer -->
          <div style="margin-top: 40px; padding-top: 20px; border-top: 2px solid #e5e7eb; text-align: center;">
            <p style="color: #6b7280; font-size: 14px; margin-bottom: 10px;">
              Need help with your order?<br>
              Contact us at <a href="mailto:${
                process.env.EMAIL_USER
              }" style="color: #2563eb; text-decoration: none;">${
    process.env.EMAIL_USER
  }</a>
            </p>
            <p style="color: #9ca3af; font-size: 12px; margin: 20px 0 0 0;">
              &copy; ${new Date().getFullYear()} Your Store. All rights reserved.
            </p>
          </div>

        </div>
      </body>
    </html>
  `;
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
