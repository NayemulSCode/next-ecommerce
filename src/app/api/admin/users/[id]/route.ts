// // app/api/admin/users/[id]/route.ts
// import { withRole } from "@/lib/auth";
// import { dbAdapter } from "@/lib/database-adapter";
// import { NextRequest, NextResponse } from "next/server"; // Added NextResponse import
// import { z } from "zod";

// const updateUserSchema = z.object({
//   name: z.string().min(2).optional(),
//   phone: z.string().optional(),
//   role: z.enum(["ADMIN", "CUSTOMER", "STAFF"]).optional(),
//   isActive: z.boolean().optional(),
// });

// export async function GET(
//   req: NextRequest,
//   { params }: { params: { id: string } }
// ) {
//   const id = params?.id;
//   console.log("GET id:", id);
//   return withRole(["ADMIN"], async (_req: NextRequest, currentUser: any) => {
//     try {
//       const user = await dbAdapter.getUserById(id);

//       if (!user) {
//         return NextResponse.json({ error: "User not found" }, { status: 404 });
//       }

//       const { password, ...userWithoutPassword } = user;

//       return NextResponse.json({ user: userWithoutPassword });
//     } catch (error) {
//       console.error("Error fetching user:", error);
//       return NextResponse.json(
//         { error: "Failed to fetch user" },
//         { status: 500 }
//       );
//     }
//   })(req);
// }
