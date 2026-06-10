import { AppShell } from "@/components/layout/app-shell";

export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <AppShell>{children}</AppShell>;
}
