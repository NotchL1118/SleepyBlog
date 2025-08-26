import mongoose from "mongoose";

const MONGODB_URL = process.env.MONGODB_URL;

if (!MONGODB_URL) {
  throw new Error("请在环境变量中设置 MONGODB_URL");
}

interface CachedConnection {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// 使用全局变量来缓存连接，避免在开发环境中重复连接
let cached: CachedConnection = (global as typeof globalThis & { mongoose?: CachedConnection }).mongoose || { conn: null, promise: null };

if (!cached) {
  cached = (global as typeof globalThis & { mongoose?: CachedConnection }).mongoose = { conn: null, promise: null };
}

async function connectToDatabase(): Promise<typeof mongoose> {
  // 如果已经有连接，直接返回
  if (cached.conn) {
    return cached.conn;
  }

  // 如果没有连接但有正在连接的 Promise，等待它完成
  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URL!, opts).then((mongoose) => {
      console.log("✅ MongoDB 连接成功");
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    console.error("❌ MongoDB 连接失败:", e);
    throw e;
  }

  return cached.conn;
}

export default connectToDatabase;
