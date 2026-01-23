"use client";

import { useState } from "react";
import Image from "next/image";
import styles from "./page.module.css";
import { Wallet, ConnectWallet } from "@coinbase/onchainkit/wallet";
import { Transaction } from "@coinbase/onchainkit/transaction";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "./calls";
import { parseEther } from "viem";

export default function Home() {
  const [isBuyOpen, setIsBuyOpen] = useState(false);

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
              <iframe
                id="iframe-widget"
                src={`https://tools.nfts2me.com/swap?widget=classic&toToken=${CONTRACT_ADDRESS}`}
                style={{ height: "480px", width: "100%", border: "none" }}
                title="Crypto Swap Widget"
              />
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

