import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Words — AI-Powered Quote Archive",
  description: "An intelligent, minimalist quote archive built on the Cloudflare edge network, powered by Workers AI and Vectorize.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${playfair.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-zinc-50 text-zinc-900 dark:bg-[#08080a] dark:text-zinc-100 font-sans selection:bg-amber-100 dark:selection:bg-amber-950/40">
        {children}
      </body>
    </html>
  );
}
