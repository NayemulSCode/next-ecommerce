// app/api/products/route.ts
import { authOptions } from "@/lib/auth/config";
import { dbAdapter } from "@/lib/database-adapter";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

// ✅ GET: Fetch products with filters, search, pagination
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const category = searchParams.get("category");
    const featured = searchParams.get("featured");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const skip = (page - 1) * limit;
    const includeInactive = searchParams.get("includeInactive") === "true";

    // 🧠 Build filter object
    const filter: any = {};
    if (!includeInactive) filter.status = "ACTIVE";
    if (featured === "true") filter.featured = true;

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { shortDesc: { $regex: search, $options: "i" } },
      ];
    }

    // If category is provided, find category by slug
    if (category) {
      const categoryDoc = await dbAdapter.getCategoryBySlug(category);
      if (categoryDoc) {
        filter.categoryId = categoryDoc.id;
      } else {
        return NextResponse.json({
          products: [],
          pagination: { page, limit, total: 0, pages: 0 },
        });
      }
    }

    // 🧩 Fetch products via adapter
    const products = await dbAdapter.getProducts(filter, {
      sort: { createdAt: -1 },
      skip,
      limit,
    });

    // Get total for pagination
    const totalProducts = (await dbAdapter.getProducts(filter)).length;
    const pages = Math.ceil(totalProducts / limit);

    return NextResponse.json({
      products,
      pagination: { page, limit, total: totalProducts, pages },
    });
  } catch (error) {
    console.error("Products API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

// ✅ POST: Create new product (Admin only)
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized. Admin access required." },
        { status: 403 }
      );
    }

    const body = await req.json();
    console.log("🚀 ~ POST ~ body:", body);

    // Basic validation
    const requiredFields = ["name", "slug", "sku", "price", "categoryId"];
    const missing = requiredFields.filter((f) => !body[f]);
    if (missing.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missing.join(", ")}` },
        { status: 400 }
      );
    }

    // Check duplicate SKU or slug
    const existingBySku = await dbAdapter.getProducts({ sku: body.sku });
    if (existingBySku.length > 0) {
      return NextResponse.json(
        { error: "Product with this SKU already exists" },
        { status: 409 }
      );
    }

    const existingBySlug = await dbAdapter.getProductBySlug(body.slug);
    if (existingBySlug) {
      return NextResponse.json(
        { error: "Product with this slug already exists" },
        { status: 409 }
      );
    }

    // Create product
    const product = await dbAdapter.createProduct({
      ...body,
      price: parseFloat(body.price),
      comparePrice: body.comparePrice
        ? parseFloat(body.comparePrice)
        : undefined,
      cost: body.cost ? parseFloat(body.cost) : undefined,
      quantity: parseInt(body.quantity) || 0,
      status: body.status || "ACTIVE",
      featured: body.featured || false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error("Create product error:", error);
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}
