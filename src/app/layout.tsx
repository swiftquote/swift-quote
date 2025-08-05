import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Providers } from "@/components/providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Swift Quote - Professional Quoting for Service Businesses",
  description: "Create professional quotes in minutes. Perfect for cleaners, handymen, photographers, tutors, and barbers. Free trial available.",
  keywords: ["quote", "quoting", "service business", "invoice", "business", "professional"],
  authors: [{ name: "Swift Quote Team" }],
  openGraph: {
    title: "Swift Quote - Professional Quoting Software",
    description: "Create professional quotes in minutes for your service business",
    url: "https://swiftquote.com",
    siteName: "Swift Quote",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Swift Quote - Professional Quoting Software",
    description: "Create professional quotes in minutes for your service business",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
