/**
 * Remark plugin to preserve the start attribute for ordered lists
 *
 * By default, remark-gfm follows the standard markdown behavior of
 * renumbering lists sequentially. This plugin preserves the explicit
 * start numbers written in the markdown source by adding the start
 * attribute to the HTML output via hProperties.
 */
import { visit } from "unist-util-visit";
import type { List, Root } from "mdast";

/**
 * Remark plugin that preserves the start attribute for ordered lists
 */
export function remarkPreserveListStart() {
  return (tree: Root) => {
    visit(tree, "list", (node: List) => {
      // Only process ordered lists with a start value other than 1
      if (node.ordered && node.start !== null && node.start !== undefined && node.start !== 1) {
        // Initialize data and hProperties if they don't exist
        const data = node.data || (node.data = {});
        const hProperties = data.hProperties || (data.hProperties = {});

        // Add the start attribute to be passed to the HTML element
        (hProperties as Record<string, unknown>).start = node.start;
      }
    });
  };
}
