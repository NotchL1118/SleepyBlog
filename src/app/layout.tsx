import Header from "@/components/Header";
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata, ResolvingMetadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const puHuiTi = localFont({
  src: "../../public/fonts/AlibabaPuHuiTi-3-55-Regular.woff2",
  display: "swap",
});

const basicMetadata: Metadata = {
  description: "A Sleepy Guy's Blog",
};

interface Props {
  params: Promise<unknown>;
}

export async function generateMetadata({ params }: Props, parent: ResolvingMetadata): Promise<Metadata> {
  // TODO: 以后替换成api
  const metaTitleArr = [
    "欲买桂花终买酒，终不似，少年游",
    "过去只是过去，过去不是牢笼",
    "早睡早起有益健康",
    "不畏将来，不念过往",
  ];
  return {
    ...basicMetadata,
    title: `${metaTitleArr[Math.floor(Math.random() * metaTitleArr.length)]} - SleepYoung's Blog`,
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-cn" className={puHuiTi.className}>
      <head>
        {/* <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/lxgw-wenkai-gb-web@latest/style.css" /> */}
      </head>
      <body className="pb-16 antialiased">
        <SpeedInsights />
        <Header />
        {children}
      </body>
    </html>
  );
}
