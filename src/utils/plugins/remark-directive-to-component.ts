import type { Root } from "mdast";
import type { ContainerDirective, LeafDirective, TextDirective } from "mdast-util-directive";
import type { Plugin } from "unified";
import { visit } from "unist-util-visit";

type DirectiveNode = TextDirective | LeafDirective | ContainerDirective;

// hast 转换数据类型（unified 生态系统约定）
interface HastData {
  hName?: string;
  hProperties?: Record<string, unknown>;
}

/**
 * remark 插件：将指令节点映射为 JSX 组件
 *
 * 此插件依赖 remark-directive 先解析指令语法
 * 然后将解析后的指令节点转换为可以被 MDX 渲染的 JSX 组件
 *
 * 支持三种指令类型：
 * - textDirective: :name[label]{attrs}  → 行内组件
 * - leafDirective: ::name{attrs}        → 块级无子元素组件
 * - containerDirective: :::name{attrs}  → 块级有子元素组件
 *
 * @example
 * ```markdown
 * :highlight[重要文本]{color=yellow}
 * ::ImageCard{src="/img.png" alt="图片"}
 * :::Callout{type=info}
 * 这是内容
 * :::
 * ```
 */
const remarkDirectiveToComponent: Plugin<[], Root> = () => {
  return (tree: Root) => {
    visit(tree, (node) => {
      if (
        node.type === "textDirective" ||
        node.type === "leafDirective" ||
        node.type === "containerDirective"
      ) {
        const directive = node as DirectiveNode;
        const data = (directive.data || (directive.data = {})) as HastData;

        // 将指令名转换为组件名（保持首字母大写）
        // 例如: :highlight -> Highlight, ::imageCard -> ImageCard
        const componentName = directive.name.charAt(0).toUpperCase() + directive.name.slice(1);

        // 设置 hName 为组件名，MDX 渲染器会将其识别为 JSX 组件
        data.hName = componentName;

        // 将指令属性传递给组件
        data.hProperties = {
          ...directive.attributes,
        };
      }
    });
  };
};

export default remarkDirectiveToComponent;
