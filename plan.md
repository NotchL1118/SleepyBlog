# 说说功能实现文档

## 1. 概述

### 1.1 功能描述
实现一个类似朋友圈的"说说"功能，支持发布动态、点赞、评论（预留）、MDX内容渲染、无限滚动懒加载。

### 1.2 技术选型
- **前端**: Next.js 15 + React 19 (App Router)
- **数据层**: MongoDB + Mongoose
- **类型系统**: TypeScript
- **渲染**: MDX (next-mdx-remote-client)
- **架构**: Server Actions + Repository Pattern

### 1.3 方案选择
**采用独立 Thought 模型**，而非复用 Article 模型，原因：
- 说说与文章语义差异大，Article 的 title/excerpt/tags/status/slug 等字段对说说无意义
- 独立模型使数据结构更清晰，查询/表单更简单
- 未来扩展（评论、置顶、心情标签等）更灵活
- 复用现有组件与架构模式，而非复用字段

## 2. 数据模型设计

### 2.1 数据库模型 (`src/models/Thought.ts`)
```typescript
interface IThoughtEntity {
  _id: Types.ObjectId;
  content: string; // MDX内容
  likeCount: number; // 点赞数，默认0
  author: {
    name: string; // 作者姓名
    avatarUrl: string; // 头像URL
  };
  status: "published" | "draft"; // 状态
  createdAt: Date;
  updatedAt: Date;
}

// 评论结构预留
interface IComment {
  userId?: string; // 预留，未来接入用户系统
  name: string; // 评论者姓名
  avatarUrl?: string; // 评论者头像
  content: string; // 评论内容
  createdAt: Date;
}
```

**索引设计**:
```typescript
// 1. 基础索引
- `createdAt` 倒序索引（用于时间排序分页）
- `_id` 唯一索引（自动创建）

// 2. 复合索引（关键优化）
- `status + createdAt` 复合索引
  * 用于：状态过滤 + 时间排序的分页查询
  * 示例：{ status: "published", createdAt: { $lt: cursor } }

// 3. 作者相关索引（未来扩展）
- `author.name + createdAt` 复合索引
  * 用于：按作者筛选说说（如果需要）
  * 当前未实现，但为未来扩展预留

// 4. 点赞相关索引（未来扩展）
- `likeCount + createdAt` 复合索引
  * 用于：热门说说排序（如果需要）
  * 当前未实现，但为未来扩展预留
```

**索引创建脚本** (`src/lib/create-indexes.ts`):
```typescript
import mongoose from "mongoose";

export async function createThoughtIndexes() {
  const db = mongoose.connection.db;
  const collection = db.collection("thoughts");

  await collection.createIndex({ createdAt: -1 });
  await collection.createIndex({ status: 1, createdAt: -1 });
  await collection.createIndex({ "author.name": 1, createdAt: -1 });
  await collection.createIndex({ likeCount: -1, createdAt: -1 });
}

// 在应用启动时调用
// 或者创建独立的脚本：npm run create-indexes
```

### 2.2 TypeScript 类型定义 (`src/types/thought.ts`)
```typescript
// 说说 DTO（数据传输对象）- 用于创建/更新
export interface IThoughtCreateInput {
  content: string;
  status: "published" | "draft";
  author: {
    name: string;
    avatarUrl: string;
  };
}

export interface IThoughtUpdateInput {
  content?: string;
  status?: "published" | "draft";
}

// 说说 DTO（数据传输对象）- 用于读取
export interface IThoughtDTO {
  _id: string; // 必填，非空
  content: string;
  likeCount: number;
  author: {
    name: string;
    avatarUrl: string;
  };
  status: "published" | "draft";
  createdAt: string;
  updatedAt: string;
}

// 评论类型
export interface IThoughtComment {
  userId?: string;
  name: string;
  avatarUrl?: string;
  content: string;
  createdAt: string | Date;
}

// 分页参数
export interface PaginationParams {
  page?: number;
  limit?: number;
  cursor?: string; // cursor 游标分页
}

// 分页响应
export interface PaginatedThoughts {
  items: IThoughtDTO[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
    nextCursor?: string; // cursor 游标
  };
}
```

## 3. 目录结构

### 3.1 新增文件列表
```
src/
├── models/
│   └── Thought.ts                    # 说说数据模型
├── types/
│   └── thought.ts                    # 说说类型定义
├── repositories/
│   └── thought-repository.ts        # 说说仓储层
├── actions/
│   └── thoughts.ts                   # 说说相关 Server Actions
├── app/
│   ├── (app)/
│   │   └── thoughts/
│   │       ├── loading.tsx           # 页面加载动画
│   │       ├── page.tsx              # 说说列表页面
│   │       └── components/
│   │           ├── ThoughtCard.tsx          # 说说卡片组件
│   │           ├── ThoughtList.tsx          # 说说列表组件
│   │           ├── InfiniteThoughtList.tsx # 无限滚动组件
│   │           ├── LikeButton.tsx          # 点赞按钮
│   │           ├── CommentSection.tsx      # 评论区域（预留）
│   │           └── SkeletonLoader.tsx      # 骨架屏加载器
│   └── (dashboard)/
│       └── dashboard/
│           └── thoughts/
│               ├── page.tsx          # 说说管理页面
│               ├── new/
│               │   └── page.tsx      # 新建说说页面
│               └── [id]/
│                   └── page.tsx     # 编辑说说页面
```

## 4. 核心功能实现

### 4.1 数据层 (Repository Pattern)

