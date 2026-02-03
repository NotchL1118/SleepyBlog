import type { Root, Text } from "mdast";
import type { Plugin } from "unified";
import { visit } from "unist-util-visit";

/**
 * Remark plugin to replace -> with → (rightward arrow)
 *
 * This plugin traverses the markdown AST and replaces all occurrences
 * of "->" with the Unicode arrow character "→" in text nodes only.
 * Code blocks and inline code are automatically excluded.
 */
const remarkArrowReplacement: Plugin<[], Root> = () => {
  return (tree: Root) => {
    visit(tree, "text", (node: Text) => {
      // Replace all -> with →
      node.value = node.value.replace(/->/g, "→");
    });
  };
};

export default remarkArrowReplacement;
