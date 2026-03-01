"use server";
import { checkSlugExists } from "@/actions/dashboard";
import { ServerConfig } from "@/config";
import OpenAI from "openai";

const MAX_RETRIES = 3;
const MAX_CONTENT_LENGTH = 15000;

interface GenerateResult {
  title: string;
  slug: string;
  excerpt: string;
}

const SYSTEM_PROMPT = `你是一个极其优秀的文章助手，擅长文章的总结、分析。接下来，我会给你一篇文章内容，你的任务是帮助用户生成文章的标题、slug和摘要。
其中，请注意：
1. 你要首先仔细阅读文章的内容，然后根据文章内容总结出标题、文章slug、摘要;
2. 文章的标题尽量控制在10个字符以内，最多不要超过20个字符;
3. 摘要字数尽量控制在300字以内;
4. slug非常重要，只允许包含小写字母、数字和连字符-，不能以连字符开头或结尾，不能有连续连字符;
5. 你必须以JSON格式回复，包含以下字段：{"title": "good_title", "slug": "good-slug", "excerpt": "good_excerpt"}`;

const client = new OpenAI({
  baseURL: ServerConfig.ai.baseAgentApiUrl,
  apiKey: ServerConfig.ai.baseAgentApiKey,
});

function validateSlugFormat(slug: string): { valid: boolean; message: string } {
  if (!slug || slug.length === 0) {
    return { valid: false, message: "slug不能为空" };
  }

  if (!/^[a-z0-9-]+$/.test(slug)) {
    return { valid: false, message: "slug只允许小写字母、数字和连字符-" };
  }

  if (slug.startsWith("-") || slug.endsWith("-")) {
    return { valid: false, message: "slug不能以连字符开头或结尾" };
  }

  if (slug.includes("--")) {
    return { valid: false, message: "slug不能包含连续的连字符" };
  }

  return { valid: true, message: "slug格式合法" };
}

class ParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ParseError";
  }
}

async function chat2AI(messages: OpenAI.ChatCompletionMessageParam[]): Promise<GenerateResult> {
  const completion = await client.chat.completions.create({
    model: ServerConfig.ai.baseAgentModel as string,
    messages,
    response_format: { type: "json_object" },
    temperature: 0.7,
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) {
    throw new ParseError("DeepSeek API returned empty response");
  }

  let parsed: unknown = null;
  try {
    parsed = JSON.parse(content);
  } catch {
    throw new ParseError(`DeepSeek API returned invalid JSON: ${content.slice(0, 200)}`);
  }

  if (typeof parsed !== "object" || parsed === null) {
    throw new ParseError("DeepSeek API response is not a JSON object");
  }

  const obj = parsed as Record<string, unknown>;
  if (typeof obj.title !== "string" || typeof obj.slug !== "string" || typeof obj.excerpt !== "string") {
    throw new ParseError("DeepSeek API response fields must be strings (title, slug, excerpt)");
  }

  return { title: obj.title.trim(), slug: obj.slug.trim(), excerpt: obj.excerpt.trim() };
}

async function generateWithRetry(content: string, articleId?: string): Promise<GenerateResult> {
  const truncatedContent = content.length > MAX_CONTENT_LENGTH ? content.slice(0, MAX_CONTENT_LENGTH) + "..." : content;

  const messages: OpenAI.ChatCompletionMessageParam[] = [
    { role: "system", content: SYSTEM_PROMPT },
    { role: "user", content: truncatedContent },
  ];

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    let result: GenerateResult;
    try {
      result = await chat2AI(messages);
    } catch (error) {
      if (error instanceof ParseError) {
        messages.push(
          { role: "user", content: `上一次回复格式不正确：${error.message}。请严格按照JSON格式返回，包含 title、slug、excerpt 三个字符串字段。` },
        );
        continue;
      }
      throw error;
    }

    const formatCheck = validateSlugFormat(result.slug);
    if (!formatCheck.valid) {
      messages.push(
        { role: "assistant", content: JSON.stringify(result) },
        { role: "user", content: `生成的slug不合法：${formatCheck.message}。请修正slug后重新生成完整的JSON。` }
      );
      continue;
    }

    const existsResult = await checkSlugExists(result.slug, articleId);
    if (!existsResult.success) {
      messages.push(
        { role: "assistant", content: JSON.stringify(result) },
        { role: "user", content: "检查slug时发生错误，请生成一个不同的slug后重新返回完整的JSON。" }
      );
      continue;
    }

    if (existsResult.data === true) {
      messages.push(
        { role: "assistant", content: JSON.stringify(result) },
        { role: "user", content: `slug "${result.slug}" 已在数据库中存在，请生成一个不同的slug后重新返回完整的JSON。` }
      );
      continue;
    }

    return result;
  }

  throw new Error("Failed to generate valid article info after maximum retries");
}

export const generateArticleInfoByAgent = async (
  content: string,
  currentArticleId?: string
): Promise<{
  success: boolean;
  title: string;
  slug: string;
  excerpt: string;
  error?: string;
}> => {
  if (!content) {
    throw new Error("content is required when generating by agent");
  }

  try {
    const result = await generateWithRetry(content, currentArticleId);
    return {
      success: true,
      title: result.title,
      slug: result.slug,
      excerpt: result.excerpt,
    };
  } catch (error) {
    console.error("generateArticleInfoByAgent failed:", error);
    const message = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      title: "",
      slug: "",
      excerpt: "",
      error: message,
    };
  }
};
