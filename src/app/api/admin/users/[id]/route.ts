import { withRole } from "@/lib/auth";
import { dbAdapter } from "@/lib/database-adapter";
import { NextRequest, NextResponse } from "next/server";

export const GET = withRole(["ADMIN"], async (req: NextRequest, user: any) => {
  const id = req.url.split("/").pop() || "";

  try {
    const user = await dbAdapter.getUserById(id);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { password, ...userWithoutPassword } = user;
    return NextResponse.json({ user: userWithoutPassword });
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: 500 }
    );
  }
});
