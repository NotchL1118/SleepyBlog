"use client";
import { clsx } from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Styles from "./index.module.scss";

export default function Header() {
  const pathname = usePathname();
  return (
    <header className="sticky left-0 right-0 top-0">
      <div className="mx-auto flex h-10 w-full max-w-screen-xl items-center justify-between">
        <Link href="/" className="font-extrabold">
          S.Y.Blog
        </Link>
        <nav className="flex items-center gap-4">
          <Link
            href="/"
            className={clsx(`${Styles["horizontal-line"]} font-extrabold`, {
              [Styles["horizontal-line-active"]]: pathname === "/",
            })}
          >
            首页
          </Link>
          {HeaderConfig.map((item, index) => (
            <Link
              key={index}
              href={item.href}
              className={clsx(`${Styles["horizontal-line"]} font-extrabold`, {
                [Styles["horizontal-line-active"]]: pathname.includes(item.href),
              })}
            >
              {item.title}
            </Link>
          ))}
        </nav>
        <button>登录</button>
      </div>
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
    title: "关于我",
    href: "/about",
  },
];
