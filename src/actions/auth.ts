"use server";
import ServerActionBuilder from "@/lib/server-action";
import type { ServerActionResponse } from "@/types/server-actions-response";

/**
 * 验证管理员登录
 */
export async function validateAdminLogin(
  username: string,
  password: string
): Promise<ServerActionResponse<{ isValid: boolean }>> {
  return ServerActionBuilder.execute(
    async () => {
      // 从环境变量获取管理员凭据
      const adminUsername = process.env.ADMIN_USERNAME;
      const adminPassword = process.env.ADMIN_PASSWORD;

      if (!adminUsername || !adminPassword) {
        throw new Error("服务器配置错误：未设置管理员凭据");
      }

      // 验证凭据
      const isValid = username === adminUsername && password === adminPassword;

      if (!isValid) {
        throw new Error("用户名或密码错误");
      }

      return { isValid };
    },
    {
      successMessage: "登录成功",
      errorMessage: "登录失败",
      onError: (error) => console.error("Server Action - 登录失败:", error),
    }
  );
}
