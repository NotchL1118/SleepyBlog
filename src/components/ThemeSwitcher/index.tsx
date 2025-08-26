"use client";

import useIsClient from "@/hooks/use-is-client";
import { transitionViewIfSupported } from "@/utils/dom";
import { clsx } from "clsx";
import { useTheme } from "next-themes";
import { flushSync } from "react-dom";
import { DarkIcon, SunIcon, SystemIcon } from "../Icons";

const iconClassNames = "h-4 w-4 text-current";

// 主题配置
const themeConfig = [
  { theme: "light" as const, icon: SunIcon, label: "切换到亮色主题" },
  { theme: "system" as const, icon: SystemIcon, label: "切换到系统主题" },
  { theme: "dark" as const, icon: DarkIcon, label: "切换到暗色主题" },
];

const ThemeSwitcher = () => {
  const { theme, setTheme } = useTheme();
  const isClient = useIsClient();

  const handleThemeClick = (targetTheme: "light" | "dark" | "system", event: React.MouseEvent) => {
    // 如果点击的是当前已激活的主题，则不执行任何操作
    if (isClient && theme === targetTheme) {
      return;
    }

    // 执行主题切换
    transitionViewIfSupported(() => {
      flushSync(() => setTheme(targetTheme));
    }, event);
  };

  const getButtonClass = (buttonTheme: "light" | "dark" | "system") => {
    const isActive = isClient && theme === buttonTheme;

    return clsx(
      // 基础样式
      "rounded-full inline-flex h-8 w-8 items-center justify-center",
      "border-0 text-current transition-colors",
      "focus:outline-none focus:ring-0 focus:border-0 outline-none ring-0",
      // 条件样式
      {
        // 激活状态
        "bg-white shadow-sm dark:bg-gray-700": isActive,
        // 非激活状态
        "bg-transparent hover:bg-gray-100 dark:hover:bg-gray-600": !isActive,
      }
    );
  };

  return (
    <div className="inline-flex rounded-full border border-gray-200 bg-gray-50 p-1 dark:border-gray-600 dark:bg-gray-800">
      {themeConfig.map(({ theme: buttonTheme, icon: Icon, label }) => (
        <button
          key={buttonTheme}
          aria-label={label}
          type="button"
          className={getButtonClass(buttonTheme)}
          onClick={(e) => handleThemeClick(buttonTheme, e)}
        >
          <Icon className={iconClassNames} />
        </button>
      ))}
    </div>
  );
};

export default ThemeSwitcher;