#### 4.1.1 说说仓储层 (`src/repositories/thought-repository.ts`)
```typescript
import { withDatabaseConnection } from "@/lib/decorators/database";
import ThoughtModel from "@/models/Thought";
import type { IThoughtDTO, IThoughtCreateInput, IThoughtUpdateInput } from "@/types/thought";
import type { Types } from "mongoose";

// 序列化 Mongoose 文档为 DTO
function serializeThought(doc: any): IThoughtDTO {
  return {
    _id: doc._id.toString(),
    content: doc.content,
    likeCount: doc.likeCount,
    author: doc.author,
    status: doc.status,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}

// 生成 cursor（基于 createdAt 和 _id）
function generateCursor(doc: any): string {
  const createdAt = new Date(doc.createdAt).getTime();
  const _id = doc._id.toString();
  return Buffer.from(`${createdAt}-${_id}`).toString("base64");
}

// 解析 cursor
function parseCursor(cursor: string): { createdAt: Date; _id: Types.ObjectId } {
  const decoded = Buffer.from(cursor, "base64").toString("utf-8");
  const [createdAt, _id] = decoded.split("-");
  return {
    createdAt: new Date(parseInt(createdAt, 10)),
    _id: new Types.ObjectId(_id)
  };
}

class ThoughtRepository {
  /**
   * 获取已发布的说说列表（cursor 分页）
   * 公开 API，仅返回已发布内容
   */
  @withDatabaseConnection()
  async getPublishedList(params?: {
    page?: number;
    limit?: number;
    cursor?: string;
  }): Promise<{
    items: IThoughtDTO[];
    hasMore: boolean;
    total: number;
    totalPages: number;
    nextCursor?: string;
  }> {
    const limit = Math.min(params?.limit || 10, 50); // 限制最大返回数量
    const cursor = params?.cursor;

    let query: any = { status: "published" };

    // 使用 cursor 分页，避免 offset 的性能问题
    if (cursor) {
      const { createdAt, _id } = parseCursor(cursor);
      // 查询 createdAt < cursor.createdAt 或 (createdAt === cursor.createdAt 且 _id < cursor._id) 的数据
      query.$or = [
        { createdAt: { $lt: createdAt } },
        { createdAt: createdAt, _id: { $lt: _id } }
      ];
    }

    const items = await ThoughtModel
      .find(query)
      .sort({ createdAt: -1, _id: -1 }) // 复合排序确保稳定性
      .limit(limit + 1)
      .lean();

    const hasMore = items.length > limit;
    if (hasMore) items.pop();

    const serializedItems = items.map(serializeThought);

    const nextCursor = hasMore && serializedItems.length > 0
      ? generateCursor(serializedItems[serializedItems.length - 1])
      : undefined;

    // 获取总数（用于统计，可选）
    const total = await ThoughtModel.countDocuments({ status: "published" });
    const totalPages = Math.ceil(total / limit);

    return {
      items: serializedItems,
      hasMore,
      total,
      totalPages,
      nextCursor
    };
  }

  /**
   * 获取已发布的说说（仅单个，用于公开页面）
   */
  @withDatabaseConnection()
  async getPublishedById(id: string): Promise<IThoughtDTO | null> {
    const doc = await ThoughtModel.findOne({
      _id: id,
      status: "published"
    }).lean();

    if (!doc) return null;
    return serializeThought(doc);
  }

  /**
   * 获取所有说说（包括草稿）- 后台专用
   */
  @withDatabaseConnection()
  async getList(params?: {
    page?: number;
    limit?: number;
    status?: "published" | "draft" | "all";
  }): Promise<{ items: IThoughtDTO[]; hasMore: boolean; total: number }> {
    const page = params?.page || 1;
    const limit = params?.limit || 10;
    const skip = (page - 1) * limit;

    const filter = params?.status && params.status !== "all"
      ? { status: params.status }
      : {};

    const [items, total] = await Promise.all([
      ThoughtModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit + 1)
        .lean(),
      ThoughtModel.countDocuments(filter)
    ]);

    const hasMore = items.length > limit;
    if (hasMore) items.pop();

    return {
      items: items.map(serializeThought),
      hasMore,
      total
    };
  }

  /**
   * 根据 ID 获取说说（所有状态）- 后台专用
   */
  @withDatabaseConnection()
  async getById(id: string): Promise<IThoughtDTO | null> {
    const doc = await ThoughtModel.findById(id).lean();
    if (!doc) return null;
    return serializeThought(doc);
  }

  /**
   * 创建说说
   */
  @withDatabaseConnection()
  async create(data: IThoughtCreateInput): Promise<IThoughtDTO> {
    const doc = await ThoughtModel.create({
      ...data,
      likeCount: 0
    });

    return serializeThought(doc);
  }

  /**
   * 更新说说
   */
  @withDatabaseConnection()
  async update(id: string, data: IThoughtUpdateInput): Promise<IThoughtDTO | null> {
    const doc = await ThoughtModel.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true }
    ).lean();

    if (!doc) return null;
    return serializeThought(doc);
  }

  /**
   * 删除说说
   */
  @withDatabaseConnection()
  async delete(id: string): Promise<boolean> {
    const result = await ThoughtModel.findByIdAndDelete(id);
    return !!result;
  }

  /**
   * 点赞数自增
   */
  @withDatabaseConnection()
  async incrementLike(id: string): Promise<boolean> {
    const result = await ThoughtModel.findOneAndUpdate(
      { _id: id, status: "published" }, // 仅对已发布的点赞
      { $inc: { likeCount: 1 } },
      { new: true }
    );
    return !!result;
  }
}

export default new ThoughtRepository();
```

### 4.2 Server Actions (`src/actions/thoughts.ts`)

