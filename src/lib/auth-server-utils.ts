import { auth, Session } from "@/lib/auth-server";
import { headers } from "next/headers";

// 检查 session 是否登录
function isSessionLogin(session: Session | null) {
  return !!session;
};

// 检查 session 是否管理员
function isSessionAdmin(session: Session | null) {
  return (isSessionLogin(session) && session?.session?.isAdmin) ?? false;
};

/**
 * 认证错误类型
 */
export type AuthErrorCode = "UNAUTHORIZED" | "FORBIDDEN";

/**
 * 自定义认证错误类
 */
export class AuthError extends Error {
  code: AuthErrorCode;

  constructor(message: string, code: AuthErrorCode) {
    super(message);
    this.name = "AuthError";
    this.code = code;
  }
}

/**
 * 获取服务端 Session
 * @returns Session 对象或 null
 */
export async function getServerSession() {
  try {
    return await auth.api.getSession({
      headers: await headers(),
    });
  } catch (error) {
    console.error("Failed to get server session:", error);
    return null;
  }
}

/**
 * 要求用户已登录
 * @throws {AuthError} 未登录时抛出 UNAUTHORIZED 错误
 * @returns Session 对象
 */
export async function requireAuth() {
  const session = await getServerSession();

  if (!isSessionLogin(session)) {
    throw new AuthError("未登录或登录已过期，请重新登录", "UNAUTHORIZED");
  }

  return session;
}

/**
 * 要求用户具有管理员权限
 * @throws {AuthError} 未登录时抛出 UNAUTHORIZED 错误，非管理员时抛出 FORBIDDEN 错误
 * @returns Session 对象
 */
export async function requireAdmin() {
  const session = await getServerSession();

  if (!isSessionLogin(session)) {
    throw new AuthError("未登录或登录已过期，请重新登录", "UNAUTHORIZED");
  }

  if (!isSessionAdmin(session)) {
    throw new AuthError("是管理员吗你就来", "FORBIDDEN");
  }

  return session;
}

