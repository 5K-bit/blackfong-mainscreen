"use client";

import { useState } from "react";
import Image from "next/image";
import styles from "./page.module.css";
import { Wallet, ConnectWallet, WalletDropdown } from "@coinbase/onchainkit/wallet";
import {
  Swap,
  SwapAmountInput,
  SwapToggleButton,
  SwapButton,
  SwapMessage,
  SwapToast,
} from "@coinbase/onchainkit/swap";
import {
  BKFG_CONTRACT_ADDRESS,
  getBasescanAddressUrl,
  getThirdwebAddressUrl,
} from "@/lib/constants";
import { BKFG_TOKEN, ETH_TOKEN, SWAPPABLE_TOKENS } from "@/lib/tokens";

export default function Home() {
  const [isBuyOpen, setIsBuyOpen] = useState(false);

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
          <button
            type="button"
            className={styles.ritualButton}
            onClick={() => setIsBuyOpen(true)}
            aria-controls="bkfg-buy-panel"
          >
            <span className={styles.buttonText}>Summon Core</span>
          </button>
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

