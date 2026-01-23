"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import styles from "./page.module.css";
import {
  Wallet,
  ConnectWallet,
  WalletDropdown,
} from "@coinbase/onchainkit/wallet";
import {
  Transaction,
  TransactionButton,
  TransactionToast,
} from "@coinbase/onchainkit/transaction";
import {
  Swap,
  SwapAmountInput,
  SwapToggleButton,
  SwapButton,
  SwapMessage,
  SwapToast,
} from "@coinbase/onchainkit/swap";
import { useAccount, useReadContract } from "wagmi";
import { formatUnits, parseUnits } from "viem";
import { BKFG_ABI } from "@/lib/abi";
import {
  BASE_CHAIN_ID,
  BKFG_CONTRACT_ADDRESS,
  getBasescanAddressUrl,
  getThirdwebAddressUrl,
} from "@/lib/constants";
import { BKFG_TOKEN, ETH_TOKEN, SWAPPABLE_TOKENS } from "@/lib/tokens";

export default function Home() {
  const [isBuyOpen, setIsBuyOpen] = useState(false);
  const [burnAmount, setBurnAmount] = useState("1");
  const [lastBurnedAmount, setLastBurnedAmount] = useState<string | null>(null);
  const { address } = useAccount();

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

  const burnError = (() => {
    if (!address) return "Connect wallet to summon the core.";
    if (balanceValue === null) return "Reading your BKFG balance...";
    if (!burnAmount) return "Enter a burn amount.";
    if (!burnAmountIsValid) return "Burn amount must be greater than zero.";
    if (!hasSufficientBalance) return "Insufficient BKFG balance.";
    return null;
  })();

  return (
    <main className={styles.container}>
      {/* Background Ambient Effect */}
      <div className={styles.noise} />

      {/* Header */}
      <header className={styles.headerWrapper}>
        <div className={styles.logoSmall}>BKFG // {BKFG_CONTRACT_ADDRESS}</div>
        <Wallet>
          <ConnectWallet className={styles.customWallet} />
          <WalletDropdown />
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
              setLastBurnedAmount(burnAmount);
              refetchBalance();
              refetchTotalSupply();
            }}
            className={styles.transactionWrapper}
          >
            <TransactionButton
              disabled={!canBurn}
              render={({ onSubmit, status, isDisabled }) => {
                const label =
                  status === "success"
                    ? "View Transaction"
                    : status === "pending"
                      ? "Summoning..."
                      : "Summon Core";

                return (
                  <button
                    type="button"
                    className={styles.ritualButton}
                    onClick={onSubmit}
                    disabled={isDisabled}
                    aria-disabled={isDisabled}
                  >
                    <span className={styles.buttonText}>{label}</span>
                  </button>
                );
              }}
            />
            <TransactionToast />
          </Transaction>
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
                {formatAmount(balanceValue)} BKFG
              </span>
            </div>
            <div className={styles.ritualRow}>
              <span className={styles.ritualLabel}>Total supply (before)</span>
              <span className={styles.ritualValue}>
                {formatAmount(totalSupplyValue)} BKFG
              </span>
            </div>
            <div className={styles.ritualRow}>
              <span className={styles.ritualLabel}>Total supply (after)</span>
              <span className={styles.ritualValue}>
                {formatAmount(totalSupplyAfter)} BKFG
              </span>
            </div>
            <div className={styles.ritualRow}>
              <span className={styles.ritualLabel}>Last burned</span>
              <span className={styles.ritualValue}>
                {lastBurnedAmount ? `${lastBurnedAmount} BKFG` : "—"}
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

      {/* Floating Buy Dropdown */}
      <div className={styles.floatingBuyContainer}>
        <button
          className={styles.buyToggleButton}
          onClick={() => setIsBuyOpen(!isBuyOpen)}
          aria-label="Toggle Buy Menu"
          aria-expanded={isBuyOpen}
          aria-controls="bkfg-buy-panel"
        >
          <span className={styles.buttonText}>BUY</span>
        </button>
        
        {isBuyOpen && (
          <div className={styles.buyDropdown} id="bkfg-buy-panel">
            <div className={styles.swapContainer}>
              <Swap>
                <SwapAmountInput
                  label="Sell"
                  token={ETH_TOKEN}
                  swappableTokens={SWAPPABLE_TOKENS}
                  type="from"
                />
                <SwapToggleButton className={styles.swapToggleButton} />
                <SwapAmountInput
                  label="Buy"
                  token={BKFG_TOKEN}
                  swappableTokens={SWAPPABLE_TOKENS}
                  type="to"
                />
                <SwapButton />
                <SwapMessage />
                <SwapToast />
              </Swap>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

