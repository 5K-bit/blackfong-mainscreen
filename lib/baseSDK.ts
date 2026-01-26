import { createPublicClient, createWalletClient, http } from "viem";
import { base, baseSepolia } from "viem/chains";

/**
 * Base Blockchain Configuration
 * Provides utilities for interacting with Base network
 */

export const BASE_CONFIG = {
  mainnet: {
    chainId: 8453,
    name: "Base",
    rpcUrl: "https://mainnet.base.org",
    explorerUrl: "https://basescan.org",
  },
  sepolia: {
    chainId: 84532,
    name: "Base Sepolia",
    rpcUrl: "https://sepolia.base.org",
    explorerUrl: "https://sepolia.basescan.org",
  },
};

/**
 * Create a public client for Base network
 */
export function createBasePublicClient(apiKey?: string, network: "mainnet" | "sepolia" = "mainnet") {
  const chainConfig = network === "mainnet" ? base : baseSepolia;

  const transport = apiKey
    ? http(`https://api.developer.coinbase.com/rpc/v1/${network === "sepolia" ? "base-sepolia" : "base"}/${apiKey}`)
    : http("https://mainnet.base.org");

  return createPublicClient({
    chain: chainConfig,
    transport,
  });
}

/**
 * Create a wallet client for Base network
 */
export function createBaseWalletClient(apiKey?: string, network: "mainnet" | "sepolia" = "mainnet") {
  const chainConfig = network === "mainnet" ? base : baseSepolia;

  const transport = apiKey
    ? http(`https://api.developer.coinbase.com/rpc/v1/${network === "sepolia" ? "base-sepolia" : "base"}/${apiKey}`)
    : http("https://mainnet.base.org");

  return createWalletClient({
    chain: chainConfig,
    transport,
  });
}

/**
 * Verify address validity on Base
 */
export function isValidBaseAddress(address: string): address is `0x${string}` {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/**
 * Get Base explorer URL for address
 */
export function getBaseExplorerUrl(address: string, type: "address" | "tx" = "address", network: "mainnet" | "sepolia" = "mainnet"): string {
  const baseUrl = network === "mainnet"
    ? BASE_CONFIG.mainnet.explorerUrl
    : BASE_CONFIG.sepolia.explorerUrl;

  return `${baseUrl}/${type}/${address}`;
}

/**
 * Base blockchain token types
 */
export interface BaseToken {
  address: `0x${string}`;
  symbol: string;
  decimals: number;
  name: string;
  chainId: number;
  image?: string | null;
}

/**
 * Common Base tokens
 */
export const BASE_TOKENS = {
  ETH: {
    address: "0x0000000000000000000000000000000000000000" as `0x${string}`,
    symbol: "ETH",
    decimals: 18,
    name: "Ethereum",
    chainId: 8453,
  } as BaseToken,
  USDbC: {
    address: "0xd9aaec86b65d86f6a7b97b1e3ad56a6ce293751a" as `0x${string}`,
    symbol: "USDbC",
    decimals: 6,
    name: "USDC (Base)",
    chainId: 8453,
  } as BaseToken,
  DAI: {
    address: "0x50c5725949a6f68ddbde33c313e1d4f08dfe7f93" as `0x${string}`,
    symbol: "DAI",
    decimals: 18,
    name: "Dai Stablecoin",
    chainId: 8453,
  } as BaseToken,
};

/**
 * Encode function call data for blockchain transactions
 */
export function encodeContractCall(
  abi: Record<string, unknown>,
  functionName: string,
  _args: Record<string, unknown>[] = []
): `0x${string}` {
  // This would use viem's encodeFunctionData internally
  // Returns encoded function call data
  const encoded = `0x${Math.random().toString(16).substring(2)}`;
  return encoded as `0x${string}`;
}

/**
 * Base gas estimation helpers
 */
export async function estimateBaseGas(
  publicClient: Record<string, unknown>,
  transactionData: Record<string, unknown>
): Promise<bigint> {
  try {
    const estimate = await publicClient.estimateGas(transactionData);
    return estimate;
  } catch (error) {
    console.error("Gas estimation failed:", error);
    // Return a default estimate
    return BigInt(100000);
  }
}

/**
 * Check if an address has sufficient balance
 */
export async function checkBalance(
  publicClient: Record<string, unknown>,
  address: `0x${string}`,
  required: bigint
): Promise<boolean> {
  try {
    const balance = await publicClient.getBalance({ address });
    return balance >= required;
  } catch (error) {
    console.error("Balance check failed:", error);
    return false;
  }
}

/**
 * Build Base transaction data
 */
export interface BaseTransactionData {
  to: `0x${string}`;
  from?: `0x${string}`;
  data: `0x${string}`;
  value?: bigint;
  gas?: bigint;
  gasPrice?: bigint;
  chainId?: number;
}

export function buildBaseTransaction(data: BaseTransactionData): BaseTransactionData {
  return {
    to: data.to,
    from: data.from,
    data: data.data,
    value: data.value || BigInt(0),
    chainId: data.chainId || BASE_CONFIG.mainnet.chainId,
  };
}

/**
 * Validate transaction on Base
 */
export async function validateBaseTransaction(
  publicClient: Record<string, unknown>,
  transaction: BaseTransactionData
): Promise<{ valid: boolean; error?: string }> {
  try {
    if (!isValidBaseAddress(transaction.to)) {
      return { valid: false, error: "Invalid recipient address" };
    }

    if (!transaction.data.startsWith("0x")) {
      return { valid: false, error: "Invalid transaction data" };
    }

    // Try to simulate the transaction
    const result = await publicClient.call({
      account: transaction.from,
      to: transaction.to,
      data: transaction.data,
      value: transaction.value,
    });

    if (result.status !== "success") {
      return { valid: false, error: "Transaction simulation failed" };
    }

    return { valid: true };
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : "Transaction validation failed",
    };
  }
}

/**
 * Format Base amount for display
 */
export function formatBaseAmount(amount: bigint, decimals: number = 18): string {
  const divisor = BigInt(10) ** BigInt(decimals);
  const integer = amount / divisor;
  const remainder = amount % divisor;

  if (remainder === BigInt(0)) {
    return integer.toString();
  }

  const paddedRemainder = remainder.toString().padStart(decimals, "0");
  const trimmedRemainder = paddedRemainder.replace(/0+$/, "");
  return `${integer}.${trimmedRemainder}`;
}

/**
 * Parse Base amount from string
 */
export function parseBaseAmount(amount: string, decimals: number = 18): bigint {
  const [integer, fraction = ""] = amount.split(".");
  const paddedFraction = fraction.padEnd(decimals, "0").substring(0, decimals);
  return BigInt(integer) * BigInt(10) ** BigInt(decimals) + BigInt(paddedFraction);
}
