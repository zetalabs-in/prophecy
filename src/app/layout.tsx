import type { Metadata } from "next";
import { Inter } from "next/font/google"; // Using Inter as a close alternative to Geist if not desired
import "./globals.css";
import { CursorProvider } from "@/context/CursorContext";
import CursorSystem from "@/components/CursorSystem";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Prophecy Wallpaper",
  description: "Generate mystical wallpapers from Bible quotes.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <CursorProvider>
          <CursorSystem />
          {children}
        </CursorProvider>
      </body>
    </html>
  );
}
