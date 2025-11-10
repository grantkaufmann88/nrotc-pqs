import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers"; // 👈 Add this import

import { Inter } from "next/font/google";
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "NROTC PQS Board",
  description: "AI-driven PQS oral board simulator",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        <Providers>{children}</Providers> {/* 👈 Wrap children */}
      </body>
    </html>
  );
}
