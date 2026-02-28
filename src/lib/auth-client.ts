"use client";

/* Auth Client Configuration
- 在客户端组件中使用
*/

import { createAuthClient } from "better-auth/react";
import { customSessionClient, lastLoginMethodClient } from "better-auth/client/plugins";
import type { auth } from "@/lib/auth-server";

export const authClient = createAuthClient({
  plugins: [customSessionClient<typeof auth>(), lastLoginMethodClient()]
});

export const { signIn, signOut, useSession, getLastUsedLoginMethod } = authClient;