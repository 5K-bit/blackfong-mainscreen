"use client";

import { useState } from "react";
import Image from "next/image";
import styles from "./page.module.css";
import { Wallet, ConnectWallet } from "@coinbase/onchainkit/wallet";
import { Transaction } from "@coinbase/onchainkit/transaction";
import {
  Swap,
  SwapAmountInput,
  SwapToggleButton,
  SwapButton,
  SwapMessage,
  SwapToast,
} from "@coinbase/onchainkit/swap";
import type { Token } from "@coinbase/onchainkit/token";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "./calls";
import { parseEther } from "viem";

export default function Home() {
  const [isBuyOpen, setIsBuyOpen] = useState(false);

  // ETH token definition for Base
  const ETHToken: Token = {
    address: "",
    chainId: 8453,
    decimals: 18,
    name: "Ethereum",
    symbol: "ETH",
    image:
      "https://dynamic-assets.coinbase.com/dbb4b4983bde81309ddab83eb598358eb44375b930b94687ebe38bc22e52c3b2125258ffb8477a5ef22e33d6bd72e32a506c391caa13af64c00e46613c3e5806/asset_icons/4113b082d21cc5fab17fc8f2d19fb996165bcce635e6900f7fc2d57c4ef33ae9.png",
  };

  // BKFG token definition
  const BKFGToken: Token = {
    address: CONTRACT_ADDRESS,
    chainId: 8453,
    decimals: 18, // Update if your token uses different decimals
    name: "Blackfong",
    symbol: "BKFG",
    image: "", // Add your token logo URL if available
  };

  return (
    <main className={styles.container}>
      {/* Background Ambient Effect */}
      <div className={styles.noise} />

      {/* Header */}
      <header className={styles.headerWrapper}>
        <div className={styles.logoSmall}>BKFG // {CONTRACT_ADDRESS}</div>
        <Wallet>
          <ConnectWallet className={styles.customWallet} />
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
            href={`https://basescan.org/address/${CONTRACT_ADDRESS}`}
            target="_blank"
            rel="noreferrer"
            className={styles.ritualButton}
          >
            <span className={styles.buttonText}>View Contract</span>
            <span className={styles.buttonBracket}></span>
          </a>
          <a
            href={`https://thirdweb.com/base/${CONTRACT_ADDRESS}`}
            target="_blank"
            rel="noreferrer"
            className={styles.ritualButton}
          >
            <span className={styles.buttonText}>Buy on Thirdweb</span>
            <span className={styles.buttonBracket}></span>
          </a>
          <Transaction
            chainId={8453}
            calls={[
              {
                address: CONTRACT_ADDRESS,
                abi: CONTRACT_ABI,
                functionName: "transfer",
                args: [
                  "0x0000000000000000000000000000000000000000" as `0x${string}`,
                  parseEther("0"),
                ],
              },
            ]}
          >
            <div className={styles.ritualButton}>
              <span className={styles.buttonText}>Summon Core</span>
            </div>
          </Transaction>
          <a
            href="#"
            className={styles.ritualButton}
          >
            <span className={styles.buttonText}>Enter Void</span>
            <span className={styles.buttonBracket}></span>
          </a>
        </nav>
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
        >
          <span className={styles.buttonText}>BUY</span>
        </button>
        
        {isBuyOpen && (
          <div className={styles.buyDropdown}>
            <div className={styles.swapContainer}>
              <Swap>
                <SwapAmountInput
                  label="Sell"
                  token={ETHToken}
                  type="from"
                />
                <SwapToggleButton className={styles.swapToggleButton} />
                <SwapAmountInput
                  label="Buy"
                  token={BKFGToken}
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

