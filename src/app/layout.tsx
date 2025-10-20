import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/components/auth/mession-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "E-Shop - Your Online Shopping Destination",
  description: "Shop the latest products in electronics, fashion, home & garden, and more. Great prices, fast shipping, and excellent customer service.",
  keywords: ["ecommerce", "online shopping", "electronics", "fashion", "home goods", "best prices"],
  authors: [{ name: "E-Shop Team" }],
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "E-Shop - Online Shopping",
    description: "Your trusted online shopping destination for quality products at great prices.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "E-Shop - Online Shopping",
    description: "Your trusted online shopping destination for quality products at great prices.",
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
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}