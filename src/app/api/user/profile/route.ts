import { withAuth } from "@/lib/auth";
import { dbAdapter } from "@/lib/database-adapter";
import { NextResponse } from "next/server";

export const GET = withAuth(async (_req, user) => {
  const dbUser = await dbAdapter.getUserById(user.id);
  if (!dbUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
  const { password, ...safeUser } = dbUser;
  return NextResponse.json(safeUser);
});

export const PUT = withAuth(async (req, user) => {
  const data = await req.json();

  const updatedUser = await dbAdapter.updateUser(user.id, {
    name: data.name,
    phone: data.phone,
    email: data.email,
  });

  const { password, ...safeUser } = updatedUser;
  return NextResponse.json(safeUser);
});
