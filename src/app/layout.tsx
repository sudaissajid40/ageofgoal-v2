import type { Metadata } from "next";
import { Rajdhani, Orbitron } from "next/font/google";
import "./globals.css";
import QueryProvider from "@/components/providers/QueryProvider";
import MainLayout from "@/components/layout/MainLayout";

const rajdhani = Rajdhani({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-rajdhani",
});

const orbitron = Orbitron({
  weight: ["400", "500", "700", "900"],
  subsets: ["latin"],
  variable: "--font-orbitron",
});

export const metadata: Metadata = {
  title: "Age of Goal v2 | Pro Tournament Platform",
  description: "The next generation of competitive esports management. Burdenless, fast, and secure.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${rajdhani.variable} ${orbitron.variable} dark`}>
      <body className="min-h-screen bg-[#0a0a0c] text-[#e1e1e3] font-sans selection:bg-orange-500/30">
        <QueryProvider>
          <MainLayout>
            {children}
          </MainLayout>
        </QueryProvider>
      </body>
    </html>
  );
}

