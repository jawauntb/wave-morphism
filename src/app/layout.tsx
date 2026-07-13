import type { Metadata } from "next";
import { Cormorant_Garamond, JetBrains_Mono } from "next/font/google";
import { SiteHeader } from "@/components/layout/Chrome";
import { PageTide } from "@/components/layout/PageTide";
import { AtmosphereLayer } from "@/components/layout/AtmosphereLayer";
import { AtmosphereProvider } from "@/lib/atmosphere";
import { TapeProvider } from "@/lib/tape";
import { ThemeProvider } from "@/lib/theme";
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
        <ThemeProvider>
          <AtmosphereProvider defaultAmbient="css" defaultTapeStrip>
            <TapeProvider>
              <AtmosphereLayer />
              <div className="relative z-10">
                <SiteHeader />
                <PageTide>{children}</PageTide>
              </div>
            </TapeProvider>
          </AtmosphereProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
