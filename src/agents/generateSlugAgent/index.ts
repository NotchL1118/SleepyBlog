"use server";
import { checkSlugExists } from "@/actions/dashboard";
import { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { ChatDeepSeek } from "@langchain/deepseek";
import { MemorySaver } from "@langchain/langgraph";
import { createAgent, HumanMessage, ReactAgent, tool, type ToolRuntime } from "langchain";
import { uuidv4, z } from "zod";

type AgentRuntime = ToolRuntime<unknown, { article_id?: string }>;

const checkSlugTool = tool(
  async ({ slug }, config: AgentRuntime) => {
    const excludeId = config.context?.article_id;
    // 1. 基础格式验证：只允许小写字母、数字和连字符
    const formatRegex = /^[a-z0-9-]+$/;
    if (!formatRegex.test(slug)) {
      return "slug只允许小写字母、数字和连字符-";
    }

    // 2. 边界规则：不能以连字符开头或结尾
    if (slug.startsWith("-") || slug.endsWith("-")) {
      return "slug不能以连字符开头或结尾";
    }

    // 3. 边界规则：不能有连续连字符
    if (slug.includes("--")) {
      return "slug不能包含连续的连字符";
    }

    // 4. 数据库检查
    const result = await checkSlugExists(slug, excludeId);
    if (!result.success) {
      return "检查slug时发生错误，请重试";
    }

    if (result.data === true) {
      return "该slug已在数据库中存在";
    }

    return "slug可用";
  },
  {
    name: "check_slug_is_valid",
    description: "检查slug是否合法。返回字符串消息说明检查结果：'slug可用' 表示可以使用，其他消息表示不可用的原因。",
    schema: z.object({
      slug: z.string().min(1).max(100).describe("要检查是否可用的slug字符串，不能为空"),
    }),
  }
);

const SYSTEM_PROMPT = `你是一个极其优秀的文章助手，擅长文章的总结、分析。接来下，我会给你一篇文章内容，你的任务是帮助用户生成文章的标题、slug和摘要。
其中，请注意：
1. 你要首先仔细阅读文章的内容，然后根据文章内容总结出标题、文章slug、摘要;
2. 文章的标题尽量控制在10个字符以内，最多不要超过20个字符;
3. 摘要字数尽量控制在300字以内;
4. slug非常重要，只允许包含小写字母、数字和连字符-，不能以连字符开头或结尾，不能有连续连字符;
5. slug用作文章的唯一标识，所以在生成slug时，请使用${checkSlugTool.name}工具检查slug是否合法。该工具会返回检查结果消息，只有返回"slug可用"时才表示slug合法。如果返回其他消息，请根据提示修正并重新检测，直到返回"slug可用"为止。
`;
class GenerateSlugAgent {
  model: BaseChatModel;
  agent: ReactAgent;
  config: {
    configurable: {
      thread_id: string;
    };
    context: {
      article_id?: string;
    };
  };

  constructor({ thread_id, article_id }: { thread_id?: string; article_id?: string }) {
    this.model = new ChatDeepSeek({
      model: "deepseek-chat",
    });

    this.config = {
      configurable: {
        thread_id: thread_id || uuidv4().toString(),
      },
      context: {
        article_id,
      },
    };

    const systemPrompt = SYSTEM_PROMPT;

    const responseFormat = z.object({
      title: z.string(),
      slug: z.string(),
      excerpt: z.string(),
    });

    const checkpointer = new MemorySaver();

    this.agent = createAgent({
      model: this.model,
      systemPrompt: systemPrompt,
      tools: [checkSlugTool],
      responseFormat,
      checkpointer,
    });
  }

  async execute(content: string) {
    const userMessage = new HumanMessage(content);
    return this.agent.invoke({ messages: [userMessage] }, this.config);
  }
}

export const generateArticleInfoByAgent = async (
  content: string,
  thread_id?: string,
  currentArticleId?: string
): Promise<{
  success: boolean;
  title: string;
  slug: string;
  expert: string;
}> => {
  if (!content) {
    throw new Error("content is required when generating by agent");
  }

  const agent = new GenerateSlugAgent({
    thread_id: thread_id,
    article_id: currentArticleId,
  });

  try {
    const result = (await agent.execute(content)).structuredResponse;
    return {
      success: true,
      title: result.title,
      slug: result.slug,
      expert: result.excerpt,
    };
  } catch (error) {
    return {
      success: false,
      title: "",
      slug: "",
      expert: "",
    };
  }
};
