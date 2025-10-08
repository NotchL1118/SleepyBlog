/**
 * HTML转义函数，将危险字符转换为安全的HTML实体
 * 智能跳过代码块内容（```代码块``` 和 `内联代码`），只转义非代码区域
 *
 * @param text - 需要转义的原始文本字符串
 * @returns 转义后的安全HTML字符串，代码块内容保持原样
 *
 * @example
 * ```typescript
 * // 基本HTML转义
 * const safe = escapeHTML('<script>alert("xss")</script>');
 * // 返回: '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;'
 *
 * // 保护代码块不被转义
 * const markdown = escapeHTML('这是 `<code>` 和 ```\n<script>\n```');
 * // 代码块内的 <script> 不会被转义
 *
 * // 处理引号
 * const quoted = escapeHTML('He said "Hello" & \'Goodbye\'');
 * // 返回: 'He said &quot;Hello&quot; &amp; &#x27;Goodbye&#x27;'
 * ```
 *
 * @since 1.0.0
 */
// HTML转义函数，将危险字符转换为安全的HTML实体
// 智能跳过代码块内容（```代码块``` 和 `内联代码`），只转义非代码区域
export function escapeHTML(text: string): string {
  const entityMap: { [key: string]: string } = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#x27;",
  };

  // 快速路径：如果没有代码标记，直接转义
  if (!text.includes("`")) {
    return text.replace(/[&<>"']/g, (char) => entityMap[char] || char);
  }

  // 使用正则表达式匹配代码块和内联代码
  // 匹配 ```...``` 或 `...` 的模式
  const codePattern = /(```[\s\S]*?```|`[^`]*?`)/g;

  let lastIndex = 0;
  const segments: string[] = [];
  let match;

  // 使用正则表达式找到所有代码块
  while ((match = codePattern.exec(text)) !== null) {
    // 转义代码块之前的普通文本
    if (match.index > lastIndex) {
      const normalText = text.substring(lastIndex, match.index);
      segments.push(normalText.replace(/[&<>"']/g, (char) => entityMap[char] || char));
    }

    // 保持代码块原样
    segments.push(match[0]);
    lastIndex = match.index + match[0].length;
  }

  // 处理最后一段普通文本
  if (lastIndex < text.length) {
    const normalText = text.substring(lastIndex);
    segments.push(normalText.replace(/[&<>"']/g, (char) => entityMap[char] || char));
  }

  return segments.join("");
}
