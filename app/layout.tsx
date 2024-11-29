import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SleepyBlog",
  description: "A Sleepy Guy's Blog",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-cn">
      <body className={`antialiased`}>{children}</body>
    </html>
  );
}
