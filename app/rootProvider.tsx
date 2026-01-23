"use client";
import { ReactNode } from "react";
import { OnchainKitProvider } from "@coinbase/onchainkit";
import "@coinbase/onchainkit/styles.css";
import { BASE_CHAIN } from "@/lib/constants";

export function RootProvider({ children }: { children: ReactNode }) {
  return (
    <OnchainKitProvider
      apiKey={process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY}
      chain={BASE_CHAIN}
      config={{
        appearance: {
          mode: "auto",
        },
        wallet: {
          display: "modal",
          preference: "all",
          supportedWallets: {
            frame: true,
          },
        },
      }}
    >
      {children}
    </OnchainKitProvider>
  );
}
