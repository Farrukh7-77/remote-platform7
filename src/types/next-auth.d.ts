import NextAuth from "next-auth";

declare module "next-auth" {
  interface User {
    provider?: string;
    hasPassword?: boolean;
  }
  
  interface Session {
    user?: User;
  }
}