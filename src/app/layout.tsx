import type { Metadata, ResolvingMetadata } from "next";
import Header from "@/components/Header";
import "./globals.css";

const basicMetadata: Metadata = {
  description: "A Sleepy Guy's Blog",
};

type Props = {
  params: Promise<unknown>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

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
    title: metaTitleArr[Math.floor(Math.random() * metaTitleArr.length)],
  };
}
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-cn">
      <body className={`antialiased`}>
        <Header />
        {children}
      </body>
    </html>
  );
}
