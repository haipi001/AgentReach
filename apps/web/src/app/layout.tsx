import type { Metadata } from "next";
import "@agentreach/design-system/tokens.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "AgentReach｜我的智能体空间",
  description: "隐私保护型个人智能体协作空间",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
