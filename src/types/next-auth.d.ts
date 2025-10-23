import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      // role: string;
      role: "ADMIN" | "CUSTOMER" | "STAFF";
    } & DefaultSession["user"];
  }

  interface User {
    // role: string;
    role: "ADMIN" | "CUSTOMER" | "STAFF";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    // role: string;
    role: "ADMIN" | "CUSTOMER" | "STAFF";
  }
}
