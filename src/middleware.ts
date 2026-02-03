import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth-server";

export async function middleware(request: NextRequest) {
  // 保护 dashboard 路由
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const hasLogin = !!session;
  const isAdmin = session?.session.isAdmin;

  // 检查 session 和管理员权限
  if (!hasLogin) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // 到这一步，一般来说是管理员
  if (!isAdmin) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  runtime: "nodejs", // 必需：auth.api 调用需要 Node.js runtime
  matcher: ["/dashboard/:path*"], // 匹配所有 dashboard 路由
};
