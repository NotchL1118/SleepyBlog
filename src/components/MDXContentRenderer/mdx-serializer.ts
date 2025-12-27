/**
 * MDX Serializer - 用于在服务器端预编译 MDX 内容
 *
 * 此模块提供辅助函数，使用 next-mdx-remote-client/serialize
 * 在服务器端将 markdown 编译为可在客户端使用的格式
 */
import remarkDirectiveToComponent from "@/utils/plugins/remark-directive-to-component";
import { serialize, type SerializeResult } from "next-mdx-remote-client/serialize";
import remarkDirective from "remark-directive";
import remarkGfm from "remark-gfm";
/**
 * 将 markdown 源码序列化为可在客户端使用的编译源码
 *
 * @param source - Markdown/MDX 源码字符串
 * @returns SerializeResult - 包含 compiledSource 或 error
 */
export async function serializeMDX(
  source: string
): Promise<SerializeResult<Record<string, unknown>, Record<string, unknown>>> {
  const result = await serialize({
    source,
    options: {
      mdxOptions: {
        remarkPlugins: [remarkGfm, remarkDirective, remarkDirectiveToComponent],
      },
      parseFrontmatter: false, // 文章的 frontmatter 已经在数据库中处理
      disableImports: true, // 客户端不支持 import statements
    },
  });

  return result;
}
