import { base } from "viem/chains";

export const BASE_CHAIN = base;
export const BASE_CHAIN_ID = base.id;

export const BKFG_CONTRACT_ADDRESS =
  "0xCD025D20B1284c79eE4c63e003E0f1E421FbE249" as `0x${string}`;

export const BASESCAN_BASE_URL = "https://basescan.org";
export const THIRDWEB_BASE_URL = "https://thirdweb.com/base";

export const APP_NAME =
  process.env.NEXT_PUBLIC_PROJECT_NAME || "Blackfong - BKFG Protocol";
export const APP_DESCRIPTION =
  "Blackfong is not an app. It is an artifact. BKFG is its bloodstream.";

export const APP_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://blackfong-mainscreen.vercel.app";

export const OG_IMAGE_PATH = "/blackfong-preview.png";
export const OG_IMAGE_URL = `${APP_URL}${OG_IMAGE_PATH}`;
export const FRAME_POST_URL = `${APP_URL}/api/frame`;

export const getBasescanAddressUrl = (address: string) =>
  `${BASESCAN_BASE_URL}/address/${address}`;
export const getThirdwebAddressUrl = (address: string) =>
  `${THIRDWEB_BASE_URL}/${address}`;
