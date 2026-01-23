import type { Token } from "@coinbase/onchainkit/token";
import { APP_URL, BASE_CHAIN_ID, BKFG_CONTRACT_ADDRESS } from "./constants";

export const ETH_TOKEN: Token = {
  name: "Ether",
  address: "",
  symbol: "ETH",
  decimals: 18,
  image: "https://wallet-api-production.s3.amazonaws.com/uploads/tokens/eth_288.png",
  chainId: BASE_CHAIN_ID,
};

export const BKFG_TOKEN: Token = {
  address: BKFG_CONTRACT_ADDRESS,
  chainId: BASE_CHAIN_ID,
  decimals: 18,
  name: "Blackfong",
  symbol: "BKFG",
  image: `${APP_URL}/blackfong-preview.png`,
};

export const SWAPPABLE_TOKENS: Token[] = [ETH_TOKEN, BKFG_TOKEN];
