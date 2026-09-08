import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Static Spark",
  description: "Static Spark pipeline dashboard",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-neutral-50 text-neutral-900">
        <nav className="border-b border-neutral-200 px-6 py-3 flex gap-6 text-sm font-medium">
          <a href="/" className="hover:underline">
            Status
          </a>
          <a href="/quotes" className="hover:underline">
            Quotes
          </a>
          <a href="/cards" className="hover:underline">
            Cards
          </a>
        </nav>
        <main className="flex-1 p-6">{children}</main>
      </body>
    </html>
  );
}
