"use client";

/* Auth Client Configuration
- 在客户端组件中使用
*/

import { createAuthClient } from "better-auth/react";
import { customSessionClient, lastLoginMethodClient } from "better-auth/client/plugins";
import type { auth } from "@/lib/auth-server";

export const authClient = createAuthClient({
  baseURL: typeof window !== "undefined" ? window.location.origin : process.env.NEXT_PUBLIC_APP_URL || "",
  plugins: [customSessionClient<typeof auth>(), lastLoginMethodClient()]
});

export const { signIn, signOut, useSession, getLastUsedLoginMethod } = authClient;