# CategorySelector 组件

一个功能完整、高度模块化的分类选择器组件，支持搜索、创建、编辑、删除分类等功能。

## 📋 目录

- [快速开始](#快速开始)
- [功能特性](#功能特性)
- [架构设计](#架构设计)
- [文件结构](#文件结构)
- [核心概念](#核心概念)
- [开发指南](#开发指南)
- [API 文档](#api-文档)
- [常见问题](#常见问题)
- [扩展建议](#扩展建议)

---

## 快速开始

### 基础用法（非受控模式）

```tsx
import CategorySelector from "@/components/CategorySelector";

function MyForm() {
  return (
    <CategorySelector
      defaultValue="技术"
      placeholder="请选择分类"
      onChange={(category) => console.log("选中:", category)}
    />
  );
}
```

### 受控模式

```tsx
import { useState } from "react";
import CategorySelector from "@/components/CategorySelector";

function MyForm() {
  const [category, setCategory] = useState("");

  return (
    <CategorySelector
      value={category}
      onChange={setCategory}
      placeholder="请选择分类"
      required
      allowClear
    />
  );
}
```

---

## 功能特性

### ✨ 核心功能

- ✅ **搜索分类**：实时搜索，支持按名称和 slug 过滤
- ✅ **创建分类**：通过对话框创建，手动输入 name 和 slug
- ✅ **编辑分类**：修改现有分类的名称和 slug
- ✅ **删除分类**：带二次确认的删除功能
- ✅ **选择分类**：点击选择，支持清空
- ✅ **受控/非受控**：双模式支持，灵活适配不同场景

### 🎯 交互优化

- **优化的搜索体验**：打开下拉时输入框清空，选中值作为 placeholder 提示
- **自动滚动**：打开下拉时自动滚动到已选中项
- **点击外部关闭**：点击组件外部自动关闭下拉框
- **ESC 键关闭**：支持键盘快捷键
- **加载状态**：优雅的加载动画
- **空状态处理**：搜索无结果或无分类的友好提示

### 🎨 UI/UX

- **暗色模式**：完整支持 dark mode
- **响应式设计**：适配不同屏幕尺寸
- **动画效果**：流畅的过渡动画
- **无障碍性**：支持键盘导航和屏幕阅读器

---

## 架构设计

### 设计理念

本组件采用**关注点分离**和**组合优于继承**的设计原则，将复杂的业务逻辑拆分为：

1. **数据层**（Hooks）：负责数据获取、状态管理、业务逻辑
2. **UI 层**（Components）：负责渲染和用户交互
3. **类型层**（Types）：负责类型定义和约束

### 技术栈

- **React 19** - UI 框架
- **TypeScript** - 类型安全
- **Tailwind CSS** - 样式系统
- **Lucide React** - 图标库

### 核心优化

- **useMemo**：搜索过滤结果缓存，避免不必要的计算
- **useCallback**：事件处理函数缓存，减少子组件重渲染
- **React.memo**：所有子组件都使用 memo 优化
- **代码分割**：模块化设计，按需加载

---

## 文件结构

```
CategorySelector/
├── README.md                          # 📖 本文档
├── index.tsx                          # 🎯 主组件入口（170行）
├── types.ts                           # 📝 TypeScript 类型定义
│
├── hooks/                             # 🪝 自定义 Hooks（业务逻辑层）
│   ├── useControlledValue.ts         # 受控/非受控值管理
│   ├── useCategoryData.ts            # 分类数据获取和刷新
│   ├── useCategorySearch.ts          # 搜索逻辑和过滤
│   ├── useDropdownState.ts           # 下拉框状态管理
│   └── useCategoryActions.ts         # CRUD 操作（创建、更新、删除）
│
└── components/                        # 🎨 UI 组件（展示层）
    ├── CategoryInput/                 # 输入框组件
    │   ├── index.tsx                  # 主输入框
    │   └── InputActions.tsx           # 右侧操作按钮（清空、搜索图标）
    │
    ├── CategoryDropdown/              # 下拉菜单组件
    │   ├── index.tsx                  # 下拉菜单容器
    │   ├── Header.tsx                 # 头部（新增按钮）
    │   ├── CategoryList.tsx           # 分类列表容器
    │   ├── CategoryItem.tsx           # 单个分类项
    │   ├── DeleteConfirmation.tsx     # 删除确认 UI
    │   ├── LoadingState.tsx           # 加载状态
    │   ├── EmptyState.tsx             # 空状态
    │   └── Footer.tsx                 # 底部统计信息
    │
    └── CategoryDialog/                # 对话框组件
        ├── BaseDialog.tsx             # 对话框基础组件（公共逻辑）
        ├── DialogForm.tsx             # 表单组件（name 和 slug 输入）
        ├── CreateDialog.tsx           # 创建分类对话框
        └── EditDialog.tsx             # 编辑分类对话框
```

### 文件详解

#### 🎯 主组件（index.tsx）

**职责**：组合所有 hooks 和子组件，协调整体逻辑

**关键逻辑**：
- 使用 `useControlledValue` 管理受控/非受控模式
- 使用 `useCategoryData` 获取分类数据
- 使用 `useCategorySearch` 处理搜索
- 使用 `useDropdownState` 管理下拉框开关
- 使用 `useCategoryActions` 处理 CRUD 操作
- 维护对话框状态（创建/编辑）
- 处理选择、清空、删除等用户操作

**注意事项**：
- 删除分类时，如果是当前选中的分类，需要清空选择
- 编辑分类时，如果是当前选中的分类，需要更新选择值
- 创建成功后自动选中新分类并关闭下拉框

#### 🪝 Hooks 层

##### 1. useControlledValue.ts

**职责**：处理受控/非受控双模式

**原理**：
- 通过判断 `value !== undefined` 确定是否为受控模式
- 受控模式：直接使用传入的 value
- 非受控模式：维护内部 state
- 统一的 `handleValueChange` 接口对外

**使用场景**：
- 表单组件（受控）：配合 form state 使用
- 独立组件（非受控）：只传 onChange 回调

##### 2. useCategoryData.ts

**职责**：分类数据的获取和刷新

**实现细节**：
- 组件挂载时自动调用 `getCategoriesForEditor()` 获取数据
- 提供 `refresh()` 方法供外部刷新
- 维护 `isLoading` 状态
- 错误处理和消息提示

**依赖**：
- `@/actions/category` 的 `getCategoriesForEditor` 服务端操作
- `@/utils/message-info` 的 `message` 消息提示

##### 3. useCategorySearch.ts

**职责**：搜索逻辑和分类过滤

**核心优化**：
```typescript
const filteredCategories = useMemo(() => {
  if (!searchQuery.trim()) return categories;

  const query = searchQuery.toLowerCase();
  return categories.filter(
    (cat) => cat.name.toLowerCase().includes(query) ||
             cat.slug.toLowerCase().includes(query)
  );
}, [categories, searchQuery]);
```

**性能考虑**：
- 使用 `useMemo` 缓存过滤结果
- 只在 categories 或 searchQuery 变化时重新计算
- 避免每次渲染都执行过滤操作

##### 4. useDropdownState.ts

**职责**：下拉框的打开/关闭状态管理

**特性**：
- 点击外部自动关闭（使用 `mousedown` 事件）
- 提供 containerRef 用于判断点击区域
- 关闭时触发 `onClose` 回调（用于清空搜索）

**实现要点**：
```typescript
useEffect(() => {
  if (!isOpen) return;

  const handleClickOutside = (event: MouseEvent) => {
    if (containerRef.current &&
        !containerRef.current.contains(event.target as Node)) {
      close();
    }
  };

  document.addEventListener("mousedown", handleClickOutside);
  return () => document.removeEventListener("mousedown", handleClickOutside);
}, [isOpen, close]);
```

##### 5. useCategoryActions.ts

**职责**：分类的 CRUD 操作

**方法**：
- `createCategory(name, slug)` - 创建分类
- `updateCategory(id, name, slug)` - 更新分类
- `deleteCategory(category)` - 删除分类

**特点**：
- 操作成功后自动调用 `onRefresh()` 刷新列表
- 创建成功后触发 `onSuccess()` 回调（用于自动选中）
- 统一的错误处理和消息提示

#### 🎨 UI 组件层

##### CategoryInput

**职责**：输入框和搜索交互

**核心交互逻辑**：
```typescript
// 显示值：打开时显示搜索词，关闭时显示选中值
const displayValue = isOpen ? searchQuery : value;

// placeholder：打开时显示选中值作为提示
const displayPlaceholder = isOpen
  ? (value ? `${value}` : "搜索分类...")
  : (value ? "" : placeholder);
```

**解决的问题**：
- ❌ 旧版：打开下拉时，输入框显示选中值，用户需要手动清空才能搜索
- ✅ 新版：打开下拉时，输入框清空，选中值显示在 placeholder，可直接输入搜索

**子组件**：
- `InputActions`：管理右侧按钮（清空选中值、清空搜索、搜索图标）

##### CategoryDropdown

**职责**：下拉菜单容器和分类列表

**状态管理**：
- 内部维护 `deletingId` 状态（哪个分类正在删除确认中）
- 使用 `selectedItemRef` 实现自动滚动到选中项

**子组件**：
- `Header` - 新增分类按钮
- `CategoryItem` - 单个分类项（带编辑/删除按钮）
- `DeleteConfirmation` - 删除确认 UI
- `LoadingState` - 加载状态
- `EmptyState` - 空状态
- `Footer` - 统计信息

**渲染逻辑**：
```
isLoading ? LoadingState
: isEmpty ? EmptyState
: CategoryList
```

##### CategoryDialog

**职责**：对话框组件（创建和编辑）

**设计模式**：
- `BaseDialog` - 抽象公共逻辑（标题、关闭、提交按钮、ESC 键）
- `DialogForm` - 复用的表单组件
- `CreateDialog` - 基于 BaseDialog 的创建对话框
- `EditDialog` - 基于 BaseDialog 的编辑对话框

**表单验证**：
```typescript
const validate = () => {
  if (!name.trim()) return "请输入分类名称";
  if (!slug.trim()) return "请输入 slug";
  if (!/^[a-z0-9-]+$/.test(slug)) return "Slug 格式错误";
  return null;
};
```

**特性**：
- ESC 键关闭
- 提交中禁用关闭和背景点击
- 表单验证
- 自动重置状态

---

## 核心概念

### 1. 受控 vs 非受控模式

#### 受控模式

组件的值完全由父组件控制：

```tsx
const [category, setCategory] = useState("");

<CategorySelector
  value={category}           // 父组件控制值
  onChange={setCategory}     // 父组件更新值
/>
```

**特点**：
- 父组件完全掌控状态
- 适合表单场景，便于统一管理

#### 非受控模式

组件自己管理内部状态：

```tsx
<CategorySelector
  defaultValue="技术"        // 仅初始值
  onChange={(value) => {     // 仅接收通知
    console.log(value);
  }}
/>
```

**特点**：
- 组件内部维护状态
- 适合独立场景，减少父组件复杂度

**判断逻辑**：
```typescript
const isControlled = value !== undefined;
```

### 2. 搜索过滤优化

使用 `useMemo` 避免不必要的计算：

```typescript
const filteredCategories = useMemo(() => {
  // 仅在 categories 或 searchQuery 变化时重新计算
  return categories.filter(/* ... */);
}, [categories, searchQuery]);
```

**性能对比**：
- ❌ 不使用 useMemo：每次渲染都过滤（O(n)）
- ✅ 使用 useMemo：仅依赖变化时过滤

### 3. 组件通信模式

```
主组件 (index.tsx)
  ├─> CategoryInput (输入和搜索)
  │     └─> InputActions (操作按钮)
  │
  ├─> CategoryDropdown (下拉菜单)
  │     ├─> Header (新增按钮)
  │     ├─> CategoryItem (分类项)
  │     │     └─> DeleteConfirmation (删除确认)
  │     └─> Footer (统计信息)
  │
  └─> Dialogs (对话框)
        ├─> CreateDialog
        └─> EditDialog
              └─> BaseDialog (公共逻辑)
                    └─> DialogForm (表单)
```

**通信方式**：
- 父 → 子：通过 props 传递数据和回调
- 子 → 父：通过回调函数通知事件
- 兄弟组件：通过共同的父组件状态

### 4. 状态提升策略

**原则**：状态应该放在**最小公共父组件**中

**示例**：
- `deletingId` 状态放在 `CategoryDropdown` 中（只有它需要）
- `editingCategory` 状态放在主组件中（对话框和列表都需要）
- `categories` 数据放在主组件中（多个子组件需要）

---

## 开发指南

### 添加新功能

#### 1. 添加批量删除功能

**步骤**：

1. **扩展类型定义**（types.ts）：
```typescript
export interface UseCategoryActionsReturn {
  // ... 现有方法
  batchDelete: (categoryIds: string[]) => Promise<void>;
}
```

2. **扩展 useCategoryActions**（hooks/useCategoryActions.ts）：
```typescript
const batchDelete = useCallback(async (categoryIds: string[]) => {
  const result = await batchDeleteCategories(categoryIds);
  if (result.success) {
    message.success("批量删除成功");
    await onRefresh();
  }
}, [onRefresh]);

return { /* ... */, batchDelete };
```

3. **修改 CategoryDropdown**：
- 添加复选框
- 添加批量操作工具栏
- 调用 `onBatchDelete` 回调

4. **修改主组件**：
```typescript
const handleBatchDelete = useCallback(async (ids: string[]) => {
  await actions.batchDelete(ids);
  // 如果删除了当前选中的分类，清空选择
  if (ids.includes(currentCategoryId)) {
    handleClear();
  }
}, [actions, currentCategoryId, handleClear]);
```

#### 2. 添加拖拽排序功能

**建议方案**：

1. 安装依赖：`npm install @dnd-kit/core @dnd-kit/sortable`

2. 创建新组件 `components/CategoryDropdown/SortableCategoryList.tsx`

3. 扩展 `useCategoryActions` 添加 `reorderCategories` 方法

4. 在 CategoryDropdown 中集成拖拽功能

### 修改现有功能

#### 修改搜索逻辑

**场景**：支持拼音搜索

**位置**：`hooks/useCategorySearch.ts`

```typescript
import pinyin from "pinyin";

const filteredCategories = useMemo(() => {
  if (!searchQuery.trim()) return categories;

  const query = searchQuery.toLowerCase();
  return categories.filter((cat) => {
    const nameMatch = cat.name.toLowerCase().includes(query);
    const slugMatch = cat.slug.toLowerCase().includes(query);

    // 添加拼音搜索
    const pinyinMatch = pinyin(cat.name, { style: pinyin.STYLE_NORMAL })
      .flat()
      .join("")
      .includes(query);

    return nameMatch || slugMatch || pinyinMatch;
  });
}, [categories, searchQuery]);
```

#### 修改样式

**Tailwind 样式位置**：
- 输入框：`components/CategoryInput/index.tsx`
- 下拉菜单：`components/CategoryDropdown/*.tsx`
- 对话框：`components/CategoryDialog/*.tsx`

**修改原则**：
- 保持 dark mode 兼容性
- 使用 Tailwind 工具类，避免自定义 CSS
- 保持一致的过渡动画（`transition-all duration-200`）

### 调试技巧

#### 1. 查看组件状态

在主组件中添加调试输出：

```typescript
useEffect(() => {
  console.log("CategorySelector State:", {
    currentValue,
    isOpen,
    searchQuery,
    categoriesCount: categories.length,
    filteredCount: filteredCategories.length,
  });
}, [currentValue, isOpen, searchQuery, categories, filteredCategories]);
```

#### 2. 追踪 Hook 调用

在各个 hook 中添加日志：

```typescript
// useCategoryData.ts
const fetchCategories = useCallback(async () => {
  console.log("[useCategoryData] Fetching categories...");
  // ...
  console.log("[useCategoryData] Fetched:", result.data?.length);
}, []);
```

#### 3. 性能分析

使用 React DevTools Profiler：
1. 打开 React DevTools
2. 切换到 Profiler 标签
3. 录制交互过程
4. 查看渲染时间和次数

**关注指标**：
- 搜索输入时的渲染次数（应该很少）
- useMemo 是否生效（filteredCategories 应该缓存）
- 子组件是否不必要重渲染（应该被 memo 阻止）

---

## API 文档

### CategorySelector Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `value` | `string` | - | 受控模式：当前选中的分类名称 |
| `onChange` | `(category: string) => void` | - | 值变化回调 |
| `defaultValue` | `string` | `""` | 非受控模式：初始选中的分类名称 |
| `placeholder` | `string` | `"选择分类"` | 占位符文本 |
| `required` | `boolean` | `false` | 是否必填（显示必填提示） |
| `allowClear` | `boolean` | `false` | 是否显示清空按钮 |
| `className` | `string` | `""` | 自定义容器样式类名 |
| `disabled` | `boolean` | `false` | 是否禁用 |

### Hooks API

#### useControlledValue

```typescript
const [value, setValue] = useControlledValue({
  value?: string;           // 受控值
  defaultValue?: string;    // 非受控初始值
  onChange?: (v: string) => void;  // 变化回调
});
```

#### useCategoryData

```typescript
const { categories, isLoading, refresh } = useCategoryData();

// categories: ICategory[]     - 分类列表
// isLoading: boolean          - 加载状态
// refresh: () => Promise<void> - 刷新方法
```

#### useCategorySearch

```typescript
const {
  searchQuery,           // string - 搜索词
  setSearchQuery,        // (q: string) => void - 设置搜索词
  filteredCategories,    // ICategory[] - 过滤后的分类
  hasSearchQuery,        // boolean - 是否有搜索词
  clearSearch,           // () => void - 清空搜索
} = useCategorySearch(categories);
```

#### useDropdownState

```typescript
const {
  isOpen,          // boolean - 是否打开
  open,            // () => void - 打开
  close,           // () => void - 关闭
  toggle,          // () => void - 切换
  containerRef,    // RefObject<HTMLDivElement> - 容器引用
} = useDropdownState(onClose);
```

#### useCategoryActions

```typescript
const {
  createCategory,    // (name: string, slug: string) => Promise<void>
  updateCategory,    // (id: string, name: string, slug: string) => Promise<void>
  deleteCategory,    // (category: ICategory) => Promise<void>
} = useCategoryActions(onRefresh, onSuccess);
```

### 类型定义

```typescript
// 分类接口（来自 @/types/category）
interface ICategory {
  _id: string;
  name: string;
  slug: string;
  articleCount: number;
}
```

---

## 常见问题

### Q1: 为什么搜索时输入框显示的是搜索词而不是选中值？

**A**: 这是经过优化的交互设计。

**旧版问题**：
- 打开下拉框时，输入框显示已选中的值（如 "技术"）
- 用户想搜索时，需要先删除 "技术"，才能输入搜索词
- 体验不佳，增加操作步骤

**新版改进**：
- 打开下拉框时，输入框清空，可直接输入搜索
- 已选中的值显示在 placeholder 中作为提示
- 用户可以立即开始搜索，无需额外操作

**实现位置**：`components/CategoryInput/index.tsx:45-48`

### Q2: 为什么移除了快速创建功能？

**A**: 为了保证数据质量和一致性。

**问题**：
- 快速创建时，slug 是自动生成的
- 用户要求不需要自动生成 slug
- 保留快速创建会导致 slug 生成逻辑冗余

**解决方案**：
- 只保留通过对话框创建分类
- 用户必须手动输入 name 和 slug
- 确保 slug 符合规范（小写字母、数字、连字符）

**如需恢复**：
1. 在 `useCategoryActions` 中添加 `quickCreate` 方法
2. 在 `EmptyState` 组件中添加快速创建按钮
3. 实现 slug 自动生成逻辑

### Q3: 如何自定义样式？

**A**: 通过 className 和 Tailwind 覆盖。

```tsx
<CategorySelector
  className="my-custom-selector"
  // ...
/>
```

然后在你的样式文件中：

```css
.my-custom-selector {
  /* 自定义样式 */
}
```

**或者直接修改组件内的 Tailwind 类**：
- 输入框：`components/CategoryInput/index.tsx`
- 下拉菜单：`components/CategoryDropdown/index.tsx`

### Q4: 如何禁用编辑/删除功能？

**A**: 修改 `CategoryItem` 组件，添加 props 控制。

```typescript
// 1. 修改 CategoryItem props
interface CategoryItemProps {
  // ... 现有 props
  disableEdit?: boolean;
  disableDelete?: boolean;
}

// 2. 条件渲染按钮
{!disableEdit && (
  <button onClick={onEdit}>
    <Edit className="h-3.5 w-3.5" />
  </button>
)}
```

### Q5: 如何限制分类数量？

**A**: 在 `useCategoryActions` 的 `createCategory` 中添加检查。

```typescript
const createCategory = useCallback(async (name: string, slug: string) => {
  // 检查数量限制
  if (categories.length >= MAX_CATEGORIES) {
    message.error(`最多只能创建 ${MAX_CATEGORIES} 个分类`);
    return;
  }

  // 继续创建...
}, [categories]);
```

### Q6: 如何集成到表单库（如 React Hook Form）？

**A**: 使用受控模式。

```tsx
import { useForm, Controller } from "react-hook-form";

function MyForm() {
  const { control } = useForm();

  return (
    <Controller
      name="category"
      control={control}
      rules={{ required: "请选择分类" }}
      render={({ field }) => (
        <CategorySelector
          value={field.value}
          onChange={field.onChange}
          required
        />
      )}
    />
  );
}
```

---

## 扩展建议

### 短期优化（1-2天）

1. **添加键盘导航**
   - 上下箭头键选择分类
   - Enter 键确认选择
   - 实现位置：`CategoryDropdown`

2. **搜索历史**
   - 记录最近搜索的分类
   - 使用 localStorage 持久化
   - 实现位置：新建 `hooks/useSearchHistory.ts`

3. **分类图标**
   - 为每个分类添加图标
   - 修改 `ICategory` 类型添加 `icon` 字段
   - 在 `CategoryItem` 中显示图标

4. **虚拟滚动**
   - 当分类数量很多时优化性能
   - 使用 `react-window` 或 `react-virtual`
   - 实现位置：`CategoryDropdown/CategoryList.tsx`

### 中期优化（1周）

1. **拖拽排序**
   - 使用 `@dnd-kit/core` 实现
   - 添加 `order` 字段到 `ICategory`
   - 实现位置：新建 `CategoryDropdown/SortableCategoryList.tsx`

2. **批量操作**
   - 批量删除
   - 批量编辑（修改父分类、标签等）
   - 添加选择模式切换

3. **高级搜索**
   - 按文章数量过滤
   - 按创建时间排序
   - 拼音搜索支持

4. **分类统计**
   - 显示每个分类的文章数量
   - 显示分类的创建时间
   - 显示最后更新时间

### 长期优化（1个月）

1. **多级分类**
   - 支持父子关系
   - 树形结构展示
   - 递归组件设计

2. **分类分组**
   - 技术分类、生活分类等
   - 分组折叠/展开
   - 分组管理

3. **智能推荐**
   - 根据文章内容推荐分类
   - 使用 AI 分析文章并建议分类
   - 实现位置：新建 `hooks/useCategoryRecommendation.ts`

4. **导入导出**
   - 导出分类列表为 JSON/CSV
   - 从文件导入分类
   - 批量创建分类

### 架构优化

1. **状态管理库**
   - 如果应用复杂度增加，考虑使用 Zustand 或 Jotai
   - 将分类数据放入全局状态
   - 减少 props drilling

2. **测试覆盖**
   - 使用 Vitest + React Testing Library
   - 为每个 hook 编写单元测试
   - 为关键交互编写集成测试

3. **国际化**
   - 使用 `next-intl` 或 `react-i18next`
   - 提取所有文本到语言文件
   - 支持多语言切换

4. **无障碍性增强**
   - 完整的 ARIA 属性
   - 键盘导航
   - 屏幕阅读器优化
   - 遵循 WAI-ARIA 规范

---

## 贡献指南

### 代码规范

1. **命名约定**
   - 组件：PascalCase（如 `CategoryInput`）
   - Hooks：camelCase + use 前缀（如 `useCategoryData`）
   - 文件：与导出的组件/hook 同名

2. **TypeScript**
   - 所有 props 必须定义类型
   - 避免使用 `any`
   - 优先使用 `interface` 而非 `type`

3. **注释**
   - 每个组件/hook 必须有 JSDoc 注释
   - 复杂逻辑必须添加行内注释
   - 使用中文注释

4. **样式**
   - 优先使用 Tailwind 工具类
   - 避免内联样式
   - 保持 dark mode 兼容性

### 提交规范

```bash
# 格式
<type>(<scope>): <subject>

# 示例
feat(CategorySelector): 添加拖拽排序功能
fix(CategorySelector): 修复搜索时的滚动问题
docs(CategorySelector): 更新 README 文档
refactor(CategorySelector): 重构 useCategoryActions hook
```

**type 类型**：
- `feat` - 新功能
- `fix` - 修复 bug
- `docs` - 文档更新
- `style` - 代码格式调整
- `refactor` - 重构
- `test` - 测试相关
- `chore` - 构建/工具相关

---

## 版本历史

### v2.0.0 (2025-11-25)

**重大重构**：
- ✨ 完全模块化重构，拆分为 20+ 个文件
- ✨ 优化搜索交互体验
- 🗑️ 移除快速创建功能
- ⚡ 性能优化（useMemo、useCallback、memo）
- 📝 完整的 TypeScript 类型定义
- 🎨 统一的对话框基础组件

**代码统计**：
- 主组件：519 行 → 170 行（减少 67%）
- 总代码量：519 行 → 1187 行（模块化后）
- 单文件最大行数：170 行（主组件）

### v1.0.0 (之前)

- 单文件实现（519 行）
- 支持搜索、创建、编辑、删除
- 快速创建功能
- 基础的受控/非受控支持

---

## 许可证

本组件是 sleepy-blog 项目的一部分。

---

## 联系方式

如有问题或建议，请：
- 提交 Issue
- 查看项目文档
- 联系维护者

---

**最后更新**：2025-11-25
**维护者**：Claude Code
**版本**：v2.0.0
