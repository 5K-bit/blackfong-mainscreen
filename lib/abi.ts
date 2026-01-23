import { parseAbi } from "viem";

export const BKFG_ABI = parseAbi([
  "function burn(uint256 amount)",
  "function balanceOf(address owner) view returns (uint256)",
  "function totalSupply() view returns (uint256)",
  "function decimals() view returns (uint8)",
]);