```typescript
"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import ServerActionBuilder from "@/lib/server-action";
import ThoughtRepository from "@/repositories/thought-repository";
import type { IThought } from "@/types/thought";
import type { PaginatedData } from "@/types/server-actions-response";

// 输入验证 Schema
const createThoughtSchema = z.object({
  content: z.string().min(1, "内容不能为空"),
  status: z.enum(["published", "draft"])
});

const updateThoughtSchema = z.object({
  content: z.string().min(1, "内容不能为空").optional(),
  status: z.enum(["published", "draft"]).optional()
});

// TODO: 接入用户系统后，替换为实际的身份验证
async function getCurrentUser() {
  // 临时返回管理员用户
  return {
    id: "admin",
    name: "Lsy",
    avatarUrl: "https://pic.lsyfighting.cn/electronic.jpg"
  };
}

// TODO: 点赞防刷 - 基于 IP 或用户
const likeRateLimit = new Map<string, number>();

/**
 * 获取说说列表（分页）
 * 注意：仅返回已发布的说说
 */
export async function getThoughtList(params?: {
  page?: number;
  limit?: number;
  cursor?: string; // cursor 游标分页
}): Promise<ServerActionResponse<PaginatedData<IThought>>> {
  return ServerActionBuilder.execute(async () => {
    const result = await ThoughtRepository.getPublishedList({
      page: params?.page,
      limit: params?.limit,
      cursor: params?.cursor
    });

    return {
      items: result.items,
      pagination: {
        page: params?.page || 1,
        limit: params?.limit || 10,
        total: result.total,
        totalPages: result.totalPages,
        hasMore: result.hasMore,
        nextCursor: result.nextCursor
      }
    };
  }, {
    successMessage: "获取说说列表成功",
    errorMessage: "获取说说列表失败"
  });
}

/**
 * 获取单个说说（仅已发布）
 */
export async function getThoughtById(id: string): Promise<ServerActionResponse<IThought | null>> {
  return ServerActionBuilder.execute(async () => {
    const thought = await ThoughtRepository.getPublishedById(id);
    return thought;
  }, {
    successMessage: "获取说说成功",
    errorMessage: "获取说说失败"
  });
}

/**
 * 创建说说（需要身份验证）
 */
export async function createThought(
  rawData: unknown
): Promise<ServerActionResponse<IThought>> {
  return ServerActionBuilder.execute(async () => {
    // 身份验证
    const user = await getCurrentUser();
    if (!user) {
      throw new Error("未登录");
    }

    // 输入验证
    const data = createThoughtSchema.parse(rawData);

    // 服务器端设置作者信息，防止客户端篡改
    const thought = await ThoughtRepository.create({
      content: data.content,
      author: {
        name: user.name,
        avatarUrl: user.avatarUrl
      },
      status: data.status
    });

    // 重新验证页面
    revalidatePath("/thoughts");
    revalidatePath("/dashboard/thoughts");

    return thought;
  }, {
    successMessage: "说说创建成功",
    errorMessage: "说说创建失败"
  });
}

/**
 * 更新说说（需要身份验证）
 */
export async function updateThought(
  id: string,
  rawData: unknown
): Promise<ServerActionResponse<IThought | null>> {
  return ServerActionBuilder.execute(async () => {
    // 身份验证
    const user = await getCurrentUser();
    if (!user) {
      throw new Error("未登录");
    }

    // 输入验证
    const data = updateThoughtSchema.parse(rawData);

    const thought = await ThoughtRepository.update(id, data);

    // 重新验证页面
    revalidatePath("/thoughts");
    revalidatePath("/dashboard/thoughts");

    return thought;
  }, {
    successMessage: "说说更新成功",
    errorMessage: "说说更新失败"
  });
}

/**
 * 删除说说（需要身份验证）
 */
export async function deleteThought(id: string): Promise<ServerActionResponse<boolean>> {
  return ServerActionBuilder.execute(async () => {
    // 身份验证
    const user = await getCurrentUser();
    if (!user) {
      throw new Error("未登录");
    }

    const result = await ThoughtRepository.delete(id);

    // 重新验证页面
    revalidatePath("/thoughts");
    revalidatePath("/dashboard/thoughts");

    return result;
  }, {
    successMessage: "说说删除成功",
    errorMessage: "说说删除失败"
  });
}

/**
 * 点赞说说（防刷）
 */
export async function likeThought(id: string): Promise<ServerActionResponse<{ likeCount: number }>> {
  return ServerActionBuilder.execute(async () => {
    // TODO: 接入用户系统后，使用真实用户ID
    const clientId = "anonymous";
    const now = Date.now();
    const lastLike = likeRateLimit.get(clientId);

    // 防刷：5秒内不能重复点赞
    if (lastLike && now - lastLike < 5000) {
      throw new Error("操作过于频繁，请稍后再试");
    }

    likeRateLimit.set(clientId, now);

    await ThoughtRepository.incrementLike(id);
    const thought = await ThoughtRepository.getPublishedById(id);

    if (!thought) {
      throw new Error("说说不存在");
    }

    return { likeCount: thought.likeCount };
  }, {
    successMessage: "点赞成功",
    errorMessage: "点赞失败"
  });
}

/**
 * 后台专用：获取所有说说（包括草稿）
 */
export async function getAllThoughts(params?: {
  page?: number;
  limit?: number;
  status?: "published" | "draft" | "all";
}): Promise<ServerActionResponse<PaginatedData<IThought>>> {
  return ServerActionBuilder.execute(async () => {
    // 身份验证
    const user = await getCurrentUser();
    if (!user) {
      throw new Error("未登录");
    }

    const result = await ThoughtRepository.getList({
      page: params?.page,
      limit: params?.limit,
      status: params?.status || "all"
    });

    return {
      items: result.items,
      pagination: {
        page: params?.page || 1,
        limit: params?.limit || 10,
        total: result.total,
        totalPages: Math.ceil(result.total / (params?.limit || 10)),
        hasMore: result.hasMore
      }
    };
  }, {
    successMessage: "获取说说列表成功",
    errorMessage: "获取说说列表失败"
  });
}
```

### 4.3 前台页面

#### 4.3.1 说说列表页面 (`src/app/(app)/thoughts/page.tsx`)
```typescript
import { Suspense } from "react";
import ThoughtList from "./components/ThoughtList";
import SkeletonLoader from "./components/SkeletonLoader";

export const metadata = {
  title: "生活碎碎念",
  description: "分享生活中的点点滴滴"
};

export default function ThoughtsPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto max-w-2xl px-4 py-8">
        <h1 className="mb-8 text-3xl font-bold text-gray-900 dark:text-gray-100">
          生活碎碎念
        </h1>

        <Suspense fallback={<SkeletonLoader />}>
          <ThoughtList pageSize={10} />
        </Suspense>
      </div>
    </div>
  );
}
```

#### 4.3.2 加载动画 (`src/app/(app)/thoughts/loading.tsx`)
```typescript
export default function Loading() {
  return (
    <div className="flex h-64 items-center justify-center">
      <div className="flex items-center space-x-3">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600 dark:border-gray-600 dark:border-t-indigo-400"></div>
        <span className="text-gray-600 dark:text-gray-400">加载中...</span>
      </div>
    </div>
  );
}
```

