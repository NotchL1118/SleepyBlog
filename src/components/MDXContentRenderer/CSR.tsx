/**
 * CustomMDXRemote Client Version
 *
 * 此组件用于在客户端渲染预编译的 MDX 内容
 * 使用 next-mdx-remote-client/csr 的 MDXClient 组件
 *
 * 使用场景：
 * - ArticlePreviewModal（预览弹窗）
 * - 其他需要在 Client Component 中渲染 MDX 的场景
 */

"use client";

import { mdxComponents } from "@/mdx-components";
import { MDXClient, type SerializeResult } from "next-mdx-remote-client/csr";
import ErrorComponent from "./ErrorComponent";

interface CustomMDXRemoteClientProps {
  mdxSource: SerializeResult<Record<string, unknown>, Record<string, unknown>>;
}

export default function CustomMDXRemoteClient({ mdxSource }: CustomMDXRemoteClientProps) {
  // 检查是否有错误
  if ("error" in mdxSource) {
    return <ErrorComponent error={mdxSource.error} />;
  }

  // 渲染 MDX 内容
  return <MDXClient {...mdxSource} components={mdxComponents} onError={ErrorComponent} />;
}
