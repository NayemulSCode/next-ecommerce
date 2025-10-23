// app/api/admin/users/route.ts
import { withRole } from "@/lib/auth";
import { dbAdapter } from "@/lib/database-adapter";
import { NextRequest, NextResponse } from "next/server";

export const GET = withRole(["ADMIN"], async (req: NextRequest, user: any) => {
  try {
    const { searchParams } = new URL(req.url);
    const role = searchParams.get("role");
    const isActive = searchParams.get("isActive");
    const search = searchParams.get("search");

    const filter: any = {};

    if (role) {
      filter.role = role;
    }

    if (isActive !== null) {
      filter.isActive = isActive === "true";
    }

    // For MongoDB search
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    // Note: You'll need to add a getUsers method to your adapter
    const users = await dbAdapter.getProducts(filter); // Replace with getUsers

    // Remove passwords from response
    const usersWithoutPasswords = users.map(({ password, ...user }) => user);

    return NextResponse.json({ users: usersWithoutPasswords });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
});
