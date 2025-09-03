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
let cached: CachedConnection = (global as typeof globalThis & { mongoose?: CachedConnection }).mongoose || {
  conn: null,
  promise: null,
};

if (!cached) {
  cached = (global as typeof globalThis & { mongoose?: CachedConnection }).mongoose = { conn: null, promise: null };
}

/**
 * 数据库连接管理器
 * 提供单例模式的数据库连接，支持自动重连和连接池
 */
class DatabaseManager {
  private static instance: DatabaseManager;
  private connectionOptions: mongoose.ConnectOptions = {
    bufferCommands: false,
    maxPoolSize: 10, // 最大连接池大小
    serverSelectionTimeoutMS: 5000, // 服务器选择超时
    socketTimeoutMS: 45000, // Socket 超时
    maxIdleTimeMS: 30000, // 最大空闲时间
    retryWrites: true, // 重试写操作
    retryReads: true, // 重试读操作
  };

  private constructor() {
    this.setupEventHandlers();
  }

  public static getInstance(): DatabaseManager {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager();
    }
    return DatabaseManager.instance;
  }

  private setupEventHandlers(): void {
    // 连接成功
    mongoose.connection.on("connected", () => {
      console.log("✅ MongoDB 连接成功");
    });

    // 连接错误
    mongoose.connection.on("error", (error) => {
      console.error("❌ MongoDB 连接错误:", error);
    });

    // 连接断开
    mongoose.connection.on("disconnected", () => {
      console.warn("⚠️ MongoDB 连接已断开");
    });

    // 重新连接
    mongoose.connection.on("reconnected", () => {
      console.log("🔄 MongoDB 重新连接成功");
    });
  }

  public async connect(): Promise<typeof mongoose> {
    // 如果已经有连接，直接返回
    if (cached.conn && mongoose.connection.readyState === 1) {
      return cached.conn;
    }

    // 如果没有连接但有正在连接的 Promise，等待它完成
    if (!cached.promise) {
      cached.promise = mongoose.connect(MONGODB_URL!, this.connectionOptions).then((mongoose) => {
        return mongoose;
      });
    }

    try {
      cached.conn = await cached.promise;
      return cached.conn;
    } catch (error) {
      cached.promise = null;
      console.error("❌ MongoDB 连接失败:", error);
      throw new Error(`数据库连接失败: ${error instanceof Error ? error.message : "未知错误"}`);
    }
  }

  public async disconnect(): Promise<void> {
    if (cached.conn) {
      await mongoose.disconnect();
      cached.conn = null;
      cached.promise = null;
    }
  }

  public getConnectionState(): string {
    const states = {
      0: "disconnected",
      1: "connected",
      2: "connecting",
      3: "disconnecting",
    };
    return states[mongoose.connection.readyState as keyof typeof states] || "unknown";
  }

  public isConnected(): boolean {
    return mongoose.connection.readyState === 1;
  }
}

// 导出单例实例和便捷方法
const dbManager = DatabaseManager.getInstance();

/**
 * 连接到数据库
 * @returns MongoDB 连接实例
 */
async function connectToDatabase(): Promise<typeof mongoose> {
  return dbManager.connect();
}

/**
 * 断开数据库连接
 */
async function disconnectFromDatabase(): Promise<void> {
  return dbManager.disconnect();
}

/**
 * 获取数据库连接状态
 */
function getDatabaseConnectionState(): string {
  return dbManager.getConnectionState();
}

/**
 * 检查数据库是否已连接
 */
function isDatabaseConnected(): boolean {
  return dbManager.isConnected();
}

export default connectToDatabase;
export { disconnectFromDatabase, getDatabaseConnectionState, isDatabaseConnected };
