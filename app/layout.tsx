// app/layout.tsx
import type { Metadata } from "next";
import type { ReactNode } from "react"; // ✅ add this line
import "./globals.css";
import Providers from "./providers";
import Header from "./header"; // same directory
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "NROTC PQS Board",
    template: "%s • NROTC PQS Board",
  },
  description: "AI-driven PQS oral board simulator",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-192.png", sizes: "192x192", type: "image/png" },
    ],
  },
};

// ✅ add ": { children: ReactNode }" here
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased bg-gray-50 text-gray-900`}>
        {/* ✅ Providers now wraps EVERYTHING, including Header */}
        <Providers>
          <Header />
          <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