#### 4.3.2 说说列表组件 (`src/app/(app)/thoughts/components/ThoughtList.tsx`)
```typescript
import { getThoughtList } from "@/actions/thoughts";
import type { IThoughtDTO } from "@/types/thought";
import ThoughtCard from "./ThoughtCard";
import InfiniteThoughtScroll from "./InfiniteThoughtScroll";

interface Props {
  pageSize: number;
}

export default async function ThoughtList({ pageSize }: Props) {
  // 服务端获取初始数据
  const result = await getThoughtList({ limit: pageSize });

  if (!result.success) {
    return (
      <div className="py-12 text-center">
        <p className="text-red-600">加载失败，请刷新页面重试</p>
      </div>
    );
  }

  const initialThoughts = result.data.items;
  const initialCursor = result.data.pagination.nextCursor;

  return (
    <div className="space-y-6">
      {initialThoughts.length > 0 ? (
        <>
          {initialThoughts.map((thought: IThoughtDTO) => (
            <ThoughtCard key={thought._id} thought={thought} />
          ))}

          {/* 无限滚动组件 - 仅在客户端运行 */}
          <InfiniteThoughtScroll
            initialCursor={initialCursor}
            pageSize={pageSize}
          />
        </>
      ) : (
        <div className="py-12 text-center">
          <p className="text-gray-500 dark:text-gray-400">暂无说说</p>
        </div>
      )}
    </div>
  );
}
```

#### 4.3.3 无限滚动组件 (`src/app/(app)/thoughts/components/InfiniteThoughtScroll.tsx`)
```typescript
"use client";

import { useState, useCallback, useEffect } from "react";
import { getThoughtList } from "@/actions/thoughts";
import type { IThoughtDTO } from "@/types/thought";
import LoadingSpinner from "@/components/LoadingSpinner";

interface Props {
  initialCursor?: string;
  pageSize: number;
}

export default function InfiniteThoughtScroll({
  initialCursor,
  pageSize
}: Props) {
  const [cursor, setCursor] = useState(initialCursor);
  const [hasMore, setHasMore] = useState(!!initialCursor);
  const [isLoading, setIsLoading] = useState(false);

  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore || !cursor) return;

    setIsLoading(true);

    try {
      const result = await getThoughtList({
        limit: pageSize,
        cursor
      });

      if (result.success) {
        const newThoughts = result.data.items;
        const newCursor = result.data.pagination.nextCursor;

        // 动态添加新说说
        const event = new CustomEvent("thoughts:append", {
          detail: { thoughts: newThoughts }
        });
        window.dispatchEvent(event);

        setCursor(newCursor);
        setHasMore(!!newCursor);
      }
    } catch (error) {
      console.error("Failed to load more thoughts:", error);
    } finally {
      setIsLoading(false);
    }
  }, [cursor, hasMore, isLoading, pageSize]);

  // 使用 Intersection Observer 监听滚动
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        if (target.isIntersecting) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    const sentinel = document.getElementById("infinite-scroll-sentinel");
    if (sentinel) {
      observer.observe(sentinel);
    }

    return () => observer.disconnect();
  }, [loadMore]);

  return (
    <>
      {/* 加载更多指示器 */}
      {isLoading && (
        <div className="flex justify-center py-4">
          <LoadingSpinner />
        </div>
      )}

      {/* 滚动监听元素 */}
      {hasMore && !isLoading && (
        <div id="infinite-scroll-sentinel" className="h-10"></div>
      )}

      {/* 没有更多数据提示 */}
      {!hasMore && (
        <div className="py-8 text-center text-gray-500 dark:text-gray-400">
          没有更多内容了
        </div>
      )}
    </>
  );
}
```

#### 4.3.4 说说卡片组件 (`src/app/(app)/thoughts/components/ThoughtCard.tsx`)
```typescript
"use client";

import { useState, useEffect } from "react";
import type { IThoughtDTO } from "@/types/thought";
import { likeThought } from "@/actions/thoughts";
import { Heart, MessageCircle } from "lucide-react";
import MDXContentRenderer from "@/components/MDXContentRenderer";
import { thoughtComponents } from "@/mdx-components";

interface Props {
  thought: IThoughtDTO;
}

export default function ThoughtCard({ thought }: Props) {
  const [likeCount, setLikeCount] = useState(thought.likeCount);
  const [isLiking, setIsLiking] = useState(false);

  // 监听动态添加事件
  useEffect(() => {
    const handleAppend = (e: any) => {
      // 如果是新添加的说说，可以在这里处理
      // 例如显示动画效果
    };

    window.addEventListener("thoughts:append", handleAppend);
    return () => window.removeEventListener("thoughts:append", handleAppend);
  }, []);

  const handleLike = async () => {
    if (isLiking) return;

    setIsLiking(true);
    try {
      const result = await likeThought(thought._id);
      if (result.success) {
        setLikeCount(result.data.likeCount);
      } else {
        // 错误提示（如果需要）
        console.error(result.message);
      }
    } catch (error) {
      console.error("Failed to like thought:", error);
    } finally {
      setIsLiking(false);
    }
  };

  const formatDate = (date: string | Date) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return "今天";
    } else if (days === 1) {
      return "昨天";
    } else if (days < 7) {
      return `${days}天前`;
    } else {
      return d.toLocaleDateString();
    }
  };

  return (
    <article className="rounded-xl bg-white p-6 shadow-sm transition-all duration-200 hover:shadow-md dark:bg-gray-800">
      {/* 作者信息 */}
      <div className="mb-4 flex items-center space-x-3">
        <img
          src={thought.author.avatarUrl}
          alt={thought.author.name}
          className="h-12 w-12 rounded-full object-cover"
          loading="lazy"
        />
        <div>
          <h3 className="font-medium text-gray-900 dark:text-gray-100">
            {thought.author.name}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {formatDate(thought.createdAt)}
          </p>
        </div>
      </div>

      {/* MDX 内容 */}
      <div className="prose prose-gray mb-4 max-w-none dark:prose-invert">
        <MDXContentRenderer
          content={thought.content}
          components={thoughtComponents}
        />
      </div>

      {/* 互动按钮 */}
      <div className="flex items-center space-x-6 border-t border-gray-200 pt-4 dark:border-gray-700">
        <button
          onClick={handleLike}
          disabled={isLiking}
          className="flex items-center space-x-2 text-gray-600 transition-colors hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 disabled:opacity-50"
          title={isLiking ? "点赞中..." : "点赞"}
        >
          <Heart className="h-5 w-5" />
          <span>{likeCount}</span>
        </button>

        <button
          className="flex items-center space-x-2 text-gray-600 transition-colors hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
          disabled
          title="评论功能待开放"
        >
          <MessageCircle className="h-5 w-5" />
          <span>评论</span>
        </button>
      </div>
    </article>
  );
}
```

