import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AppProvider } from "@/context/AppContext";

export const metadata: Metadata = {
  title: "وليف — Waleef",
  description:
    "وليف رفيق إنساني سعودي يسمعك ويواسيك… مو بس يرد عليك. Waleef, a Saudi human-centered companion for emotional and life support.",
  applicationName: "Waleef",
  authors: [{ name: "Waleef" }],
  keywords: ["وليف", "Waleef", "دعم نفسي", "mental wellbeing", "Saudi", "companion"],
};

export const viewport: Viewport = {
  themeColor: "#7FA98C",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Default to Arabic + RTL; AppProvider keeps <html> in sync at runtime.
  return (
    <html lang="ar" dir="rtl">
      <body>
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
