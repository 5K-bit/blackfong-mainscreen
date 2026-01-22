import { base } from "wagmi/chains";
import { parseAbi } from "viem";

export const CONTRACT_ADDRESS = "0xCD025D20B1284c79eE4c63e003E0f1E421FbE249" as `0x${string}`;
export const CONTRACT_CHAIN = base;

// ERC20 Token ABI - standard token functions
export const CONTRACT_ABI = parseAbi([
  "function transfer(address to, uint256 amount) returns (bool)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function balanceOf(address account) view returns (uint256)",
  "function totalSupply() view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
  "function name() view returns (string)",
  "function allowance(address owner, address spender) view returns (uint256)",
]);