#### 4.3.5 骨架屏加载器 (`src/app/(app)/thoughts/components/SkeletonLoader.tsx`)
```typescript
export default function SkeletonLoader() {
  return (
    <div className="space-y-6">
      {Array.from({ length: 3 }, (_, i) => (
        <div
          key={i}
          className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800"
        >
          {/* 作者信息骨架 */}
          <div className="mb-4 flex items-center space-x-3">
            <div className="h-12 w-12 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700" />
            <div className="space-y-2">
              <div className="h-4 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
              <div className="h-3 w-16 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
            </div>
          </div>

          {/* 内容骨架 */}
          <div className="space-y-3">
            <div className="h-4 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
            <div className="h-4 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
            <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
          </div>

          {/* 按钮骨架 */}
          <div className="mt-4 flex space-x-6 border-t border-gray-200 pt-4 dark:border-gray-700">
            <div className="h-6 w-16 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
            <div className="h-6 w-16 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
          </div>
        </div>
      ))}
    </div>
  );
}
```

### 4.4 后台管理

#### 4.4.1 说说管理页面 (`src/app/(dashboard)/dashboard/thoughts/page.tsx`)
```typescript
"use client";

import { useState, useEffect } from "react";
import { getAllThoughts, deleteThought } from "@/actions/thoughts";
import type { IThoughtDTO } from "@/types/thought";
import { message } from "@/utils/message-info";
import { Trash2, Edit, Plus } from "lucide-react";
import Link from "next/link";
import MDXContentRenderer from "@/components/MDXContentRenderer";
import { thoughtComponents } from "@/mdx-components";

export default function ThoughtsManagementPage() {
  const [thoughts, setThoughts] = useState<IThoughtDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchThoughts();
  }, []);

  const fetchThoughts = async () => {
    try {
      setIsLoading(true);
      const result = await getAllThoughts({ status: "all", limit: 100 });
      if (result.success) {
        setThoughts(result.data.items);
      }
    } catch (error) {
      console.error("Failed to fetch thoughts:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string, content: string) => {
    if (!confirm(`确定要删除这条说说吗？\n\n${content.substring(0, 50)}...`)) return;

    try {
      const result = await deleteThought(id);
      if (result.success) {
        message.success("说说删除成功");
        setThoughts(prev => prev.filter(t => t._id !== id));
      } else {
        message.error(result.message || "删除失败");
      }
    } catch (error) {
      console.error("Delete error:", error);
      message.error("删除失败");
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="flex items-center space-x-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600"></div>
          <span>加载中...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* 页面头部 */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">说说管理</h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">管理所有说说动态</p>
        </div>
        <Link
          href="/dashboard/thoughts/new"
          className="flex items-center rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-3 font-medium text-white shadow-lg transition-all duration-200 hover:scale-105 hover:shadow-xl"
        >
          <Plus className="mr-2 h-4 w-4" />
          新建说说
        </Link>
      </div>

      {/* 说说列表 */}
      <div className="space-y-4">
        {thoughts.length > 0 ? (
          thoughts.map((thought) => (
            <div
              key={thought._id}
              className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="mb-2 flex items-center space-x-3">
                    <img
                      src={thought.author.avatarUrl}
                      alt={thought.author.name}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">
                        {thought.author.name}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(thought.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        thought.status === "published"
                          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                      }`}
                    >
                      {thought.status === "published" ? "已发布" : "草稿"}
                    </span>
                  </div>

                  <div className="prose prose-sm max-w-none text-gray-700 dark:text-gray-300">
                    <MDXContentRenderer content={thought.content} components={thoughtComponents} />
                  </div>

                  <div className="mt-3 flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                    <span>👍 {thought.likeCount} 点赞</span>
                  </div>
                </div>

                <div className="ml-4 flex items-center space-x-2">
                  <Link
                    href={`/dashboard/thoughts/${thought._id}`}
                    className="rounded-lg p-2 text-indigo-600 transition-all duration-200 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-900/20"
                    title="编辑"
                  >
                    <Edit className="h-4 w-4" />
                  </Link>
                  <button
                    onClick={() => handleDelete(thought._id, thought.content)}
                    className="rounded-lg p-2 text-red-600 transition-all duration-200 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                    title="删除"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="py-12 text-center">
            <p className="text-gray-500 dark:text-gray-400">暂无说说</p>
            <Link
              href="/dashboard/thoughts/new"
              className="mt-4 inline-flex items-center rounded-xl border border-transparent bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-3 text-sm font-medium text-white shadow-lg transition-all duration-200 hover:scale-105 hover:shadow-xl"
            >
              <Plus className="mr-2 h-4 w-4" />
              新建说说
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
```

#### 4.4.2 新建说说页面 (`src/app/(dashboard)/dashboard/thoughts/new/page.tsx`)
```typescript
"use client";

import { useState } from "react";
import { createThought } from "@/actions/thoughts";
import { message } from "@/utils/message-info";
import { useRouter } from "next/navigation";

