"use client";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import { clsx } from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";
import GlowEffect from "./GlowEffect";
import Styles from "./index.module.scss";

export default function Header() {
  const pathname = usePathname();

  return (
    <header className={clsx("headerHeight fixed left-0 right-0 top-0 z-[999] backdrop-blur-xl", Styles.headerSurface)}>
      <GlowEffect className="mx-auto flex h-full w-4/5 items-center justify-between sm:max-w-screen-md lg:w-full lg:max-w-screen-xl">
        <Link href="/" className="font-extrabold">
          S.Y.Blog
        </Link>
        <div className="absolute left-1/2 top-1/2 hidden translate-x-[-50%] translate-y-[-50%] flex-row items-center lg:flex">
          <nav className="flex items-center gap-4">
            <Link
              href="/"
              className={clsx(Styles.navItem, "font-extrabold", {
                [Styles.navItemActive]: pathname === "/",
              })}
            >
              首页
            </Link>
            {HeaderConfig.map((item, index) => (
              <Link
                key={index}
                href={item.href}
                className={clsx(Styles.navItem, "font-extrabold", {
                  [Styles.navItemActive]: pathname.startsWith(item.href),
                })}
              >
                {item.title}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <ThemeSwitcher />
          {/* <button className="rounded-md px-3 py-1 text-sm font-medium transition-colors hover:bg-gray-100 dark:hover:bg-gray-800">
            登录
          </button> */}
        </div>
      </GlowEffect>
    </header>
  );
}

const HeaderConfig = [
  {
    title: "开发文章",
    href: "/blog",
  },
  {
    title: "生活随想",
    href: "/life",
  },
  {
    title: "碎碎念",
    href: "/thoughts",
  },
  {
    title: "随手一拍",
    href: "/camera",
  },
  {
    title: "关于我",
    href: "/about",
  },
];
