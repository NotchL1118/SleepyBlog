"use client";

import { RefObject, useEffect, useState } from "react";
import type { TOCHeading } from "./types";

export function useTOC(contentRef: RefObject<HTMLDivElement | null>) {
  const [headings, setHeadings] = useState<TOCHeading[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  // 提取标题
  useEffect(() => {
    if (!contentRef.current) return;

    const elements = contentRef.current.querySelectorAll("h1[id], h2[id], h3[id], h4[id]");
    const items: TOCHeading[] = Array.from(elements).map((el) => ({
      id: el.id,
      text: el.textContent || "",
      level: parseInt(el.tagName[1]) as 1 | 2 | 3 | 4,
    }));
    setHeadings(items);

    // 设置初始激活标题
    if (items.length > 0) {
      setActiveId(items[0].id);
    }
  }, [contentRef]);

  // Intersection Observer 检测当前可见标题
  useEffect(() => {
    if (headings.length === 0) return;

    const headingElements = headings
      .map((h) => document.getElementById(h.id))
      .filter((el): el is HTMLElement => el !== null);

    if (headingElements.length === 0) return;

    // 存储每个标题的可见状态
    const visibleHeadings = new Map<string, IntersectionObserverEntry>();

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            visibleHeadings.set(entry.target.id, entry);
          } else {
            visibleHeadings.delete(entry.target.id);
          }
        });

        // 找到视口中最靠上的标题
        if (visibleHeadings.size > 0) {
          let topMostEntry: IntersectionObserverEntry | null = null;
          visibleHeadings.forEach((entry) => {
            if (!topMostEntry || entry.boundingClientRect.top < topMostEntry.boundingClientRect.top) {
              topMostEntry = entry;
            }
          });
          if (topMostEntry) {
            setActiveId((topMostEntry as IntersectionObserverEntry).target.id);
          }
        } else {
          // 如果没有标题在视口中，找到最近滚过的标题
          const scrollTop = window.scrollY;
          let closestId: string | null = null;
          let minDistance = Infinity;

          headingElements.forEach((el) => {
            const rect = el.getBoundingClientRect();
            const elementTop = rect.top + scrollTop;

            // 只考虑已经滚过的标题（在视口上方）
            if (elementTop <= scrollTop + 100) {
              const distance = scrollTop - elementTop;
              if (distance < minDistance) {
                minDistance = distance;
                closestId = el.id;
              }
            }
          });

          if (closestId) {
            setActiveId(closestId);
          }
        }
      },
      {
        rootMargin: "-80px 0px -60% 0px",
        threshold: 0,
      }
    );

    headingElements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [headings]);

  // 滚动进度计算
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      setProgress(Math.min(100, Math.max(0, Math.round(scrollPercent))));
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return { headings, activeId, progress };
}
