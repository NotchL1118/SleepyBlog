/**
 * Advanced reading time calculator with content-type weighting
 *
 * Features:
 * - Distinguishes between Chinese and English text
 * - Different reading speeds for different content types (code, tables, quotes)
 * - Removes Markdown syntax before calculation
 * - Adds time for images
 */

interface ReadingTimeDetails {
  minutes: number;
  words: number;
  chineseChars: number;
  englishWords: number;
  codeBlocks: number;
  tables: number;
  images: number;
  quotes: number;
}

/**
 * Reading speed constants (characters/words per minute)
 */
const READING_SPEEDS = {
  CHINESE_CHARS_PER_MIN: 400, // Chinese characters per minute
  ENGLISH_WORDS_PER_MIN: 200, // English words per minute
  SECONDS_PER_IMAGE: 12, // Time to view an image (seconds)
};

/**
 * Content type multipliers (applied to reading time)
 */
const CONTENT_MULTIPLIERS = {
  CODE: 1.5, // Code blocks take 50% longer to read
  TABLE: 1.3, // Tables take 30% longer to read
  QUOTE: 1.1, // Quotes take 10% longer to read
  LIST: 1.0, // Lists at normal speed
  NORMAL: 1.0, // Normal text
};

/**
 * Extract and remove code blocks from content
 */
function extractCodeBlocks(content: string): { content: string; codeBlocks: string[] } {
  const codeBlocks: string[] = [];
  const withoutCode = content.replace(/```[\s\S]*?```/g, (match) => {
    codeBlocks.push(match);
    return "";
  });
  return { content: withoutCode, codeBlocks };
}

/**
 * Extract and remove tables from content
 */
function extractTables(content: string): { content: string; tables: string[] } {
  const tables: string[] = [];
  const lines = content.split("\n");
  let currentTable: string[] = [];
  const remainingLines: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // Table row pattern: starts with |
    if (line.trim().startsWith("|")) {
      currentTable.push(line);
    } else {
      if (currentTable.length > 0) {
        tables.push(currentTable.join("\n"));
        currentTable = [];
      }
      remainingLines.push(line);
    }
  }

  if (currentTable.length > 0) {
    tables.push(currentTable.join("\n"));
  }

  return { content: remainingLines.join("\n"), tables };
}

/**
 * Extract and remove block quotes from content
 */
function extractQuotes(content: string): { content: string; quotes: string[] } {
  const quotes: string[] = [];
  const lines = content.split("\n");
  let currentQuote: string[] = [];
  const remainingLines: string[] = [];

  for (const line of lines) {
    if (line.trim().startsWith(">")) {
      currentQuote.push(line);
    } else {
      if (currentQuote.length > 0) {
        quotes.push(currentQuote.join("\n"));
        currentQuote = [];
      }
      remainingLines.push(line);
    }
  }

  if (currentQuote.length > 0) {
    quotes.push(currentQuote.join("\n"));
  }

  return { content: remainingLines.join("\n"), quotes };
}

/**
 * Count images in content
 */
function countImages(content: string): number {
  // Matches: ![alt](url) and <img src="..." />
  const mdImages = (content.match(/!\[.*?\]\(.*?\)/g) || []).length;
  const htmlImages = (content.match(/<img[^>]+>/gi) || []).length;
  return mdImages + htmlImages;
}

/**
 * Remove Markdown syntax from text
 */
