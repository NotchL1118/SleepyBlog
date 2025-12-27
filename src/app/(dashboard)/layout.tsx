import type { Metadata, ResolvingMetadata } from "next";
import { ThemeProvider } from "next-themes";
import ConditionalAuthProvider from "./_components/auth/ConditionalAuthProvider";

interface Props {
  params: Promise<unknown>;
}

export async function generateMetadata({ params }: Props, parent: ResolvingMetadata): Promise<Metadata> {
  return {
    title: "SleepYoung's Blog Dashboard",
    description: "博客后台管理系统",
    robots: "noindex, nofollow", // 防止搜索引擎索引后台页面
  };
}

export default function DashboardRootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ThemeProvider attribute="class" enableSystem defaultTheme="system">
      <ConditionalAuthProvider>
        <div className="min-h-screen bg-gray-50 transition-colors dark:bg-gray-900">{children}</div>
      </ConditionalAuthProvider>
    </ThemeProvider>
  );
}
