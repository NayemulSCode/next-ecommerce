import { authOptions } from "@/lib/auth/config";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

// GET - 获取单个产品
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const product = await db.product.findUnique({
      where: { id: params.id },
      include: {
        category: {
          select: {
            name: true,
            slug: true,
          },
        },
      },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // 转换响应数据
    const transformedProduct = {
      ...product,
      images: product.images ? JSON.parse(product.images) : [],
      tags: product.tags ? JSON.parse(product.tags) : [],
    };

    return NextResponse.json(transformedProduct);
  } catch (error) {
    console.error("Get product error:", error);
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 }
    );
  }
}

// PUT - 更新产品 (仅管理员)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    // 检查权限
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized. Admin access required." },
        { status: 403 }
      );
    }

    const body = await request.json();

    // 检查产品是否存在
    const existingProduct = await db.product.findUnique({
      where: { id: params.id },
    });

    if (!existingProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // 如果更新 SKU，检查是否与其他产品冲突
    if (body.sku && body.sku !== existingProduct.sku) {
      const skuConflict = await db.product.findUnique({
        where: { sku: body.sku },
      });

      if (skuConflict) {
        return NextResponse.json(
          { error: "Product with this SKU already exists" },
          { status: 409 }
        );
      }
    }

    // 如果更新 Slug，检查是否与其他产品冲突
    if (body.slug && body.slug !== existingProduct.slug) {
      const slugConflict = await db.product.findUnique({
        where: { slug: body.slug },
      });

      if (slugConflict) {
        return NextResponse.json(
          { error: "Product with this slug already exists" },
          { status: 409 }
        );
      }
    }

    // 更新产品
    const updatedProduct = await db.product.update({
      where: { id: params.id },
      data: {
        ...body,
        images: JSON.stringify(body.images || []),
        tags: JSON.stringify(body.tags || []),
        price: body.price ? parseFloat(body.price) : existingProduct.price,
        comparePrice: body.comparePrice ? parseFloat(body.comparePrice) : null,
        cost: body.cost ? parseFloat(body.cost) : null,
        quantity: body.quantity
          ? parseInt(body.quantity)
          : existingProduct.quantity,
        weight: body.weight ? parseFloat(body.weight) : null,
      },
      include: {
        category: {
          select: {
            name: true,
            slug: true,
          },
        },
      },
    });

    // 转换响应数据
    const transformedProduct = {
      ...updatedProduct,
      images: updatedProduct.images ? JSON.parse(updatedProduct.images) : [],
      tags: updatedProduct.tags ? JSON.parse(updatedProduct.tags) : [],
    };

    return NextResponse.json(transformedProduct);
  } catch (error) {
    console.error("Update product error:", error);
    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 }
    );
  }
}

// DELETE - 删除产品 (仅管理员)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    // 检查权限
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized. Admin access required." },
        { status: 403 }
      );
    }

    // 检查产品是否存在
    const existingProduct = await db.product.findUnique({
      where: { id: params.id },
      include: {
        orderItems: true,
        cartItems: true,
      },
    });

    if (!existingProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // 检查是否有相关的订单或购物车项目
    if (existingProduct.orderItems.length > 0) {
      return NextResponse.json(
        {
          error:
            "Cannot delete product with existing orders. Consider deactivating it instead.",
        },
        { status: 400 }
      );
    }

    // 删除产品
    await db.product.delete({
      where: { id: params.id },
    });

    return NextResponse.json(
      { message: "Product deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Delete product error:", error);
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 }
    );
  }
}
