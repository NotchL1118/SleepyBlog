import RootProvider from "@/providers/RootProvider";
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
// 实现主题切换的动画
import "@/styles/view-transitions.css";

const puHuiTi = localFont({
  src: "../../public/fonts/AlibabaPuHuiTi-3-55-Regular.woff2",
  display: "swap",
});

const basicMetadata: Metadata = {
  description: "A Sleepy Guy's Blog",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-cn" className={puHuiTi.className} suppressHydrationWarning>
      <head>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/lxgw-wenkai-gb-web@latest/style.css" />
      </head>
      <body className="antialiased" suppressHydrationWarning>
        <RootProvider>{children}</RootProvider>
        <SpeedInsights />
      </body>
    </html>
  );
}
