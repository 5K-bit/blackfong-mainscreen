import type { Metadata } from "next";
import { Inter, Source_Code_Pro } from "next/font/google";
import { RootProvider } from "./rootProvider";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const sourceCodePro = Source_Code_Pro({
  variable: "--font-source-code-pro",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: process.env.NEXT_PUBLIC_PROJECT_NAME || "Blackfong - BKFG Protocol",
  description:
    "Blackfong is not an app. It is an artifact. BKFG is its bloodstream.",
  openGraph: {
    title: "Blackfong - BKFG Protocol",
    description:
      "Blackfong is not an app. It is an artifact. BKFG is its bloodstream.",
    url: "https://blackfong-mainscreen.vercel.app",
    siteName: "Blackfong",
    type: "website",
    images: [
      {
        url: "https://blackfong-mainscreen.vercel.app/blackfong-preview.png",
        width: 1200,
        height: 630,
        alt: "Blackfong Cube",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Blackfong - BKFG Protocol",
    description:
      "Blackfong is not an app. It is an artifact. BKFG is its bloodstream.",
    images: ["https://blackfong-mainscreen.vercel.app/blackfong-preview.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${sourceCodePro.variable}`}>
        <RootProvider>{children}</RootProvider>
      </body>
    </html>
  );
}
