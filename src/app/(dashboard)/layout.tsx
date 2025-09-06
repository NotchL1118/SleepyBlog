import type { Metadata, ResolvingMetadata } from "next";

interface Props {
  params: Promise<unknown>;
}

export async function generateMetadata({ params }: Props, parent: ResolvingMetadata): Promise<Metadata> {
  return {
    title: "SleepYoung's Blog Dashboard",
  };
}

export default function DashboardRootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
