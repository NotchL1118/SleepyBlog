"use client";

import { RequireAuth } from "../_components/auth/AuthProvider";
import DashboardLayout from "../_components/layout/DashboardLayout";

export default function DashboardRootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <RequireAuth>
      <DashboardLayout>{children}</DashboardLayout>
    </RequireAuth>
  );
}
