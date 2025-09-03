"use client";

import { incrementArticleViewCount } from "@/actions/article";
import ServerActionBuilder from "@/lib/server-action";
import { useEffect, useRef } from "react";

interface ArticleViewTrackerProps {
  slug: string;
}

/**
 * 文章浏览追踪组件
 * 负责在适当的时机增加文章的浏览次数
 */
export function ArticleViewTracker({ slug }: ArticleViewTrackerProps) {
  const hasTracked = useRef(false);

  useEffect(() => {
    // 防止重复计数
    if (hasTracked.current) {
      return;
    }

    // 延迟一段时间后增加浏览次数，确保用户真正在阅读
    const timer = setTimeout(async () => {
      try {
        const result = await incrementArticleViewCount(slug);
        if (ServerActionBuilder.isSuccess(result)) {
          hasTracked.current = true;
        } else {
          console.error("增加浏览次数失败:", result.error);
        }
      } catch (error) {
        console.error("增加浏览次数失败:", error);
      }
    }, 2000); // 2秒后执行，确保用户确实在阅读

    return () => clearTimeout(timer);
  }, [slug]);

  // 这个组件不渲染任何内容
  return null;
}
