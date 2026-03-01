export const ServerConfig = {
  mongodb: {
    rootUrl: process.env.MONGODB_ROOT_URL,
    url: process.env.MONGODB_URL,
  },
  ai: {
    baseAgentApiUrl: process.env.BASE_AGENT_API_URL,
    baseAgentApiKey: process.env.BASE_AGENT_API_KEY,
    baseAgentModel: process.env.BASE_AGENT_MODEL,
  },
  // 火山方舟，图片生成api
  ark: {
    arkApiUrl: process.env.ARK_API_URL,
    arkApiKey: process.env.ARK_API_KEY,
    arkModelPointer: process.env.ARK_MODEL_POINTER,
  },
  qiniu: {
    accessKey: process.env.QINIU_AK,
    secretKey: process.env.QINIU_SK,
    bucket: process.env.QINIU_BUCKET,
    domain: process.env.QINIU_DOMAIN,
  },
  betterAuth: {
    githubClientId: process.env.GITHUB_CLIENT_ID,
    githubClientSecret: process.env.GITHUB_CLIENT_SECRET,
    googleClientId: process.env.GOOGLE_CLIENT_ID,
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
    baseURL: process.env.BETTER_AUTH_URL,
    trustedOrigins: process.env.TRUSTED_ORIGINS?.split(",") || [],
    adminEmails: process.env.ADMIN_EMAILS?.split(",") || [],
  },
  // 高德地图
  amap: {
    apiKey: process.env.NEXT_PUBLIC_AMAP_API_KEY,
    securityCode: process.env.NEXT_PUBLIC_AMAP_SECURITY_CODE,
  },

  get isDevelopment() {
    return process.env.NODE_ENV === "development";
  },

  get isProduction() {
    return process.env.NODE_ENV === "production";
  }
}