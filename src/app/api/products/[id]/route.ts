// app/api/products/[id]/route.ts
import { authOptions } from "@/lib/auth/config";
import { dbAdapter } from "@/lib/database-adapter";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

// ✅ GET: Fetch single product by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;
    const product = await dbAdapter.getProductById(id);

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error("Get product error:", error);
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 }
    );
  }
}

// ✅ PUT: Update product by ID (Admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    // Check permissions
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized. Admin access required." },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Check if product exists
    const existingProduct = await dbAdapter.getProductById(id);

    if (!existingProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // If updating SKU, check for conflicts with other products
    if (body.sku && body.sku !== existingProduct.sku) {
      const skuConflict = await dbAdapter.getProducts({ sku: body.sku });
      if (skuConflict.length > 0 && skuConflict[0].id !== id) {
        return NextResponse.json(
          { error: "Product with this SKU already exists" },
          { status: 409 }
        );
      }
    }

    // If updating Slug, check for conflicts with other products
    if (body.slug && body.slug !== existingProduct.slug) {
      const slugConflict = await dbAdapter.getProductBySlug(body.slug);
      if (slugConflict && slugConflict.id !== id) {
        return NextResponse.json(
          { error: "Product with this slug already exists" },
          { status: 409 }
        );
      }
    }

    // Prepare update data
    const updateData: any = {
      ...body,
      price: body.price ? parseFloat(body.price) : existingProduct.price,
      comparePrice: body.comparePrice
        ? parseFloat(body.comparePrice)
        : existingProduct.comparePrice,
      cost: body.cost ? parseFloat(body.cost) : existingProduct.cost,
      quantity:
        body.quantity !== undefined
          ? parseInt(body.quantity)
          : existingProduct.quantity,
      weight: body.weight ? parseFloat(body.weight) : existingProduct.weight,
      updatedAt: new Date(),
    };

    // Update product
    const updatedProduct = await dbAdapter.updateProduct(id, updateData);

    if (!updatedProduct) {
      return NextResponse.json(
        { error: "Failed to update product" },
        { status: 500 }
      );
    }

    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error("Update product error:", error);
    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 }
    );
  }
}

// ✅ DELETE: Delete product by ID (Admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    // Check permissions
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized. Admin access required." },
        { status: 403 }
      );
    }

    // Check if product exists
    const existingProduct = await dbAdapter.getProductById(id);

    if (!existingProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Check if product has related orders or cart items
    const hasOrders = await dbAdapter.checkProductHasOrders(id);

    if (hasOrders) {
      return NextResponse.json(
        {
          error:
            "Cannot delete product with existing orders. Consider deactivating it instead.",
        },
        { status: 400 }
      );
    }

    // Delete product
    const deleted = await dbAdapter.deleteProduct(id);

    if (!deleted) {
      return NextResponse.json(
        { error: "Failed to delete product" },
        { status: 500 }
      );
    }

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
