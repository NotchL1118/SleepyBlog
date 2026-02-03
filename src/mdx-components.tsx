import type { MDXComponents } from "mdx/types";
import { Blockquote, CodeBlock, ImageCard } from "./components/MDX";

// 导出组件配置对象
export const mdxComponents: MDXComponents = {
  // 自定义组件
  // 增强的默认HTML元素
  h1: ({ children, ...rest }) => (
    <h1 {...rest} className="mb-4 mt-6 text-4xl font-bold text-foreground first:mt-0">
      {children}
    </h1>
  ),
  h2: ({ children, ...rest }) => (
    <h2
      {...rest}
      className="mb-2 mt-6 border-b border-border pb-2 text-3xl font-semibold text-foreground first:mt-0"
    >
      {children}
    </h2>
  ),
  h3: ({ children, ...rest }) => (
    <h3 {...rest} className="mb-2 mt-4 text-2xl font-semibold text-foreground first:mt-0">
      {children}
    </h3>
  ),
  h4: ({ children, ...rest }) => (
    <h4 {...rest} className="mb-2 mt-4 text-xl font-semibold text-foreground first:mt-0">
      {children}
    </h4>
  ),
  p: ({ children }) => <p className="py-2 leading-relaxed text-foreground-muted">{children}</p>,
  img: ({ src, alt, title, width, height, description, ...props }) => {
    const { style, className, ...restProps } = props;
    return (
      <ImageCard
        src={src || ""}
        alt={alt || ""}
        title={title}
        description={(restProps["data-description"] as string) || description}
        width={width ? Number(width) : undefined}
        height={height ? Number(height) : undefined}
        className={className as string}
      />
    );
  },
  ul: ({ children }) => (
    <ul
      style={{ listStyleType: "disc", listStylePosition: "inside" }}
      className="mdx-list my-5 px-4 text-foreground-muted marker:text-accent"
    >
      {children}
    </ul>
  ),
  ol: ({ children, start, ...props }: React.ComponentPropsWithoutRef<"ol">) => (
    <ol
      start={start}
      // tailwindcss清空默认样式的优先级太高了,设置class不生效,所以用style
      style={{ listStyleType: "decimal", listStylePosition: "inside" }}
      className="mdx-list my-5 pl-6 text-foreground-muted marker:font-semibold marker:text-accent"
      {...props}
    >
      {children}
    </ol>
  ),
  li: ({ children }) => <li className="py-2 leading-relaxed">{children}</li>,
  code: ({ className, children, ...props }) => {
    // 如果是在 pre 标签内的代码块（即 ```language 格式的代码块）
    // 这种情况会被 pre 组件处理，这里只处理行内代码
    if (!className) {
      return (
        <code className="rounded bg-code-background px-1.5 py-0.5 font-mono text-sm text-code-text" {...props}>
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
  pre: ({ children }) => {
    const language = children.props?.className?.replace("language-", "") || "javascript";
    const code =
      typeof children.props.children === "string" ? children.props.children : String(children.props.children || "");
    const cleanCode = code.replace(/\n$/, "");

    return <CodeBlock code={cleanCode} language={language} />;
  },
  a: ({ href, children }) => (
    <a
      href={href}
      className="text-primary underline decoration-primary underline-offset-2 transition-colors hover:text-primary-hover"
      target={href?.startsWith("http") ? "_blank" : undefined}
      rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
    >
      {children}
    </a>
  ),
  strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
  em: ({ children }) => <em className="italic text-foreground">{children}</em>,
  hr: () => <hr className="my-8 border-border-muted" />,
  table: ({ children }) => (
    <div className="my-6 overflow-x-auto">
      <table className="min-w-full rounded-lg border border-border">{children}</table>
    </div>
  ),
  thead: ({ children }) => <thead className="bg-background-elevated">{children}</thead>,
  tbody: ({ children }) => <tbody className="divide-y divide-border">{children}</tbody>,
  tr: ({ children }) => <tr className="transition-colors hover:bg-background-elevated">{children}</tr>,
  th: ({ children }) => (
    <th className="border-b border-border px-4 py-3 text-left text-sm font-semibold text-foreground">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="border-b border-border px-4 py-3 text-sm text-foreground-muted">
      {children}
    </td>
  ),
  blockquote: ({ children }) => <Blockquote>{children}</Blockquote>,
};

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...mdxComponents,
    ...components,
  };
}
