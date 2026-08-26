import type { Metadata, Viewport } from "next";
import { Playfair_Display, Inter, Josefin_Sans } from "next/font/google";
import "./globals.css";
import BottomNav from "@/components/BottomNav";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const josefin = Josefin_Sans({
  subsets: ["latin"],
  variable: "--font-josefin",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Remember | Kyria Mailman",
  description: "The REMEMBER framework: courses, daily practice, and community.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Remember",
  },
};

export const viewport: Viewport = {
  themeColor: "#FF1FA9",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${playfair.variable} ${inter.variable} ${josefin.variable} font-sans antialiased`}
      >
        <div className="mx-auto max-w-md min-h-screen pb-20 relative">
          {children}
        </div>
        <BottomNav />
      </body>
    </html>
  );
}
