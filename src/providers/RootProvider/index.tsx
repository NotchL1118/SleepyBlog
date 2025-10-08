"use client";
import { ThemeProvider } from "next-themes";

const RootProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <ThemeProvider attribute="class" enableSystem enableColorScheme defaultTheme="system">
      {children}
    </ThemeProvider>
  );
};

export default RootProvider;
