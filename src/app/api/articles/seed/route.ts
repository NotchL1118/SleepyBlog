import { ApiResponder, ApiResponseBuilder } from "@/lib/api-response";
import connectToDatabase from "@/lib/mongodb";
import Article from "@/models/Article";
import { NextRequest } from "next/server";

// 初始化测试数据
export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();

    // 检查是否已有数据
    const existingCount = await Article.countDocuments();
    console.log("existingCount", existingCount, request.nextUrl.searchParams.get("force"));
    const force = request.nextUrl.searchParams.get("force") === "true";
    if (existingCount > 0 && !force) {
      return ApiResponder.badRequest("数据库中已存在文章数据，无需重复初始化");
    }
    if (existingCount > 0 && force) {
      await Article.deleteMany({});
    }

    // 创建示例文章
    const sampleArticles = [
      {
        title: "Next.js 15 新特性详解",
        content: `# Next.js 15 新特性详解

Next.js 15 带来了许多令人兴奋的新特性和改进，让我们一起来了解这些变化。

## 主要特性

### 1. 改进的性能
Next.js 15 在性能方面有了显著提升，包括：
- 更快的构建时间
- 优化的运行时性能
- 更好的内存使用

### 2. 新的API路由
新版本引入了更强大的API路由系统，支持：
- 中间件支持
- 更好的错误处理
- 类型安全

### 3. 改进的开发体验
- 更快的热重载
- 更好的错误信息
- 改进的调试工具

## 总结

Next.js 15 是一个重要的版本更新，为开发者带来了更好的开发体验和性能提升。`,
        excerpt: "Next.js 15 带来了许多令人兴奋的新特性和改进，包括性能提升、新的API路由系统和改进的开发体验。",
        author: "技术团队",
        tags: ["Next.js", "React", "前端开发", "性能优化"],
        category: "前端技术",
        status: "published",
        slug: "nextjs-15-features",
        viewCount: 156,
        likeCount: 23,
      },
      {
        title: "MongoDB 与 Node.js 最佳实践",
        content: `# MongoDB 与 Node.js 最佳实践

在使用 MongoDB 和 Node.js 开发应用时，遵循最佳实践可以帮助我们构建更可靠、更高效的应用。

## 连接管理

### 1. 连接池
使用连接池可以有效管理数据库连接：
\`\`\`javascript
const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/myapp', {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
});
\`\`\`

### 2. 错误处理
正确处理数据库错误：
\`\`\`javascript
try {
  const result = await Model.findOne({ _id: id });
  if (!result) {
    throw new Error('Document not found');
  }
  return result;
} catch (error) {
  console.error('Database error:', error);
  throw error;
}
\`\`\`

## 数据建模

### 1. Schema 设计
合理设计 Schema 结构：
- 使用适当的数据类型
- 添加必要的验证
- 考虑索引策略

### 2. 关系处理
根据数据访问模式选择嵌入或引用：
- 一对一：通常使用嵌入
- 一对多：根据数据量选择
- 多对多：使用引用

## 性能优化

### 1. 索引策略
- 为常用查询字段创建索引
- 避免过多索引
- 定期分析查询性能

### 2. 聚合管道
使用聚合管道进行复杂查询：
\`\`\`javascript
const result = await Model.aggregate([
  { $match: { status: 'active' } },
  { $group: { _id: '$category', count: { $sum: 1 } } },
  { $sort: { count: -1 } }
]);
\`\`\`

## 总结

遵循这些最佳实践可以帮助我们构建更健壮、更高效的 MongoDB 和 Node.js 应用。`,
        excerpt: "在使用 MongoDB 和 Node.js 开发应用时，遵循最佳实践可以帮助我们构建更可靠、更高效的应用。",
        author: "数据库专家",
        tags: ["MongoDB", "Node.js", "数据库", "最佳实践"],
        category: "后端技术",
        status: "published",
        slug: "mongodb-nodejs-best-practices",
        viewCount: 89,
        likeCount: 15,
      },
      {
        title: "TypeScript 高级类型技巧",
        content: `# TypeScript 高级类型技巧

TypeScript 提供了强大的类型系统，掌握高级类型技巧可以让我们写出更安全、更优雅的代码。

## 工具类型

### 1. \`Partial<T>\`
将所有属性变为可选：
\`\`\`typescript
interface User {
  id: number;
  name: string;
  email: string;
}

type PartialUser = Partial<User>;
// { id?: number; name?: string; email?: string; }
\`\`\`

### 2. \`Required<T>\`
将所有属性变为必需：
\`\`\`typescript
interface Config {
  apiUrl?: string;
  timeout?: number;
}

type RequiredConfig = Required<Config>;
// { apiUrl: string; timeout: number; }
\`\`\`

### 3. \`Pick<T, K>\`
选择特定属性：
\`\`\`typescript
type UserSummary = Pick<User, 'id' | 'name'>;
// { id: number; name: string; }
\`\`\`

### 4. \`Omit<T, K>\`
排除特定属性：
\`\`\`typescript
type CreateUser = Omit<User, 'id'>;
// { name: string; email: string; }
\`\`\`

## 条件类型

### 1. 基本条件类型
\`\`\`typescript
type IsArray<T> = T extends any[] ? true : false;

type Test1 = IsArray<string[]>; // true
type Test2 = IsArray<string>;   // false
\`\`\`

### 2. 分布式条件类型
\`\`\`typescript
type ToArray<T> = T extends any ? T[] : never;

type Test = ToArray<string | number>;
// string[] | number[]
\`\`\`

## 映射类型

### 1. 基本映射
\`\`\`typescript
type Readonly<T> = {
  readonly [P in keyof T]: T[P];
};
\`\`\`

### 2. 条件映射
\`\`\`typescript
type Nullable<T> = {
  [P in keyof T]: T[P] | null;
};
\`\`\`

## 模板字面量类型

### 1. 基本用法
\`\`\`typescript
type Greeting = \`Hello \${string}\`;

const greeting: Greeting = "Hello World"; // ✓
const invalid: Greeting = "Hi there";     // ✗
\`\`\`

### 2. 组合使用
\`\`\`typescript
type EventName<T extends string> = \`on\${Capitalize<T>}\`;

type MouseEvent = EventName<'click' | 'hover'>;
// 'onClick' | 'onHover'
\`\`\`

## 实际应用

### 1. API 响应类型
\`\`\`typescript
interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

type UserResponse = ApiResponse<User>;
type UsersResponse = ApiResponse<User[]>;
\`\`\`

### 2. 表单验证
\`\`\`typescript
type ValidationRule<T> = {
  [K in keyof T]: (value: T[K]) => string | null;
};

const userValidation: ValidationRule<User> = {
  id: (value) => value > 0 ? null : 'ID must be positive',
  name: (value) => value.length > 0 ? null : 'Name is required',
  email: (value) => /\S+@\S+\.\S+/.test(value) ? null : 'Invalid email'
};
\`\`\`

## 总结

掌握这些高级类型技巧可以让我们充分利用 TypeScript 的类型系统，写出更安全、更可维护的代码。`,
        excerpt: "TypeScript 提供了强大的类型系统，掌握高级类型技巧可以让我们写出更安全、更优雅的代码。",
        author: "TypeScript 专家",
        tags: ["TypeScript", "类型系统", "前端开发", "编程技巧"],
        category: "编程语言",
        status: "published",
        slug: "typescript-advanced-types",
        viewCount: 234,
        likeCount: 42,
      },
      {
        title: "React 18 并发特性深度解析",
        content: `# React 18 并发特性深度解析

React 18 引入了并发特性，这是 React 历史上最重要的更新之一。让我们深入了解这些特性及其实际应用。

## 并发渲染

### 1. 什么是并发渲染
并发渲染允许 React 在渲染过程中暂停和恢复工作，从而保持应用的响应性。

### 2. 自动批处理
React 18 会自动批处理多个状态更新：
\`\`\`javascript
function App() {
  const [count, setCount] = useState(0);
  const [flag, setFlag] = useState(false);

  function handleClick() {
    // React 18 会自动批处理这些更新
    setCount(c => c + 1);
    setFlag(f => !f);
  }

  return (
    <div>
      <button onClick={handleClick}>
        Count: {count}, Flag: {flag.toString()}
      </button>
    </div>
  );
}
\`\`\`

## 新的 Hook

### 1. useTransition
用于标记非紧急的状态更新：
\`\`\`javascript
import { useTransition, useState } from 'react';

function App() {
  const [isPending, startTransition] = useTransition();
  const [input, setInput] = useState('');
  const [list, setList] = useState([]);

  function handleChange(e) {
    setInput(e.target.value);
    
    // 将列表更新标记为非紧急
    startTransition(() => {
      const newList = generateList(e.target.value);
      setList(newList);
    });
  }

  return (
    <div>
      <input value={input} onChange={handleChange} />
      {isPending ? <div>Loading...</div> : null}
      <ul>
        {list.map(item => <li key={item}>{item}</li>)}
      </ul>
    </div>
  );
}
\`\`\`

### 2. useDeferredValue
用于延迟更新不重要的值：
\`\`\`javascript
import { useDeferredValue, useState } from 'react';

function App() {
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);

  return (
    <div>
      <input 
        value={query} 
        onChange={e => setQuery(e.target.value)} 
      />
      <SearchResults query={deferredQuery} />
    </div>
  );
}
\`\`\`

### 3. useId
生成唯一的 ID：
\`\`\`javascript
import { useId } from 'react';

function NameFields() {
  const id = useId();
  
  return (
    <div>
      <label htmlFor={id + '-firstName'}>First Name</label>
      <input id={id + '-firstName'} type="text" />
      
      <label htmlFor={id + '-lastName'}>Last Name</label>
      <input id={id + '-lastName'} type="text" />
    </div>
  );
}
\`\`\`

## Suspense 改进

### 1. 服务端渲染支持
React 18 中的 Suspense 现在支持服务端渲染：
\`\`\`javascript
import { Suspense } from 'react';

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ProfilePage />
    </Suspense>
  );
}
\`\`\`

### 2. 选择性水合
允许页面的不同部分独立进行水合：
\`\`\`javascript
<Suspense fallback={<Spinner />}>
  <Comments />
</Suspense>
\`\`\`

## 实际应用场景

### 1. 搜索功能优化
\`\`\`javascript
function SearchApp() {
  const [query, setQuery] = useState('');
  const [isPending, startTransition] = useTransition();
  const [results, setResults] = useState([]);

  function handleSearch(value) {
    setQuery(value);
    
    startTransition(() => {
      // 这个更新不会阻塞输入
      const searchResults = performSearch(value);
      setResults(searchResults);
    });
  }

  return (
    <div>
      <input 
        value={query}
        onChange={e => handleSearch(e.target.value)}
        placeholder="Search..."
      />
      {isPending && <div>Searching...</div>}
      <SearchResults results={results} />
    </div>
  );
}
\`\`\`

### 2. 大列表渲染
\`\`\`javascript
function LargeList({ items }) {
  const [filter, setFilter] = useState('');
  const deferredFilter = useDeferredValue(filter);
  
  const filteredItems = useMemo(() => {
    return items.filter(item => 
      item.name.toLowerCase().includes(deferredFilter.toLowerCase())
    );
  }, [items, deferredFilter]);

  return (
    <div>
      <input 
        value={filter}
        onChange={e => setFilter(e.target.value)}
        placeholder="Filter items..."
      />
      <VirtualizedList items={filteredItems} />
    </div>
  );
}
\`\`\`

## 迁移指南

### 1. 升级到 React 18
\`\`\`bash
npm install react@18 react-dom@18
\`\`\`

### 2. 使用新的根 API
\`\`\`javascript
// 旧方式
import ReactDOM from 'react-dom';
ReactDOM.render(<App />, container);

// 新方式
import { createRoot } from 'react-dom/client';
const root = createRoot(container);
root.render(<App />);
\`\`\`

## 总结

React 18 的并发特性为构建更流畅的用户体验提供了强大的工具。通过合理使用这些特性，我们可以构建更响应、更高效的 React 应用。`,
        excerpt: "React 18 引入了并发特性，这是 React 历史上最重要的更新之一。本文深入解析这些特性及其实际应用。",
        author: "React 专家",
        tags: ["React", "并发渲染", "性能优化", "前端开发"],
        category: "前端技术",
        status: "published",
        slug: "react-18-concurrent-features",
        viewCount: 178,
        likeCount: 31,
      },
      {
        title: "现代 CSS 布局技术对比",
        content: `# 现代 CSS 布局技术对比

CSS 布局技术在过去几年中发生了巨大变化。让我们比较一下现代 CSS 布局技术的优缺点和适用场景。

## Flexbox

### 优点
- 一维布局的完美解决方案
- 对齐和分布空间非常灵活
- 响应式设计友好
- 浏览器支持良好

### 缺点
- 不适合复杂的二维布局
- 在某些情况下性能不如 Grid

### 适用场景
\`\`\`css
/* 导航栏 */
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* 卡片布局 */
.card {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

/* 居中对齐 */
.center {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}
\`\`\`

## CSS Grid

### 优点
- 二维布局的最佳选择
- 复杂布局变得简单
- 响应式设计强大
- 语义化的布局代码

### 缺点
- 学习曲线较陡
- 对于简单布局可能过于复杂
- 旧浏览器支持有限

### 适用场景
\`\`\`css
/* 网格布局 */
.grid-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

/* 复杂页面布局 */
.page-layout {
  display: grid;
  grid-template-areas: 
    "header header header"
    "sidebar main aside"
    "footer footer footer";
  grid-template-columns: 200px 1fr 200px;
  grid-template-rows: auto 1fr auto;
  min-height: 100vh;
}

/* 响应式图片网格 */
.image-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
}
\`\`\`

## Container Queries

### 优点
- 真正的组件级响应式设计
- 基于容器大小而非视口大小
- 更精确的控制

### 缺点
- 浏览器支持仍在发展中
- 需要额外的容器元素

### 适用场景
\`\`\`css
.card-container {
  container-type: inline-size;
}

@container (min-width: 400px) {
  .card {
    display: flex;
    flex-direction: row;
  }
}

@container (max-width: 399px) {
  .card {
    display: flex;
    flex-direction: column;
  }
}
\`\`\`

## Subgrid

### 优点
- 解决嵌套网格对齐问题
- 保持父级网格的轨道
- 更好的语义化

### 缺点
- 浏览器支持有限
- 只在 Firefox 中完全支持

### 适用场景
\`\`\`css
.parent-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

.child-grid {
  display: grid;
  grid-column: span 2;
  grid-template-columns: subgrid;
  gap: 1rem;
}
\`\`\`

## 实际应用示例

### 1. 响应式卡片布局
\`\`\`css
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
  padding: 2rem;
}

.card {
  display: flex;
  flex-direction: column;
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: #f5f5f5;
}

.card-content {
  flex: 1;
  padding: 1rem;
}

.card-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  padding: 1rem;
  border-top: 1px solid #eee;
}
\`\`\`

### 2. 复杂页面布局
\`\`\`css
.app-layout {
  display: grid;
  grid-template-areas: 
    "header header"
    "sidebar main"
    "footer footer";
  grid-template-columns: 250px 1fr;
  grid-template-rows: auto 1fr auto;
  min-height: 100vh;
}

.header {
  grid-area: header;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background: #333;
  color: white;
}

.sidebar {
  grid-area: sidebar;
  padding: 2rem 1rem;
  background: #f8f9fa;
  border-right: 1px solid #dee2e6;
}

.main {
  grid-area: main;
  padding: 2rem;
  overflow-y: auto;
}

.footer {
  grid-area: footer;
  padding: 1rem 2rem;
  background: #f8f9fa;
  border-top: 1px solid #dee2e6;
  text-align: center;
}

@media (max-width: 768px) {
  .app-layout {
    grid-template-areas: 
      "header"
      "main"
      "footer";
    grid-template-columns: 1fr;
  }
  
  .sidebar {
    display: none;
  }
}
\`\`\`

## 选择指南

### 使用 Flexbox 当：
- 需要一维布局（行或列）
- 需要对齐和分布空间
- 构建组件内部布局
- 需要良好的浏览器兼容性

### 使用 Grid 当：
- 需要二维布局
- 构建页面级布局
- 需要复杂的响应式设计
- 可以接受较新的浏览器支持

### 使用 Container Queries 当：
- 需要基于容器的响应式设计
- 构建可重用的组件
- 可以使用现代浏览器

## 总结

现代 CSS 布局技术各有优势，选择合适的技术取决于具体的需求和浏览器支持要求。通常情况下，Grid 和 Flexbox 的组合使用能够解决大部分布局需求。`,
        excerpt: "CSS 布局技术在过去几年中发生了巨大变化。本文比较现代 CSS 布局技术的优缺点和适用场景。",
        author: "CSS 专家",
        tags: ["CSS", "布局", "Flexbox", "Grid", "响应式设计"],
        category: "前端技术",
        status: "draft",
        slug: "modern-css-layout-comparison",
        viewCount: 0,
        likeCount: 0,
      },
    ];

    // 批量创建文章
    const createdArticles = await Article.insertMany(sampleArticles);

    // 使用类构建器模式创建201响应
    return ApiResponseBuilder.success(createdArticles)
      .withCode(201)
      .withMessage(`成功创建 ${createdArticles.length} 篇示例文章`)
      .send();
  } catch (error) {
    console.error("初始化数据失败:", error);
    return ApiResponder.serverError("初始化数据失败", error instanceof Error ? error : new Error(String(error)));
  }
}
