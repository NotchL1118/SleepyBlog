"use client";
import React from "react";
import ArticleCard from "./ArticleCard";

// 示例文章数据
const articleData = [
  {
    id: 1,
    title: "文章1，这里是标题，我也不知道有多少",
    content: "这里应该是内容，到时候服务器那里拿,应该用AI简介比较合适？",
    imageUrl: "/images/mountain1.png",
    date: "2025-04-05",
    views: 101,
    tag: "生活随笔",
    imagePosition: "left" as const,
  },
  {
    id: 2,
    title: "文章2，这里是标题，我也不知道有多少",
    content: "这里应该是内容，到时候服务器那里拿,应该用AI简介比较合适？",
    imageUrl: "/images/mountain1.png",
    date: "2025-04-05",
    views: 74,
    tag: "生活随笔",
    imagePosition: "right" as const,
  },
  {
    id: 3,
    title: "文章3，这里是标题，我也不知道有多少",
    content:
      "这里应该是内容，到时候服务器那里拿,应该用AI简介比较合适？这里应该是内容，到时候服务器那里拿,应该用AI简介比较合适？这里应该是内容，到时候服务器那里拿,应该用AI简介比较合适？",
    imageUrl: "/images/mountain1.png",
    date: "2025-03-11",
    views: 822,
    tag: "生活随笔",
    imagePosition: "left" as const,
  },
  {
    id: 4,
    title: "文章4，这里是标题，我也不知道有多少",
    content:
      "这里应该是内容，到时候服务器那里拿,应该用AI简介比较合适这里应该是内容，到时候服务器那里拿,应该用AI简介比较合适？这里应该是内容，到时候服务器那里拿,应该用AI简介比较合适？？",
    imageUrl: "/images/mountain1.png",
    date: "2025-02-03",
    views: 1536,
    tag: "生活随笔",
    imagePosition: "right" as const,
  },
];

const ArticleList: React.FC = () => {
  return (
    <div className="flex flex-col space-y-6">
      {articleData.map((article) => (
        <ArticleCard
          key={article.id}
          pageId={article.id}
          title={article.title}
          content={article.content}
          coverImage={article.imageUrl}
          mode={article.imagePosition === "left" ? "normal" : "reverse"}
        />
      ))}
    </div>
  );
};

export default ArticleList;