export default function NewThoughtPage() {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [status, setStatus] = useState<"published" | "draft">("published");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim()) {
      message.warning("请输入内容");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await createThought({
        content: content.trim(),
        status
      });

      if (result.success) {
        message.success("说说创建成功");
        router.push("/dashboard/thoughts");
      } else {
        message.error(result.message || "创建失败");
      }
    } catch (error) {
      console.error("Create thought error:", error);
      message.error("创建失败");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">新建说说</h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          创建一条新的说说动态
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 内容 */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <h2 className="mb-4 text-lg font-medium text-gray-900 dark:text-gray-100">内容</h2>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="支持 MDX 语法，可以使用自定义组件..."
            rows={12}
            className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
          />
          <p className="mt-2 text-xs text-gray-500">
            支持 Markdown 语法和 MDX 组件
          </p>
        </div>

        {/* 发布设置 */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <h2 className="mb-4 text-lg font-medium text-gray-900 dark:text-gray-100">发布设置</h2>
          <div className="flex items-center space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                name="status"
                value="published"
                checked={status === "published"}
                onChange={(e) => setStatus(e.target.value as "published")}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">立即发布</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="status"
                value="draft"
                checked={status === "draft"}
                onChange={(e) => setStatus(e.target.value as "draft")}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">保存为草稿</span>
            </label>
          </div>
        </div>

        {/* 提交按钮 */}
        <div className="flex items-center justify-end space-x-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-lg border border-gray-300 bg-white px-6 py-2 text-gray-700 shadow-sm transition-all hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            取消
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-2 font-medium text-white shadow-sm transition-all hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50"
          >
            {isSubmitting ? "发布中..." : "发布说说"}
          </button>
        </div>
      </form>
    </div>
  );
}
```

#### 4.4.3 编辑说说页面 (`src/app/(dashboard)/dashboard/thoughts/[id]/page.tsx`)
```typescript
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { getAllThoughts, updateThought } from "@/actions/thoughts";
import { message } from "@/utils/message-info";
import type { IThoughtDTO } from "@/types/thought";

