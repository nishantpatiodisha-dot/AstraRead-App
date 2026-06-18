import type { Metadata } from "next";
import { Inter, Instrument_Serif, Source_Serif_4 } from "next/font/google";
import { ThemeProvider } from "@/components/layout/ThemeProvider";
import { PWARegistrar } from "@/components/PWARegistrar";
import { Analytics } from "@vercel/analytics/next";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

const sourceSerif4 = Source_Serif_4({
  variable: "--font-reading",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "AstraRead | Master CAT VARC with Deep Reading",
    template: "%s | AstraRead",
  },
  description:
    "A premium training workspace for deep reading, grammar mastery, CAT VARC RC practice, vocabulary growth, and long-term consistency tracking.",
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: "AstraRead",
    title: "AstraRead | Master CAT VARC with Deep Reading",
    description:
      "Train your reading comprehension, grammar, and vocabulary for CAT VARC with structured daily practice.",
  },
  twitter: {
    card: "summary_large_image",
    title: "AstraRead | Master CAT VARC with Deep Reading",
    description:
      "Train your reading comprehension, grammar, and vocabulary for CAT VARC with structured daily practice.",
  },
  manifest: "/manifest.json",
};

export const viewport = {
  themeColor: "#10b981",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
      <html
        lang="en"
        className={`${inter.variable} ${instrumentSerif.variable} ${sourceSerif4.variable} h-full`}
        suppressHydrationWarning
      >
        <body className="min-h-full flex flex-col antialiased font-sans" suppressHydrationWarning>
          <ThemeProvider>
            <PWARegistrar />
            {children}
            <Analytics />
            <GoogleAnalytics />
          </ThemeProvider>
        </body>
      </html>
  );
}
