import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { customSession, lastLoginMethod } from "better-auth/plugins";
import { MongoClient } from "mongodb";
import { ServerConfig } from "@/config";

/* Auth Server Configuration
- Database: MongoDB
- Auth服务器配置,给api提供认证服务
*/

const MONGODB_URL = ServerConfig.mongodb.rootUrl;

if (!MONGODB_URL) {
  throw new Error("请在环境变量中设置 MONGODB_ROOT_URL");
}

const client = new MongoClient(MONGODB_URL);
const db = client.db();

// Parse trusted origins from config
const trustedOrigins = ServerConfig.betterAuth.trustedOrigins;

// Parse admin emails from config
const ADMIN_EMAILS = ServerConfig.betterAuth.adminEmails;


export const auth = betterAuth({
  database: mongodbAdapter(db),
  trustedOrigins,
  socialProviders: {
    github: {
      clientId: ServerConfig.betterAuth.githubClientId!,
      clientSecret: ServerConfig.betterAuth.githubClientSecret!,
    },
    google: {
      clientId: ServerConfig.betterAuth.googleClientId!,
      clientSecret: ServerConfig.betterAuth.googleClientSecret!,
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