function stripMarkdown(text: string): string {
  return (
    text
      // Remove HTML tags
      .replace(/<[^>]*>/g, "")
      // Remove images
      .replace(/!\[.*?\]\(.*?\)/g, "")
      // Remove links but keep text
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      // Remove bold/italic
      .replace(/\*\*\*([^*]+)\*\*\*/g, "$1")
      .replace(/\*\*([^*]+)\*\*/g, "$1")
      .replace(/\*([^*]+)\*/g, "$1")
      .replace(/___([^_]+)___/g, "$1")
      .replace(/__([^_]+)__/g, "$1")
      .replace(/_([^_]+)_/g, "$1")
      // Remove strikethrough
      .replace(/~~([^~]+)~~/g, "$1")
      // Remove inline code
      .replace(/`([^`]+)`/g, "$1")
      // Remove headings
      .replace(/^#{1,6}\s+/gm, "")
      // Remove horizontal rules
      .replace(/^[-*_]{3,}$/gm, "")
      // Remove blockquote markers
      .replace(/^>\s+/gm, "")
      // Remove list markers
      .replace(/^[\s]*[-*+]\s+/gm, "")
      .replace(/^[\s]*\d+\.\s+/gm, "")
      // Remove extra whitespace
      .replace(/\s+/g, " ")
      .trim()
  );
}

/**
 * Count Chinese characters in text
 */
function countChineseChars(text: string): number {
  // Match Chinese characters (CJK Unified Ideographs)
  const chineseChars = text.match(/[\u4e00-\u9fa5]/g);
  return chineseChars ? chineseChars.length : 0;
}

/**
 * Count English words in text
 */
function countEnglishWords(text: string): number {
  // Remove Chinese characters and count remaining words
  const withoutChinese = text.replace(/[\u4e00-\u9fa5]/g, " ");
  const words = withoutChinese.match(/\b[a-zA-Z0-9]+\b/g);
  return words ? words.length : 0;
}

/**
 * Calculate reading time for a specific content type
 */
function calculateContentTypeTime(content: string, multiplier: number): number {
  const cleanText = stripMarkdown(content);
  const chineseChars = countChineseChars(cleanText);
  const englishWords = countEnglishWords(cleanText);

  const chineseTime = chineseChars / READING_SPEEDS.CHINESE_CHARS_PER_MIN;
  const englishTime = englishWords / READING_SPEEDS.ENGLISH_WORDS_PER_MIN;

  return (chineseTime + englishTime) * multiplier;
}

/**
 * Calculate reading time in minutes for markdown content
 *
 * @param content - The markdown content to analyze
 * @returns Reading time in minutes (rounded up)
 *
 * @example
 * ```ts
 * const readingTime = calculateReadingTime("# Hello\n\nThis is a test article...");
 * console.log(`${readingTime} 分钟阅读`);
 * ```
 */
export function calculateReadingTime(content: string): number {
  if (!content || typeof content !== "string") {
    return 0;
  }

  let totalTime = 0;
  let workingContent = content;

  // 1. Extract and calculate code blocks
  const { content: withoutCode, codeBlocks } = extractCodeBlocks(workingContent);
  workingContent = withoutCode;
  for (const codeBlock of codeBlocks) {
    totalTime += calculateContentTypeTime(codeBlock, CONTENT_MULTIPLIERS.CODE);
  }

  // 2. Extract and calculate tables
  const { content: withoutTables, tables } = extractTables(workingContent);
  workingContent = withoutTables;
  for (const table of tables) {
    totalTime += calculateContentTypeTime(table, CONTENT_MULTIPLIERS.TABLE);
  }

  // 3. Extract and calculate quotes
  const { content: withoutQuotes, quotes } = extractQuotes(workingContent);
  workingContent = withoutQuotes;
  for (const quote of quotes) {
    totalTime += calculateContentTypeTime(quote, CONTENT_MULTIPLIERS.QUOTE);
  }

  // 4. Count images and add time
  const imageCount = countImages(content);
  totalTime += (imageCount * READING_SPEEDS.SECONDS_PER_IMAGE) / 60;

  // 5. Calculate remaining normal text
  totalTime += calculateContentTypeTime(workingContent, CONTENT_MULTIPLIERS.NORMAL);

  // Return ceiling to ensure minimum 1 minute for non-empty content
  return Math.max(0, Math.ceil(totalTime));
}

/**
 * Get detailed reading time analysis (useful for debugging)
 *
 * @param content - The markdown content to analyze
 * @returns Detailed breakdown of reading time calculation
 *
 * @example
 * ```ts
 * const details = getReadingTimeDetails(content);
 * console.log(`Total: ${details.minutes} minutes`);
 * console.log(`Chinese: ${details.chineseChars} chars, English: ${details.englishWords} words`);
 * console.log(`Code blocks: ${details.codeBlocks}, Tables: ${details.tables}`);
 * ```
 */
export function getReadingTimeDetails(content: string): ReadingTimeDetails {
  if (!content || typeof content !== "string") {
    return {
      minutes: 0,
      words: 0,
      chineseChars: 0,
      englishWords: 0,
      codeBlocks: 0,
      tables: 0,
      images: 0,
      quotes: 0,
    };
  }

  let workingContent = content;

  // Extract content types
  const { content: withoutCode, codeBlocks } = extractCodeBlocks(workingContent);
  workingContent = withoutCode;

  const { content: withoutTables, tables } = extractTables(workingContent);
  workingContent = withoutTables;

  const { content: withoutQuotes, quotes } = extractQuotes(workingContent);
  workingContent = withoutQuotes;

  const imageCount = countImages(content);

  // Count text in all content
  const allText = stripMarkdown(content);
  const totalChineseChars = countChineseChars(allText);
  const totalEnglishWords = countEnglishWords(allText);

  return {
    minutes: calculateReadingTime(content),
    words: totalChineseChars + totalEnglishWords,
    chineseChars: totalChineseChars,
    englishWords: totalEnglishWords,
    codeBlocks: codeBlocks.length,
    tables: tables.length,
    images: imageCount,
    quotes: quotes.length,
  };
}
