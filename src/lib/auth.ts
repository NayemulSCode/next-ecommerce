import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
// For API routes
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "./auth/config";

export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  return session?.user;
}

export async function requireAuth() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}

export async function requireRole(
  roles: Array<"ADMIN" | "CUSTOMER" | "STAFF">
) {
  const user = await requireAuth();

  if (!roles.includes(user.role)) {
    redirect("/");
  }

  return user;
}

export async function requireAdmin() {
  return requireRole(["ADMIN"]);
}

export async function withAuth(
  handler: (req: NextRequest, user: any) => Promise<NextResponse>
) {
  return async (req: NextRequest) => {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return handler(req, session.user);
  };
}

export async function withRole(
  roles: Array<"ADMIN" | "CUSTOMER" | "STAFF">,
  handler: (req: NextRequest, user: any) => Promise<NextResponse>
) {
  return async (req: NextRequest) => {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!roles.includes(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return handler(req, session.user);
  };
}
