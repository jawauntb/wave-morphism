import type { Metadata } from "next";
import { Cormorant_Garamond, JetBrains_Mono } from "next/font/google";
import { SiteHeader } from "@/components/layout/Chrome";
import { TapeStrip } from "@/components/canvas/TapeStrip";
import { TapeProvider } from "@/lib/tape";
import "./globals.css";

const display = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  style: ["normal", "italic"],
  variable: "--font-display",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "wave-morphism",
    template: "%s · wave-morphism",
  },
  description:
    "A shadcn-style design system for wave-morphism — UI that propagates, decays, and breathes like water.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${display.variable} ${mono.variable} antialiased`}>
        <TapeProvider>
          <SiteHeader />
          {children}
          <div className="fixed bottom-0 inset-x-0 z-20">
            <TapeStrip />
          </div>
        </TapeProvider>
      </body>
    </html>
  );
}
