/**
 * MDXContentRenderer Server Component Version
 *
 * 此组件用于在客户端渲染预编译的 MDX 内容
 * 使用 next-mdx-remote-client/rsc 的 MDXRemote 组件
 *
 * 使用场景：
 * - 文章预览 这时候需要预览的是可以正确编译的文章内容
 * - 其他需要在 Server Component 中渲染 MDX 的场景
 */

import { mdxComponents } from "@/mdx-components";
import remarkDirectiveToComponent from "@/utils/plugins/remark-directive-to-component";
import { MDXRemote } from "next-mdx-remote-client/rsc";
import remarkDirective from "remark-directive";
import remarkGfm from "remark-gfm";
import ErrorComponent from "./ErrorComponent";

export default function CustomMDXRemote({ source }: { source: string }) {
  return (
    <MDXRemote
      source={source}
      options={{
        mdxOptions: {
          remarkPlugins: [remarkGfm, remarkDirective, remarkDirectiveToComponent],
        },
      }}
      components={mdxComponents}
      onError={ErrorComponent}
    />
  );
}
