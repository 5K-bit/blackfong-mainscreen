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
import {
  useAccount,
  useChainId,
  usePublicClient,
  useReadContract,
  useSendTransaction,
  useSwitchChain,
} from "wagmi";
import { encodeFunctionData, formatUnits, parseUnits } from "viem";
import type { Token } from "@coinbase/onchainkit/token";
import { BKFG_ABI, BKFG_TRANSFER_EVENT, ERC20_ABI } from "@/lib/abi";
import {
  BASE_CHAIN_ID,
  BKFG_CONTRACT_ADDRESS,
  BKFG_DEPLOYMENT_BLOCK,
  UNISWAP_TOKEN_LIST_URL,
  ZERO_ADDRESS,
  getBasescanAddressUrl,
  getThirdwebAddressUrl,
} from "@/lib/constants";
import { BKFG_TOKEN, ETH_TOKEN, SWAPPABLE_TOKENS } from "@/lib/tokens";

type ZeroXQuote = {
  price: string;
  buyAmount: string;
  sellAmount: string;
  to: string;
  data: string;
  value: string;
  allowanceTarget?: string;
  estimatedGas?: string;
};

const isHexAddress = (value: string): value is `0x${string}` =>
  /^0x[a-fA-F0-9]{40}$/.test(value);

const getTokenKey = (token: Token) =>
  `${token.chainId}:${token.address ? token.address.toLowerCase() : "native"}`;

