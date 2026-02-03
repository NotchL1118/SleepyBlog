import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { customSession, lastLoginMethod } from "better-auth/plugins";
import { MongoClient } from "mongodb";

/* Auth Server Configuration
- Database: MongoDB
- Auth服务器配置,给api提供认证服务
*/

const MONGODB_URL = process.env.MONGODB_ROOT_URL as string;

if (!MONGODB_URL) {
  throw new Error("请在环境变量中设置 MONGODB_ROOT_URL");
}

const client = new MongoClient(MONGODB_URL);
const db = client.db();

// Parse trusted origins from environment variable (comma-separated)
const trustedOrigins = (process.env.TRUSTED_ORIGINS || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

// Parse admin emails from environment variable (comma-separated)
const ADMIN_EMAILS = process.env.ADMIN_EMAILS?.split(",")?.map((e) => e.trim())?.filter(Boolean) || [];


export const auth = betterAuth({
  database: mongodbAdapter(db),
  trustedOrigins,
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    },
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
  session: {
    cookieCache: { // 启用cookie缓存
      enabled: true,
      maxAge: 24 * 60 * 60, // 24 hours
    },
  },
  plugins: [
    customSession(async ({ user, session }) => {
      return {
        user,
        session: {
          ...session,
          isAdmin: ADMIN_EMAILS?.length > 0 && ADMIN_EMAILS.includes(user.email)
        }
      }
    }),
    lastLoginMethod()
  ]
});

export type Session = typeof auth.$Infer.Session;
