import type { Metadata, Viewport } from "next";
import { Tajawal } from "next/font/google";
import "./globals.css";

const tajawal = Tajawal({
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "700", "800", "900"],
  variable: "--font-tajawal",
  display: "swap",
  preload: true,
});

export const metadata: Metadata = {
  title: {
    default: "فرنشايز ريدي | تقييم جاهزية الامتياز التجاري",
    template: "%s | فرنشايز ريدي",
  },
  description:
    "منصة ذكاء اصطناعي متخصصة في تقييم جاهزية المنشآت التجارية للتوسع عبر نظام الامتياز في المملكة العربية السعودية ومنطقة الخليج.",
  keywords: [
    "امتياز تجاري",
    "franchise",
    "تقييم المنشآت",
    "السعودية",
    "ذكاء اصطناعي",
    "توسع تجاري",
  ],
  authors: [{ name: "Franchise Ready AI" }],
  creator: "Franchise Ready AI",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "https://franchise-ready.ai"
  ),
  openGraph: {
    type: "website",
    locale: "ar_SA",
    title: "فرنشايز ريدي | تقييم جاهزية الامتياز التجاري",
    description:
      "منصة ذكاء اصطناعي متخصصة في تقييم جاهزية المنشآت التجارية للتوسع عبر نظام الامتياز.",
    siteName: "فرنشايز ريدي",
  },
  twitter: {
    card: "summary_large_image",
    title: "فرنشايز ريدي",
    description:
      "منصة ذكاء اصطناعي متخصصة في تقييم جاهزية المنشآت التجارية للتوسع عبر نظام الامتياز.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#1a5c3a",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ar"
      dir="rtl"
      className={`${tajawal.variable} h-full`}
    >
      <body className="min-h-full flex flex-col antialiased">
        {children}
      </body>
    </html>
  );
}
