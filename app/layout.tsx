import type { Metadata } from "next";
import { Inter, Source_Code_Pro } from "next/font/google";
import { RootProvider } from "./rootProvider";
import "./globals.css";
import {
  APP_DESCRIPTION,
  APP_NAME,
  APP_URL,
  FRAME_POST_URL,
  OG_IMAGE_URL,
} from "@/lib/constants";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const sourceCodePro = Source_Code_Pro({
  variable: "--font-source-code-pro",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: APP_NAME,
  description: APP_DESCRIPTION,
  openGraph: {
    title: APP_NAME,
    description: APP_DESCRIPTION,
    url: APP_URL,
    siteName: "Blackfong",
    type: "website",
    images: [
      {
        url: OG_IMAGE_URL,
        width: 1200,
        height: 630,
        alt: "Blackfong Cube",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: APP_NAME,
    description: APP_DESCRIPTION,
    images: [OG_IMAGE_URL],
  },
  other: {
    // Farcaster Frame metadata
    "fc:frame": "vNext",
    "fc:frame:image": OG_IMAGE_URL,
    "fc:frame:image:aspect_ratio": "1.91:1",
    "fc:frame:button:1": "🔥 Summon Core",
    "fc:frame:button:1:action": "post",
    "fc:frame:button:2": "🌀 Enter Void",
    "fc:frame:button:2:action": "link",
    "fc:frame:button:2:target": APP_URL,
    "fc:frame:button:3": "📊 View Stats",
    "fc:frame:button:3:action": "post",
    "fc:frame:button:4": "💰 Buy BKFG",
    "fc:frame:button:4:action": "link",
    "fc:frame:button:4:target": `${APP_URL}?buy=true`,
    "fc:frame:post_url": FRAME_POST_URL,
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
