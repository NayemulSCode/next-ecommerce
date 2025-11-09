import { withAuth } from "@/lib/auth";
import { dbAdapter } from "@/lib/database-adapter";
import { NextResponse } from "next/server";

export const GET = withAuth(async (_req, user) => {
  const orders = await dbAdapter.getOrdersByUserId(user.id);
  return NextResponse.json({ orders });
});
