"use client";
import { ReactNode, useMemo } from "react";
import { OnchainKitProvider } from "@coinbase/onchainkit";
import {
  WagmiProvider,
  createConfig,
  createStorage,
  cookieStorage,
  http,
} from "wagmi";
import { base } from "wagmi/chains";
import { baseAccount, coinbaseWallet, injected, metaMask } from "wagmi/connectors";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "@coinbase/onchainkit/styles.css";
import { APP_NAME, APP_URL, OG_IMAGE_URL, BASE_CHAIN } from "@/lib/constants";

const queryClient = new QueryClient();

export function RootProvider({ children }: { children: ReactNode }) {
  const wagmiConfig = useMemo(() => {
    const apiKey = process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY;
    const appName = APP_NAME;
    const appLogoUrl = OG_IMAGE_URL;
    const origin = typeof window === "undefined" ? APP_URL : window.location.origin;

    return createConfig({
      chains: [base],
      connectors: [
        baseAccount({ appName, appLogoUrl }),
        coinbaseWallet({ appName, appLogoUrl, preference: "all" }),
        metaMask({
          dappMetadata: {
            name: appName,
            url: origin,
            iconUrl: appLogoUrl,
          },
        }),
        injected(),
      ],
      storage: createStorage({ storage: cookieStorage }),
      ssr: true,
      transports: {
        [base.id]: apiKey
          ? http(`https://api.developer.coinbase.com/rpc/v1/base/${apiKey}`)
          : http(),
      },
    });
  }, []);

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <OnchainKitProvider
          apiKey={process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY}
          chain={BASE_CHAIN}
          config={{
            appearance: {
              mode: "auto",
              theme: "hacker",
              name: APP_NAME,
              logo: OG_IMAGE_URL,
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
      </QueryClientProvider>
    </WagmiProvider>
  );
}
