# Sleepy Blog

一个基于 Next.js 15 和 MongoDB 的现代博客应用。

## ✨ 功能特性

### 📚 文章管理

- ✅ 完整的文章CRUD操作
- ✅ 文章分类和标签系统
- ✅ 文章状态管理（草稿/已发布/已归档）
- ✅ 文章搜索和筛选
- ✅ 分页支持
- ✅ 阅读时间计算
- ✅ 浏览和点赞统计

### 🎨 MDX 支持

- ✅ 丰富的MDX组件库
- ✅ 代码高亮显示
- ✅ 在线MDX编辑器
- ✅ 实时预览功能

### 🔧 技术栈

- **前端**: Next.js 15, React 19, TypeScript
- **样式**: Tailwind CSS, SCSS
- **数据库**: MongoDB with Mongoose
- **MDX**: @next/mdx, next-mdx-remote
- **动画**: Motion
- **主题**: next-themes

## 🚀 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 环境配置

创建 `.env.local` 文件：

```env
MONGODB_URL=your_mongodb_connection_string
```

### 3. 检查数据库连接

```bash
npm run check-db
```

### 4. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000

## 🎯 页面路由

- `/` - 首页
- `/test-api` - API测试页面
- `/mdx-editor` - MDX在线编辑器
- `/article/[id]` - 文章详情页面

## 📝 文章数据结构

```typescript
interface Article {
  title: string; // 文章标题
  content: string; // 文章内容（Markdown格式）
  excerpt?: string; // 文章摘要
  author: string; // 作者
  tags: string[]; // 标签数组
  category: string; // 分类
  status: "draft" | "published" | "archived"; // 状态
  publishedAt?: Date; // 发布时间
  readingTime?: number; // 阅读时间（分钟）
  viewCount: number; // 浏览次数
  likeCount: number; // 点赞次数
  slug: string; // URL友好的标识符
  createdAt: Date; // 创建时间
  updatedAt: Date; // 更新时间
}
```

## 🧩 MDX 组件

应用包含丰富的MDX组件库：

- `<CodeBlock>` - 代码展示组件
- `<ImageCard>` - 图片卡片组件
- `<Highlight>` - 高亮文本组件

## 🛠️ 开发脚本

```bash
# 开发服务器
npm run dev

# 构建应用
npm run build

# 启动生产服务器
npm start

# 代码检查
npm run lint

# 检查数据库连接
npm run check-db
```

## 📁 项目结构

```
sleepy-blog/
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── about/          # 关于页面
│   │   ├── api/            # API 路由
│   │   ├── article/        # 文章页面
│   │   ├── blog/           # 博客页面
│   │   ├── camera/         # 相机页面
│   │   ├── life/           # 生活页面
│   │   ├── test-api/       # API测试页面
│   │   └── thoughts/       # 思考页面
│   ├── components/         # React 组件
│   │   ├── ArticleList/    # 文章列表组件
│   │   ├── Header/         # 头部组件
│   │   ├── HeroBanner/     # 英雄横幅组件
│   │   ├── Icons/          # 图标组件
│   │   ├── MDX/            # MDX 组件库
│   │   ├── ThemeSwitcher/  # 主题切换器
│   │   ├── Typewriter/     # 打字机效果组件
│   │   └── UserProfile/    # 用户资料组件
│   ├── hooks/              # React Hooks
│   ├── lib/                # 工具库
│   ├── models/             # 数据模型
│   ├── providers/          # Context Providers
│   ├── services/           # 服务层
│   ├── types/              # TypeScript 类型定义
│   └── utils/              # 工具函数
├── scripts/                # 脚本文件
├── public/                 # 静态文件
│   ├── fonts/              # 字体文件
│   └── images/             # 图片资源
└── Next2Do.md              # 开发任务列表
```

## 🤝 贡献

欢迎提交 Issues 和 Pull Requests！

## �� 许可证

MIT License