export default function Home() {
  const [isBuyOpen, setIsBuyOpen] = useState(false);
  const [burnAmount, setBurnAmount] = useState("1");
  const [lastBurnedAmount, setLastBurnedAmount] = useState<bigint | null>(null);
  const [lastUserBurnedAmount, setLastUserBurnedAmount] =
    useState<bigint | null>(null);
  const [isBurnHistoryLoading, setIsBurnHistoryLoading] = useState(false);
  const [isTokenListLoading, setIsTokenListLoading] = useState(false);
  const [tokenListError, setTokenListError] = useState<string | null>(null);
  const [swappableTokens, setSwappableTokens] =
    useState<Token[]>(SWAPPABLE_TOKENS);
  const [sellToken, setSellToken] = useState<Token>(ETH_TOKEN);
  const [buyToken, setBuyToken] = useState<Token>(BKFG_TOKEN);
  const [sellAmount, setSellAmount] = useState("0.01");
  const [buyAmount, setBuyAmount] = useState("");
  const [quote, setQuote] = useState<ZeroXQuote | null>(null);
  const [quoteError, setQuoteError] = useState<string | null>(null);
  const [isQuoteLoading, setIsQuoteLoading] = useState(false);
  const [isApproveSubmitting, setIsApproveSubmitting] = useState(false);
  const [isSwapSubmitting, setIsSwapSubmitting] = useState(false);
  const [swapTxHash, setSwapTxHash] = useState<`0x${string}` | null>(null);
  const [approveTxHash, setApproveTxHash] =
    useState<`0x${string}` | null>(null);
  const { address } = useAccount();
  const chainId = useChainId();
  const publicClient = usePublicClient({ chainId: BASE_CHAIN_ID });
  const { sendTransactionAsync } = useSendTransaction();
  const { switchChainAsync, isPending: isSwitchingChain } = useSwitchChain();

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

  const isSellTokenNative = sellToken.address === "";
  const isBuyTokenNative = buyToken.address === "";
  const sellTokenParam = isSellTokenNative ? "ETH" : sellToken.address;
  const buyTokenParam = isBuyTokenNative ? "ETH" : buyToken.address;

  const sellAmountParsed = useMemo(() => {
    if (!sellAmount) return null;
    try {
      return parseUnits(sellAmount, sellToken.decimals);
    } catch {
      return null;
    }
  }, [sellAmount, sellToken.decimals]);

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

  const isCorrectChain = chainId === BASE_CHAIN_ID;

  useEffect(() => {
    console.log("Chain:", chainId);
  }, [chainId]);

  useEffect(() => {
    let isActive = true;
    const loadTokens = async () => {
      setIsTokenListLoading(true);
      setTokenListError(null);
      try {
        const response = await fetch(UNISWAP_TOKEN_LIST_URL);
        if (!response.ok) {
          throw new Error(`Token list HTTP ${response.status}`);
        }
        const payload = await response.json();
        type TokenListItem = {
          address?: string;
          chainId?: number;
          decimals?: number;
          name?: string;
          symbol?: string;
          logoURI?: string | null;
        };

        const rawTokens = Array.isArray(payload?.tokens)
          ? (payload.tokens as TokenListItem[])
          : [];

        const filtered = rawTokens.filter(
          (
            token
          ): token is Required<
            Pick<TokenListItem, "address" | "chainId" | "decimals" | "name" | "symbol">
          > &
            TokenListItem =>
            token?.chainId === BASE_CHAIN_ID &&
            typeof token.address === "string" &&
            isHexAddress(token.address) &&
            typeof token.decimals === "number" &&
            typeof token.name === "string" &&
            typeof token.symbol === "string"
        );

        const mapped: Token[] = filtered.map((token) => ({
          address: token.address as `0x${string}`,
          chainId: token.chainId,
          decimals: token.decimals,
          name: token.name,
          symbol: token.symbol,
          image: token.logoURI ?? null,
        }));

        const merged = new Map<string, Token>();
        const addToken = (token: Token) => {
          const key = getTokenKey(token);
          if (!merged.has(key)) {
            merged.set(key, token);
          }
        };

        [ETH_TOKEN, BKFG_TOKEN].forEach(addToken);
        mapped.forEach(addToken);

        if (isActive) {
          console.log("Token list loaded:", mapped.length);
          setSwappableTokens(Array.from(merged.values()));
        }
      } catch (error) {
        if (isActive) {
          console.log("Token list load failed:", error);
          setTokenListError("Token registry failed to load.");
          setSwappableTokens(SWAPPABLE_TOKENS);
        }
      } finally {
        if (isActive) {
          setIsTokenListLoading(false);
        }
      }
    };

    loadTokens();
    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    if (!swappableTokens.length) return;
    const tokenMap = new Map(
      swappableTokens.map((token) => [getTokenKey(token), token])
    );
    if (!tokenMap.has(getTokenKey(sellToken))) {
      setSellToken(ETH_TOKEN);
    }
    if (!tokenMap.has(getTokenKey(buyToken))) {
      setBuyToken(BKFG_TOKEN);
    }
  }, [swappableTokens, sellToken, buyToken]);

  const zeroXApiKey = process.env.NEXT_PUBLIC_0X_KEY ?? "";
  const hasApiKey = Boolean(zeroXApiKey);
  const canRequestQuote =
    hasApiKey &&
    isCorrectChain &&
    Boolean(sellAmountParsed) &&
    sellTokenParam !== buyTokenParam &&
    !isTokenListLoading;

  useEffect(() => {
    let isActive = true;
    if (!canRequestQuote) {
      setQuote(null);
      setBuyAmount("");
      setQuoteError(null);
      setIsQuoteLoading(false);
      return () => {
        isActive = false;
      };
    }

    const timeout = setTimeout(async () => {
      try {
        setIsQuoteLoading(true);
        setQuoteError(null);
        const params = new URLSearchParams({
          chainId: BASE_CHAIN_ID.toString(),
          sellToken: sellTokenParam,
          buyToken: buyTokenParam,
          sellAmount: sellAmountParsed!.toString(),
        });
        if (address) {
          params.set("takerAddress", address);
        }
        const response = await fetch(
          `https://api.0x.org/swap/v1/quote?${params.toString()}`,
          {
            headers: {
              "0x-api-key": zeroXApiKey,
            },
          }
        );
        const payload = await response.json();
        if (!response.ok) {
          throw new Error(payload?.reason || "0x quote failed.");
        }
        if (!isActive) return;
        setQuote(payload as ZeroXQuote);
        const buyAmountValue = BigInt(payload.buyAmount);
        const formattedBuy = formatUnits(buyAmountValue, buyToken.decimals);
        setBuyAmount(formattedBuy);
      } catch (error) {
        if (!isActive) return;
        console.log("Quote error:", error);
        setQuote(null);
        setBuyAmount("");
        setQuoteError(
          error instanceof Error ? error.message : "Failed to fetch quote."
        );
      } finally {
        if (isActive) {
          setIsQuoteLoading(false);
        }
      }
    }, 400);

    return () => {
      isActive = false;
      clearTimeout(timeout);
    };
  }, [
    address,
    buyToken.decimals,
    buyTokenParam,
    canRequestQuote,
    sellAmountParsed,
    sellTokenParam,
    swappableTokens.length,
    zeroXApiKey,
  ]);

  const allowanceTarget = useMemo(() => {
    if (!quote?.allowanceTarget) return null;
    return isHexAddress(quote.allowanceTarget)
      ? (quote.allowanceTarget as `0x${string}`)
      : null;
  }, [quote?.allowanceTarget]);

  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: !isSellTokenNative
      ? (sellToken.address as `0x${string}`)
      : undefined,
    abi: ERC20_ABI,
    functionName: "allowance",
    args: address && allowanceTarget ? [address, allowanceTarget] : undefined,
    chainId: BASE_CHAIN_ID,
    query: {
      enabled: Boolean(address && allowanceTarget && !isSellTokenNative),
    },
  });

  const needsApproval =
    !isSellTokenNative &&
    sellAmountParsed !== null &&
    typeof allowance === "bigint" &&
    allowance < sellAmountParsed;

  const swapReady =
    isCorrectChain &&
    Boolean(address) &&
    Boolean(quote?.to) &&
    Boolean(quote?.data);

  useEffect(() => {
    console.log("Router ready:", swapReady);
  }, [swapReady]);

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

  const handleSwapToggle = useCallback(() => {
    setSellToken(buyToken);
    setBuyToken(sellToken);
    if (buyAmount) {
      setSellAmount(buyAmount);
    }
    setBuyAmount("");
    setQuote(null);
    setQuoteError(null);
  }, [buyAmount, buyToken, sellToken]);

  const handleApprove = useCallback(async () => {
    if (
      !address ||
      !allowanceTarget ||
      !sellAmountParsed ||
      isSellTokenNative
    ) {
      return;
    }
    try {
      setIsApproveSubmitting(true);
      setApproveTxHash(null);
      const data = encodeFunctionData({
        abi: ERC20_ABI,
        functionName: "approve",
        args: [allowanceTarget, sellAmountParsed],
      });
      const hash = await sendTransactionAsync({
        chainId: BASE_CHAIN_ID,
        to: sellToken.address as `0x${string}`,
        data,
        value: zero,
      });
      setApproveTxHash(hash);
      refetchAllowance();
    } finally {
      setIsApproveSubmitting(false);
    }
  }, [
    address,
    allowanceTarget,
    isSellTokenNative,
    refetchAllowance,
    sellAmountParsed,
    sellToken.address,
    zero,
    sendTransactionAsync,
  ]);

  const handleSwap = useCallback(async () => {
    if (!address || !quote) return;
    if (!isHexAddress(quote.to) || !quote.data) return;
    try {
      setIsSwapSubmitting(true);
      setSwapTxHash(null);
      const hash = await sendTransactionAsync({
        chainId: BASE_CHAIN_ID,
        to: quote.to as `0x${string}`,
        data: quote.data as `0x${string}`,
        value: BigInt(quote.value ?? "0"),
      });
      setSwapTxHash(hash);
    } finally {
      setIsSwapSubmitting(false);
    }
  }, [address, quote, sendTransactionAsync]);

  const swapStatus = (() => {
    if (!isCorrectChain) return "Switch to Base to unlock live routing.";
    if (!hasApiKey) return "Missing 0x API key.";
    if (isTokenListLoading) return "Loading token registry...";
    if (tokenListError) return tokenListError;
    if (!sellAmount) return "Enter a sell amount.";
    if (!sellAmountParsed) return "Enter a valid sell amount.";
    if (sellTokenParam === buyTokenParam) return "Select two different tokens.";
    if (isQuoteLoading) return "Fetching quote...";
    if (quoteError) return quoteError;
    return null;
  })();

  const tokenOptions = useMemo(
    () =>
      [...swappableTokens].sort((a, b) =>
        a.symbol.localeCompare(b.symbol)
      ),
    [swappableTokens]
  );

  const sellTokenKey = getTokenKey(sellToken);
  const buyTokenKey = getTokenKey(buyToken);
  const swapRate = useMemo(() => {
    if (!quote?.price) return "—";
    const price = Number(quote.price);
    if (!Number.isFinite(price)) return "—";
    return `1 ${sellToken.symbol} ≈ ${price.toFixed(6)} ${buyToken.symbol}`;
  }, [buyToken.symbol, quote?.price, sellToken.symbol]);
  const estimatedGas = quote?.estimatedGas
    ? `${Number(quote.estimatedGas).toLocaleString()} gas`
    : "—";
  const canApprove =
    needsApproval &&
    !isApproveSubmitting &&
    Boolean(address) &&
    Boolean(allowanceTarget);
  const canSwap =
    swapReady &&
    !needsApproval &&
    !isSwapSubmitting &&
    !isQuoteLoading &&
    !quoteError;

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
              {swapStatus && <p className={styles.swapStatus}>{swapStatus}</p>}
              <div className={styles.swapPanel}>
                <div className={styles.swapRow}>
                  <div className={styles.swapField}>
                    <label htmlFor="sell-amount">Sell</label>
                    <input
                      id="sell-amount"
                      className={styles.swapInput}
                      inputMode="decimal"
                      type="text"
                      value={sellAmount}
                      onChange={(event) => setSellAmount(event.target.value)}
                      placeholder="0.01"
                    />
                  </div>
                  <select
                    className={styles.swapSelect}
                    value={sellTokenKey}
                    onChange={(event) => {
                      const next = tokenOptions.find(
                        (token) => getTokenKey(token) === event.target.value
                      );
                      if (next) {
                        setSellToken(next);
                      }
                    }}
                  >
                    {tokenOptions.map((token) => (
                      <option key={getTokenKey(token)} value={getTokenKey(token)}>
                        {token.symbol}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="button"
                  className={styles.swapToggleButton}
                  onClick={handleSwapToggle}
                  aria-label="Toggle swap tokens"
                >
                  ↕
                </button>

                <div className={styles.swapRow}>
                  <div className={styles.swapField}>
                    <label htmlFor="buy-amount">Buy (est.)</label>
                    <input
                      id="buy-amount"
                      className={styles.swapInput}
                      type="text"
                      value={buyAmount}
                      readOnly
                      placeholder="—"
                    />
                  </div>
                  <select
                    className={styles.swapSelect}
                    value={buyTokenKey}
                    onChange={(event) => {
                      const next = tokenOptions.find(
                        (token) => getTokenKey(token) === event.target.value
                      );
                      if (next) {
                        setBuyToken(next);
                      }
                    }}
                  >
                    {tokenOptions.map((token) => (
                      <option key={getTokenKey(token)} value={getTokenKey(token)}>
                        {token.symbol}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.swapMeta}>
                  <div>Rate: {swapRate}</div>
                  <div>Estimated gas: {estimatedGas}</div>
                </div>

                <div className={styles.swapActions}>
                  {!address ? (
                    <ConnectWallet
                      className={styles.swapActionButton}
                      disconnectedLabel="Connect Wallet"
                    />
                  ) : !isCorrectChain ? (
                    <button
                      type="button"
                      className={styles.swapActionButton}
                      onClick={() => switchChainAsync({ chainId: BASE_CHAIN_ID })}
                      disabled={isSwitchingChain}
                    >
                      {isSwitchingChain ? "Switching..." : "Switch to Base"}
                    </button>
                  ) : needsApproval ? (
                    <button
                      type="button"
                      className={styles.swapActionButton}
                      onClick={handleApprove}
                      disabled={!canApprove}
                    >
                      {isApproveSubmitting ? "Approving..." : "Approve"}
                    </button>
                  ) : (
                    <button
                      type="button"
                      className={styles.swapActionButton}
                      onClick={handleSwap}
                      disabled={!canSwap}
                    >
                      {isSwapSubmitting ? "Swapping..." : "Swap"}
                    </button>
                  )}
                </div>

                {approveTxHash && (
                  <a
                    className={styles.swapLink}
                    href={`https://basescan.org/tx/${approveTxHash}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    View approval on Basescan
                  </a>
                )}
                {swapTxHash && (
                  <a
                    className={styles.swapLink}
                    href={`https://basescan.org/tx/${swapTxHash}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    View swap on Basescan
                  </a>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

