"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import styles from "./page.module.css";
import {
  Wallet,
  ConnectWallet,
  WalletDropdown,
  WalletDropdownBasename,
  WalletDropdownFundLink,
  WalletDropdownLink,
  WalletDropdownDisconnect,
} from "@coinbase/onchainkit/wallet";
import {
  Transaction,
  TransactionButton,
  TransactionToast,
} from "@coinbase/onchainkit/transaction";
import { Buy } from "@coinbase/onchainkit/buy";
import type { SwapError, LifecycleStatus } from "@coinbase/onchainkit/swap";
import {
  useAccount,
  usePublicClient,
  useReadContract,
} from "wagmi";
import { formatUnits, parseUnits } from "viem";
import type { TransactionReceipt } from "viem";
import { BKFG_ABI, BKFG_TRANSFER_EVENT } from "@/lib/abi";
import {
  BASE_CHAIN_ID,
  BKFG_CONTRACT_ADDRESS,
  BKFG_DEPLOYMENT_BLOCK,
  ZERO_ADDRESS,
  getBasescanAddressUrl,
  getThirdwebAddressUrl,
} from "@/lib/constants";
import { BKFG_TOKEN } from "@/lib/tokens";

export default function Home() {
  const [burnAmount, setBurnAmount] = useState("1");
  const [lastBurnedAmount, setLastBurnedAmount] = useState<bigint | null>(null);
  const [lastUserBurnedAmount, setLastUserBurnedAmount] =
    useState<bigint | null>(null);
  const [isBurnHistoryLoading, setIsBurnHistoryLoading] = useState(false);
  const { address } = useAccount();
  const publicClient = usePublicClient({ chainId: BASE_CHAIN_ID });

  const { data: decimalsData } = useReadContract({
    address: BKFG_CONTRACT_ADDRESS,
    abi: BKFG_ABI,
    functionName: "decimals",
    chainId: BASE_CHAIN_ID,
  });

  const decimals = Number(decimalsData ?? 18);

  const { data: totalSupply, refetch: refetchTotalSupply } = useReadContract({
    address: BKFG_CONTRACT_ADDRESS,
    abi: BKFG_ABI,
    functionName: "totalSupply",
    chainId: BASE_CHAIN_ID,
  });

  const { data: balanceOf, refetch: refetchBalance } = useReadContract({
    address: BKFG_CONTRACT_ADDRESS,
    abi: BKFG_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    chainId: BASE_CHAIN_ID,
    query: {
      enabled: Boolean(address),
    },
  });

  const burnAmountParsed = useMemo(() => {
    if (!burnAmount) return null;
    try {
      return parseUnits(burnAmount, decimals);
    } catch {
      return null;
    }
  }, [burnAmount, decimals]);

  const zero = BigInt(0);

  const balanceValue = typeof balanceOf === "bigint" ? balanceOf : null;
  const totalSupplyValue = typeof totalSupply === "bigint" ? totalSupply : null;

  const burnAmountIsValid =
    burnAmountParsed !== null && burnAmountParsed > zero;
  const hasSufficientBalance =
    burnAmountParsed !== null &&
    balanceValue !== null &&
    balanceValue >= burnAmountParsed;
  const canBurn = Boolean(address) && burnAmountIsValid && hasSufficientBalance;

  const totalSupplyAfter = useMemo(() => {
    if (totalSupplyValue === null || totalSupplyValue === undefined) return null;
    if (burnAmountParsed === null) return null;
    if (burnAmountParsed > totalSupplyValue) return null;
    return totalSupplyValue - burnAmountParsed;
  }, [burnAmountParsed, totalSupplyValue]);

  const formatAmount = (value?: bigint | null) => {
    if (value === null || value === undefined) return "—";
    const formatted = formatUnits(value, decimals);
    const [whole, fraction = ""] = formatted.split(".");
    const trimmedFraction = fraction.replace(/0+$/, "").slice(0, 6);
    return trimmedFraction ? `${whole}.${trimmedFraction}` : whole;
  };

  const formatTokenAmount = (value?: bigint | null) => {
    const formatted = formatAmount(value);
    return formatted === "—" ? "—" : `${formatted} BKFG`;
  };

  const burnError = (() => {
    if (!address) return "Connect wallet to summon the core.";
    if (balanceValue === null) return "Reading your BKFG balance...";
    if (!burnAmount) return "Enter a burn amount.";
    if (!burnAmountIsValid) return "Burn amount must be greater than zero.";
    if (!hasSufficientBalance) return "Insufficient BKFG balance.";
    return null;
  })();

  // Token list and quote fetching is now handled by OnchainKit Buy component

  // Fetch burn history for the BKFG token
  const fetchBurnHistory = useCallback(async () => {
    if (!publicClient) return;
    setIsBurnHistoryLoading(true);
    try {
      const latestBlock = await publicClient.getBlockNumber();
      const burnLogs = await publicClient.getLogs({
        address: BKFG_CONTRACT_ADDRESS,
        event: BKFG_TRANSFER_EVENT,
        args: {
          to: ZERO_ADDRESS,
        },
        fromBlock: BKFG_DEPLOYMENT_BLOCK,
        toBlock: latestBlock,
      });
      const latestBurn = burnLogs[burnLogs.length - 1];
      setLastBurnedAmount(latestBurn?.args?.amount ?? null);

      if (address) {
        const userBurnLogs = await publicClient.getLogs({
          address: BKFG_CONTRACT_ADDRESS,
          event: BKFG_TRANSFER_EVENT,
          args: {
            from: address,
            to: ZERO_ADDRESS,
          },
          fromBlock: BKFG_DEPLOYMENT_BLOCK,
          toBlock: latestBlock,
        });
        const latestUserBurn = userBurnLogs[userBurnLogs.length - 1];
        setLastUserBurnedAmount(latestUserBurn?.args?.amount ?? null);
      } else {
        setLastUserBurnedAmount(null);
      }
    } catch {
      setLastBurnedAmount(null);
      setLastUserBurnedAmount(null);
    } finally {
      setIsBurnHistoryLoading(false);
    }
  }, [address, publicClient]);

  useEffect(() => {
    fetchBurnHistory();
  }, [fetchBurnHistory]);

  return (
    <main className={styles.container}>
      {/* Background Ambient Effect */}
      <div className={styles.noise} />

      {/* Header */}
      <header className={styles.headerWrapper}>
        <div className={styles.logoSmall}>BKFG // {BKFG_CONTRACT_ADDRESS}</div>
<Wallet>
  <ConnectWallet className={styles.customWallet} />
  <WalletDropdown>
            <WalletDropdownBasename />
            <WalletDropdownFundLink />
            <WalletDropdownLink
              icon="wallet"
              href="https://keys.coinbase.com"
              target="_blank"
              rel="noreferrer"
            >
              Wallet
            </WalletDropdownLink>
            <WalletDropdownLink
              icon="wallet"
              href={getBasescanAddressUrl(BKFG_CONTRACT_ADDRESS)}
              target="_blank"
              rel="noreferrer"
            >
              View BKFG on Basescan
            </WalletDropdownLink>
            <WalletDropdownDisconnect />
          </WalletDropdown>
        </Wallet>
      </header>

      {/* Main Content */}
      <div className={styles.content}>
        {/* The Core Artifact */}
        <div className={styles.cubeWrapper}>
          <div className={styles.cubeGlow} />
          <Image
            src="/blackfgong-cube.svg"
            alt="Blackfong Cube"
            width={220}
            height={220}
            className={styles.cubeImage}
            priority
          />
        </div>

        {/* Text Section */}
        <section className={styles.textSection}>
          <h1 className={styles.title}>BLACKFONG</h1>
          <p className={styles.subtitle}>[ CIRCULATION INTERFACE ]</p>

          <div className={styles.manifesto}>
            <p>Blackfong is not an app.</p>
            <p>
              It is an <span className={styles.highlight}>artifact</span>.
            </p>
            <p>BKFG is its bloodstream.</p>
          </div>

          <div className={styles.ritualBox}>
            <div className={styles.scannerLine} />
            <p>The cube does not ask for permission. It waits for interaction.</p>
          </div>
        </section>

        {/* Actions */}
        <nav className={styles.actionsGrid}>
          <a
            href={getBasescanAddressUrl(BKFG_CONTRACT_ADDRESS)}
            target="_blank"
            rel="noreferrer"
            className={styles.ritualButton}
          >
            <span className={styles.buttonText}>View Contract</span>
            <span className={styles.buttonBracket}></span>
          </a>
          <a
            href={getThirdwebAddressUrl(BKFG_CONTRACT_ADDRESS)}
            target="_blank"
            rel="noreferrer"
            className={styles.ritualButton}
          >
            <span className={styles.buttonText}>Buy on Thirdweb</span>
            <span className={styles.buttonBracket}></span>
          </a>
          {!address ? (
            <ConnectWallet
              className={styles.ritualButton}
              disconnectedLabel={
                <span className={styles.buttonText}>Connect Wallet</span>
              }
            />
          ) : (
            <Transaction
              chainId={BASE_CHAIN_ID}
              calls={
                burnAmountIsValid && burnAmountParsed
                  ? [
                      {
                        address: BKFG_CONTRACT_ADDRESS,
                        abi: BKFG_ABI,
                        functionName: "burn",
                        args: [burnAmountParsed],
                      },
                    ]
                  : undefined
              }
              onSuccess={() => {
                refetchBalance();
                refetchTotalSupply();
                fetchBurnHistory();
              }}
              className={styles.transactionWrapper}
            >
              <TransactionButton
                disabled={!canBurn}
                render={(params: { onSubmit: () => void; status: string; isDisabled: boolean }) => {
                  const label =
                    params.status === "success"
                      ? "View Transaction"
                      : params.status === "pending"
                        ? "Summoning..."
                        : "Summon Core";

                  return (
                    <button
                      type="button"
                      className={styles.ritualButton}
                      onClick={params.onSubmit}
                      disabled={params.isDisabled}
                      aria-disabled={params.isDisabled}
                    >
                      <span className={styles.buttonText}>{label}</span>
                    </button>
                  );
                }}
              />
              <TransactionToast />
            </Transaction>
          )}
          <a
            href="#"
            className={styles.ritualButton}
          >
            <span className={styles.buttonText}>Enter Void</span>
            <span className={styles.buttonBracket}></span>
          </a>
        </nav>

        <section className={styles.ritualPanel} aria-label="Summon Core Ritual">
          <div className={styles.ritualHeader}>SUMMON CORE // BURN BKFG</div>
          <div className={styles.ritualField}>
            <label htmlFor="burn-amount">Burn amount (BKFG)</label>
            <input
              id="burn-amount"
              className={styles.ritualInput}
              inputMode="decimal"
              type="text"
              value={burnAmount}
              onChange={(event) => setBurnAmount(event.target.value)}
              placeholder="1.0"
              aria-describedby="burn-hint"
            />
          </div>
          <div className={styles.ritualStats}>
            <div className={styles.ritualRow}>
              <span className={styles.ritualLabel}>Balance</span>
              <span className={styles.ritualValue}>
                {formatTokenAmount(balanceValue)}
              </span>
            </div>
            <div className={styles.ritualRow}>
              <span className={styles.ritualLabel}>Total supply (before)</span>
              <span className={styles.ritualValue}>
                {formatTokenAmount(totalSupplyValue)}
              </span>
            </div>
            <div className={styles.ritualRow}>
              <span className={styles.ritualLabel}>Total supply (after)</span>
              <span className={styles.ritualValue}>
                {formatTokenAmount(totalSupplyAfter)}
              </span>
            </div>
            <div className={styles.ritualRow}>
              <span className={styles.ritualLabel}>Last burn (chain)</span>
              <span className={styles.ritualValue}>
                {isBurnHistoryLoading
                  ? "Reading ledger..."
                  : formatTokenAmount(lastBurnedAmount)}
              </span>
            </div>
            <div className={styles.ritualRow}>
              <span className={styles.ritualLabel}>Last burn (you)</span>
              <span className={styles.ritualValue}>
                {address
                  ? isBurnHistoryLoading
                    ? "Reading ledger..."
                    : formatTokenAmount(lastUserBurnedAmount)
                  : "—"}
              </span>
            </div>
          </div>
          <p className={styles.ritualHint} id="burn-hint">
            {burnError ?? "Offer BKFG to the core. The chain will remember."}
          </p>
        </section>
      </div>

      {/* Footer */}
      <footer className={styles.footer}>
        <p>© 2025–2026 // PROTOCOL_BKFG</p>
      </footer>

      {/* OnchainKit Buy Component */}
      <div className={styles.floatingBuyContainer}>
        <Buy
          toToken={BKFG_TOKEN}
          config={{
            maxSlippage: 3,
          }}
          onStatus={(lifecycleStatus: LifecycleStatus) => {
            console.log("Buy Status:", lifecycleStatus);
          }}
          onSuccess={(transactionReceipt?: TransactionReceipt) => {
            console.log("Buy Success:", transactionReceipt);
          }}
          onError={(error: SwapError) => {
            console.error("Buy Error:", error);
          }}
        />
      </div>
    </main>
  );
}

