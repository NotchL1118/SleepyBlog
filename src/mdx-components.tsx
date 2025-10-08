import type { MDXComponents } from "mdx/types";
import { CodeBlock, Highlight, ImageCard } from "./components/MDX";

// 导出组件配置对象
export const mdxComponents: MDXComponents = {
  // 自定义组件
  ImageCard,
  Highlight,
  // 增强的默认HTML元素
  h1: ({ children }) => (
    <h1 className="mb-6 mt-8 text-4xl font-bold text-gray-900 first:mt-0 dark:text-gray-100">{children}</h1>
  ),
  h2: ({ children }) => (
    <h2 className="mb-4 mt-8 border-b border-gray-200 pb-2 text-3xl font-semibold text-gray-900 first:mt-0 dark:border-gray-700 dark:text-gray-100">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="mb-3 mt-6 text-2xl font-semibold text-gray-900 first:mt-0 dark:text-gray-100">{children}</h3>
  ),
  h4: ({ children }) => (
    <h4 className="mb-2 mt-4 text-xl font-semibold text-gray-900 first:mt-0 dark:text-gray-100">{children}</h4>
  ),
  p: ({ children }) => <p className="mb-4 leading-relaxed text-gray-700 dark:text-gray-300">{children}</p>,
  // 将 img 标签映射到 ImageCard 组件
  img: ({ src, alt, title, width, height, description, ...props }) => (
    <ImageCard
      src={src || ""}
      alt={alt || ""}
      title={title}
      description={(props["data-description"] as string) || description}
      width={width ? Number(width) : undefined}
      height={height ? Number(height) : undefined}
      className={props.className as string}
    />
  ),
  ul: ({ children }) => (
    <ul className="mb-4 list-inside list-disc space-y-2 text-gray-700 dark:text-gray-300">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol
      // tailwindcss清空默认样式的优先级太高了,设置class不生效,所以用style
      style={{ listStyleType: "decimal", listStylePosition: "inside" }}
      className="mb-4 space-y-2 pl-6 text-gray-700 marker:font-semibold marker:text-blue-600 dark:text-gray-300 dark:marker:text-blue-400"
    >
      {children}
    </ol>
  ),
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  code: ({ className, children, ...props }) => {
    // 如果是在 pre 标签内的代码块（即 ```language 格式的代码块）
    // 这种情况会被 pre 组件处理，这里只处理行内代码
    if (!className) {
      return (
        <code
          className="font-mono rounded bg-gray-100 px-1.5 py-0.5 text-sm text-gray-800 dark:bg-gray-800 dark:text-gray-200"
          {...props}
        >
          {children}
        </code>
      );
    }
    // 如果有 className，说明是代码块，返回 children 让 pre 组件处理
    return (
      <code className={className} {...props}>
        {children}
      </code>
    );
  },
  pre: ({ children, ...props }) => {
    // 检查是否是代码块（包含 code 元素且有 language- 类名）
    if (
      children &&
      typeof children === "object" &&
      children.props &&
      children.props.className &&
      children.props.className.includes("language-")
    ) {
      const language = children.props.className.replace("language-", "");
      const code =
        typeof children.props.children === "string" ? children.props.children : String(children.props.children || "");

      // 移除代码末尾的换行符
      const cleanCode = code.replace(/\n$/, "");

      return <CodeBlock language={language}>{cleanCode}</CodeBlock>;
    }

    // 如果不是代码块，使用随主题变化的样式
    return (
      <pre
        className="my-6 overflow-x-auto rounded-lg border border-gray-200 bg-gray-50 p-4 text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
        {...props}
      >
        {children}
      </pre>
    );
  },
  a: ({ href, children }) => (
    <a
      href={href}
      className="text-blue-600 underline decoration-blue-500 underline-offset-2 transition-colors hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
      target={href?.startsWith("http") ? "_blank" : undefined}
      rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
    >
      {children}
    </a>
  ),
  strong: ({ children }) => <strong className="font-semibold text-gray-900 dark:text-gray-100">{children}</strong>,
  em: ({ children }) => <em className="italic text-gray-800 dark:text-gray-200">{children}</em>,
  hr: () => <hr className="my-8 border-gray-300 dark:border-gray-600" />,
  table: ({ children }) => (
    <div className="my-6 overflow-x-auto">
      <table className="min-w-full rounded-lg border border-gray-200 dark:border-gray-700">{children}</table>
    </div>
  ),
  thead: ({ children }) => <thead className="bg-gray-50 dark:bg-gray-800">{children}</thead>,
  tbody: ({ children }) => <tbody className="divide-y divide-gray-200 dark:divide-gray-700">{children}</tbody>,
  tr: ({ children }) => <tr className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-800">{children}</tr>,
  th: ({ children }) => (
    <th className="border-b border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:border-gray-700 dark:text-gray-100">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="border-b border-gray-200 px-4 py-3 text-sm text-gray-700 dark:border-gray-700 dark:text-gray-300">
      {children}
    </td>
  ),
};

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...mdxComponents,
    ...components,
  };
}
