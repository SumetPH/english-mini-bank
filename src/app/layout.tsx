import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "English Mini Bank Bot",
  description: "Telegram webhook backend for saving English words and chunks.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