export default function EditThoughtPage() {
  const params = useParams();
  const router = useRouter();
  const thoughtId = params.id as string;

  const [content, setContent] = useState("");
  const [status, setStatus] = useState<"published" | "draft">("published");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (thoughtId) {
      fetchThought();
    }
  }, [thoughtId]);

  const fetchThought = async () => {
    try {
      setIsLoading(true);
      // 使用 getAllThoughts 获取单个说说（后台可见）
      const result = await getAllThoughts({ limit: 1 });
      if (result.success && result.data.items.length > 0) {
        const thought = result.data.items.find(t => t._id === thoughtId) as IThoughtDTO | undefined;
        if (thought) {
          setContent(thought.content);
          setStatus(thought.status);
        } else {
          message.error("说说不存在");
          router.push("/dashboard/thoughts");
        }
      } else {
        message.error(result.message || "获取说说失败");
        router.push("/dashboard/thoughts");
      }
    } catch (error) {
      console.error("Failed to fetch thought:", error);
      message.error("获取说说失败");
      router.push("/dashboard/thoughts");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim()) {
      message.warning("请输入内容");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await updateThought(thoughtId, {
        content: content.trim(),
        status
      });

      if (result.success) {
        message.success("说说更新成功");
        router.push("/dashboard/thoughts");
      } else {
        message.error(result.message || "更新失败");
      }
    } catch (error) {
      console.error("Update thought error:", error);
      message.error("更新失败");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="flex items-center space-x-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600"></div>
          <span>加载中...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">编辑说说</h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          修改说说内容和设置
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 内容 */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <h2 className="mb-4 text-lg font-medium text-gray-900 dark:text-gray-100">内容</h2>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="支持 MDX 语法，可以使用自定义组件..."
            rows={12}
            className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
          />
          <p className="mt-2 text-xs text-gray-500">
            支持 Markdown 语法和 MDX 组件
          </p>
        </div>

        {/* 发布设置 */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <h2 className="mb-4 text-lg font-medium text-gray-900 dark:text-gray-100">发布设置</h2>
          <div className="flex items-center space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                name="status"
                value="published"
                checked={status === "published"}
                onChange={(e) => setStatus(e.target.value as "published")}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">已发布</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="status"
                value="draft"
                checked={status === "draft"}
                onChange={(e) => setStatus(e.target.value as "draft")}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">草稿</span>
            </label>
          </div>
        </div>

        {/* 提交按钮 */}
        <div className="flex items-center justify-end space-x-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-lg border border-gray-300 bg-white px-6 py-2 text-gray-700 shadow-sm transition-all hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            取消
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-2 font-medium text-white shadow-sm transition-all hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50"
          >
            {isSubmitting ? "保存中..." : "保存修改"}
          </button>
        </div>
      </form>
    </div>
  );
}
```

### 4.5 MDX 自定义组件

#### 4.5.1 电影卡片组件示例 (`src/components/MDX/MovieCard.tsx`)
```typescript
"use client";

interface MovieCardProps {
  title: string;
  year: string;
  rating?: string;
  cover?: string;
  description?: string;
}

export default function MovieCard({
  title,
  year,
  rating,
  cover,
  description
}: MovieCardProps) {
  return (
    <div className="my-6 flex gap-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      {cover && (
        <img
          src={cover}
          alt={title}
          className="h-24 w-16 rounded object-cover"
        />
      )}
      <div className="flex-1">
        <h3 className="font-bold text-gray-900 dark:text-gray-100">
          {title} ({year})
        </h3>
        {rating && (
          <p className="text-sm text-yellow-600 dark:text-yellow-400">
            ⭐ {rating}
          </p>
        )}
        {description && (
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}
```

#### 4.5.2 注册自定义组件 (`src/mdx-components.tsx`)
```typescript
import MovieCard from "@/components/MDX/MovieCard";

// 说说页面的自定义组件
export const thoughtComponents = {
  MovieCard
};

// 文章页面的自定义组件（复用现有）
export const articleComponents = {
  // ... 现有组件
};
```

#### 4.5.3 更新现有 MDX 组件配置 (`src/mdx-components.tsx`)
```typescript
import MovieCard from "@/components/MDX/MovieCard";

// 说说页面的自定义组件
export const thoughtComponents = {
  MovieCard
};

// 文章页面的自定义组件（复用现有）
export const articleComponents = {
  // ... 现有组件
};
```

#### 4.5.4 更新说说卡片使用自定义组件
```typescript
// 在 ThoughtCard.tsx 中
import { thoughtComponents } from "@/mdx-components";

<MDXContentRenderer
  content={thought.content}
  components={thoughtComponents}
/>
```

## 5. 路由配置

### 5.1 前台路由
- `/thoughts` - 说说列表页面
  - `loading.tsx` - 页面加载动画

### 5.2 后台路由
- `/dashboard/thoughts` - 说说管理列表
- `/dashboard/thoughts/new` - 新建说说
- `/dashboard/thoughts/[id]` - 编辑说说

### 5.3 导航菜单
在后台管理菜单中添加"说说管理"入口，参考文章管理的菜单配置。

## 6. 数据库初始化

### 6.1 创建集合索引
在 `src/lib/mongodb.ts` 或独立脚本中添加索引创建逻辑：

```typescript
// 在数据库连接成功后执行
export async function createThoughtIndexes() {
  const db = mongoose.connection.db;
  await db.collection("thoughts").createIndex({ createdAt: -1 });
  await db.collection("thoughts").createIndex({ status: 1, createdAt: -1 });
}
```

## 7. 测试建议

### 7.1 单元测试
- Repository 方法测试
- Server Action 测试
- 组件渲染测试

### 7.2 集成测试
- 完整发布流程测试
- 无限滚动加载测试
- 点赞功能测试

### 7.3 手动测试清单
- [ ] 创建说说（发布/草稿）
- [ ] 编辑说说
- [ ] 删除说说
- [ ] 点赞功能
- [ ] MDX 渲染（包含自定义组件）
- [ ] 无限滚动加载
- [ ] 页面加载动画
- [ ] 响应式设计（移动端/桌面端）
- [ ] 暗色模式适配

## 8. 性能优化

### 8.1 前端优化
- 使用 React.memo 缓存说说卡片组件
- 虚拟滚动（如果数据量极大）
- 图片懒加载

### 8.2 后端优化
- 数据库索引优化
- 分页查询限制返回字段
- MDX 内容静态缓存

## 9. 后续扩展

### 9.1 评论功能
- 接入用户系统后，完善评论功能
- 支持嵌套评论
- 评论审核

### 9.2 高级功能
- 说说置顶
- 表情反应（多种反应类型）
- 话题标签
- 地理位置
- 图片/视频上传

### 9.3 通知系统
- 点赞通知
- 评论通知

## 10. 注意事项

1. **防刷机制**: 点赞功能需考虑防刷，目前未实现身份验证
2. **内容审核**: 建议添加内容审核机制
3. **备份策略**: 定期备份说说数据
4. **监控告警**: 监控点赞量、评论量等指标
5. **SEO**: 说说页面可考虑添加结构化数据
6. **国际化**: 如需多语言支持，需提取硬编码文本

## 11. 开发周期估算

| 模块 | 预估时间 |
|------|----------|
| 数据模型与类型 | 0.5 天 |
| Repository 层 | 0.5 天 |
| Server Actions | 0.5 天 |
| 前台页面 | 1 天 |
| 后台管理 | 1 天 |
| MDX 组件 | 0.5 天 |
| 测试与调优 | 0.5 天 |
| **总计** | **4 天** |

---

## 12. 安全与性能优化

### 12.1 已修正的安全问题

#### 高优先级问题
1. **身份验证与权限控制**
   - ✅ 所有 mutations（创建/更新/删除）均添加身份验证检查
   - ✅ 服务器端设置作者信息，防止客户端篡改
   - ✅ TODO: 接入用户系统后需要完善身份验证

2. **输入验证**
   - ✅ 使用 Zod Schema 验证所有输入数据
   - ✅ 防止恶意数据注入

3. **草稿泄露防护**
   - ✅ 公开 API (`getThoughtList`, `getThoughtById`) 仅返回已发布内容
   - ✅ 后台 API (`getAllThoughts`) 需要身份验证且可见所有状态

4. **点赞防刷**
   - ✅ 添加 5 秒频率限制
   - ⚠️ TODO: 接入用户系统后，应使用 IP 或用户 ID 进行唯一性约束

#### 中优先级问题
1. **Cursor 分页**
   - ✅ 从 offset 分页改为 cursor 分页，避免数据重复/跳过问题
   - ✅ 提升大数据量时的查询性能

2. **类型安全**
   - ✅ 分离 DTO 类型：创建/更新输入、读取输出
   - ✅ `_id` 在读取模型中为必填字段
   - ✅ 统一日期格式为 ISO 字符串

3. **App Router 最佳实践**
   - ✅ 使用 Server Component 获取初始数据
   - ✅ 客户端组件仅负责无限滚动
   - ✅ `loading.tsx` 用于路由级 Suspense
   - ✅ 使用 `revalidatePath` 在 mutations 后刷新缓存

### 12.2 性能优化

1. **数据库查询**
   - ✅ 限制分页返回数量（最大 50 条）
   - ✅ 使用索引优化排序和过滤
   - ⚠️ TODO: 大数据量时考虑移除 `countDocuments` 调用

2. **前端优化**
   - ✅ 图片懒加载
   - ✅ 骨架屏提升感知性能
   - ⚠️ TODO: 虚拟滚动（数据量 > 1000 时）

3. **缓存策略**
   - ✅ Server Actions 使用 `revalidatePath` 缓存失效
   - ⚠️ TODO: 考虑添加客户端缓存（React Query/SWR）

### 12.3 权限边界与访问控制

#### 12.3.1 公开 API（无需认证）
```typescript
// 仅返回已发布的说说
- getThoughtList(): 仅 status = "published"
- getThoughtById(): 仅 status = "published"
- likeThought(): 仅对已发布的说说点赞
```

#### 12.3.2 认证 API（需要认证）
```typescript
// 后台管理专用
- getAllThoughts(): 返回所有状态（管理员可见）
- createThought(): 创建说说（自动设置作者）
- updateThought(): 更新说说（仅作者或管理员）
- deleteThought(): 删除说说（仅作者或管理员）
```

#### 12.3.3 权限检查实现
```typescript
// 在 Server Actions 中
async function checkPermission(userId: string, thoughtAuthor: string) {
  const isOwner = userId === thoughtAuthor;
  const isAdmin = await checkIsAdmin(userId); // TODO: 实现管理员检查

  if (!isOwner && !isAdmin) {
    throw new Error("权限不足");
  }
}
```

### 12.4 限流策略

#### 12.4.1 当前实现（内存存储）
```typescript
// 点赞防刷 - 5秒频率限制
const likeRateLimit = new Map<string, number>();

// 限制规则：
// - 匿名用户：基于 IP + 浏览器指纹（TODO: 实现）
// - 登录用户：基于用户ID
// - 粒度：用户 + 目标说说
```

#### 12.4.2 生产环境建议（Redis）
```typescript
// 使用 Redis 实现分布式限流
const rateLimiter = {
  // 点赞：每用户每说说 1次/5秒
  async checkLike(userId: string, thoughtId: string) {
    const key = `like:${userId}:${thoughtId}`;
    const count = await redis.incr(key);

    if (count === 1) {
      await redis.expire(key, 5); // 5秒过期
    }

    if (count > 1) {
      throw new Error("操作过于频繁");
    }
  },

  // 创建说说：每用户 1次/10秒
  async checkCreate(userId: string) {
    const key = `create:${userId}`;
    const count = await redis.incr(key);

    if (count === 1) {
      await redis.expire(key, 10);
    }

    if (count > 3) { // 允许10秒内最多3次
      throw new Error("发布过于频繁");
    }
  }
};
```

### 12.5 游标一致性保证

#### 12.5.1 游标设计
```typescript
// 使用 createdAt + _id 复合游标
// 格式：base64(`${createdAt}-${_id}`)
// 优势：
// 1. 单调递增（时间戳）
// 2. 唯一性保证（_id）
// 3. 并发安全（相同时间戳通过 _id 区分）
```

#### 12.5.2 并发插入处理
```typescript
// 查询逻辑
const query = {
  $or: [
    { createdAt: { $lt: cursor.createdAt } },
    {
      createdAt: cursor.createdAt,
      _id: { $lt: cursor._id }  // 确保稳定性
    }
  ]
};

// 排序逻辑
.sort({ createdAt: -1, _id: -1 }); // 复合排序

// 这样即使并发插入，也能保证：
// 1. 不重复数据
// 2. 不跳过数据
// 3. 稳定的分页结果
```

### 12.6 缓存与失效策略

#### 12.6.1 revalidatePath 触发点
```typescript
// 创建说说后
await createThought(data);
revalidatePath("/thoughts"); // 刷新首页
revalidatePath("/dashboard/thoughts"); // 刷新管理页

// 更新说说后
await updateThought(id, data);
revalidatePath(`/thoughts`); // 刷新所有说说页面
revalidatePath(`/dashboard/thoughts/${id}`); // 刷新编辑页

// 删除说说后
await deleteThought(id);
revalidatePath("/thoughts");
revalidatePath("/dashboard/thoughts");

// 点赞后（可选）
await likeThought(id);
// 不刷新整个列表，仅更新本地状态
```

#### 12.6.2 细粒度缓存（TODO: 未来扩展）
```typescript
// 使用 revalidateTag 实现更细粒度控制
import { revalidateTag } from "next/cache";

// 为特定说说添加标签
revalidateTag(`thought:${id}`);

// 获取时使用缓存标签
const thought = await fetch(`/api/thoughts/${id}`, {
  next: { tags: [`thought:${id}`] }
});

// 更新时仅失效特定标签
revalidateTag(`thought:${id}`);
```

### 12.7 错误处理与审计

#### 12.7.1 统一错误格式
```typescript
// ServerActionBuilder 中已实现
{
  success: boolean;
  data?: T;
  message?: string;
  errorCode?: string; // TODO: 添加错误码
  timestamp: string; // TODO: 添加时间戳
  requestId?: string; // TODO: 添加请求ID（用于追踪）
}

// 错误码规范
enum ErrorCode {
  UNAUTHORIZED = "AUTH_001",
  FORBIDDEN = "AUTH_002",
  VALIDATION_ERROR = "VAL_001",
  NOT_FOUND = "NOT_001",
  RATE_LIMITED = "RATE_001",
  INTERNAL_ERROR = "SYS_001"
}
```

#### 12.7.2 日志记录（审计）
```typescript
// 在 Server Actions 中添加审计日志
async function logAction(action: string, userId: string, targetId: string, details?: any) {
  await AuditLog.create({
    action, // "create" | "update" | "delete" | "like"
    userId,
    targetId,
    targetType: "thought",
    timestamp: new Date(),
    ip: getClientIP(), // TODO: 实现IP获取
    userAgent: getUserAgent(), // TODO: 实现UA获取
    details
  });
}

// 关键操作必须记录
await createThought(data);
logAction("create", userId, thought._id, { status: data.status });

await updateThought(id, data);
logAction("update", userId, id, { changes: getChanges(data) });

await deleteThought(id);
logAction("delete", userId, id, {});

await likeThought(id);
logAction("like", userId, id, {});
```

#### 12.7.3 审计日志模型
```typescript
interface AuditLog {
  _id: ObjectId;
  action: "create" | "update" | "delete" | "like";
  userId: string;
  targetId: string;
  targetType: "thought";
  timestamp: Date;
  ip?: string;
  userAgent?: string;
  details?: Record<string, any>;
}

// 索引
- `timestamp` 倒序（用于查询）
- `userId + timestamp` 复合（用于用户操作历史）
- `targetId + targetType` 复合（用于操作审计）
```

### 12.8 待处理的安全项

1. **MDX 安全**
   - ⚠️ TODO: 评估是否需要 MDX 内容净化
   - 说明：如果内容仅管理员编写，可暂不处理；如果用户可编写，则必须添加

2. **CSRF 防护**
   - ⚠️ TODO: Next.js Server Actions 内置 CSRF 防护，但建议确认配置

3. **Rate Limiting**
   - ⚠️ TODO: 生产环境应使用 Redis 等外部存储实现分布式限流

4. **权限细化**
   - ⚠️ TODO: 实现基于角色的权限控制（RBAC）
   - ⚠️ TODO: 实现作者验证机制

5. **可观测性**
   - ⚠️ TODO: 集成错误监控（如 Sentry）
   - ⚠️ TODO: 添加性能监控（如 APM）

6. **数据备份**
   - ⚠️ TODO: 实现定期数据备份策略

---

**文档版本**: v2.0
**创建日期**: 2026-01-21
**最后更新**: 2026-01-21
**修订说明**:
- v2.0: 修正安全问题、性能优化、架构改进
  - 添加身份验证与输入验证
  - 修复草稿泄露问题
  - Cursor 分页替代 offset 分页
  - Server Component 架构优化
