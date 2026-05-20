# blackfong-mainscreen

blackfong-mainscreen is a Next.js front end for the BKFG token on Base, combining wallet connection, token burn flow, purchase entry points, and Farcaster frame support inside a branded Blackfong interface.

## What It Is

This repository is a web application for interacting with the BKFG token contract on Base. It includes:

- wallet connection through OnchainKit and Wagmi
- token reads for supply and wallet balance
- a burn transaction flow
- links to Base explorer and purchase surfaces
- a Farcaster frame endpoint for distribution outside the main app

The visual identity is intentionally Blackfong, but the repo is ultimately a working onchain interface rather than a generic starter.

## Why It Exists

This project exists to present BKFG through a controlled product surface that is more useful and more portfolio-ready than a raw contract page or tutorial scaffold.

## Problem It Solves

Token projects often have either bare infrastructure or generic demo front ends. blackfong-mainscreen solves that by pairing real Base integrations with a distinct branded interface for viewing, buying, and burning BKFG.

## Features

- connect Coinbase Wallet, MetaMask, and injected wallets
- read BKFG token supply and connected-wallet balance
- burn BKFG from the connected wallet
- show recent burn activity from the chain
- surface contract and purchase links
- include a Farcaster frame route at `/api/frame`
- provide additional integration docs in `QUICK_START.md` and `INTEGRATION_GUIDE.md`

## Tech Stack

- Next.js 15
- React 19
- TypeScript
- Coinbase OnchainKit
- Wagmi
- Viem
- TanStack Query
- Base mainnet and Base Sepolia support

## Quick Start

Install dependencies:

```bash
npm install
```

Create `.env.local`:

```bash
NEXT_PUBLIC_ONCHAINKIT_API_KEY=your_coinbase_api_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_PROJECT_NAME=Blackfong - BKFG Protocol
NEXT_PUBLIC_BKFG_DEPLOY_BLOCK=0
```

Run the development server:

```bash
npm run dev
```

Open `http://localhost:3000`.

## CLI / API Usage

Local scripts:

- `npm run dev`
- `npm run build`
- `npm run start`
- `npm run lint`

Key app routes:

- `/` for the main BKFG interface
- `GET /api/frame` for the frame HTML response
- `POST /api/frame` for frame interaction handling

Additional setup material is available in:

- `QUICK_START.md`
- `INTEGRATION_GUIDE.md`
- `INTEGRATION_SUMMARY.md`

## Screenshots

Screenshots are not added to the README yet. The current repo already contains the branded interface and is a good candidate for a follow-up screenshot pass.

## Status

Current status: active interface prototype with working chain integrations.

Implemented now:

- wallet connection and provider setup
- BKFG supply and balance reads
- burn transaction flow
- recent burn activity lookup
- Base explorer and purchase links
- Farcaster frame endpoint and metadata

Still worth tightening:

- README and docs consistency
- clearer environment variable guidance
- more explicit deployment and test coverage notes

## Roadmap

- add screenshots and a cleaner deployment checklist
- tighten documentation around required environment variables
- add tests around frame behavior and critical client logic
- continue reducing leftover scaffold language while preserving the current product direction

## Portfolio Note

blackfong-mainscreen is part of the Blackfong portfolio because it combines product identity with real onchain behavior. It shows frontend integration work across wallet UX, contract interaction, metadata, and distribution through Farcaster-compatible surfaces without leaning on cloud-heavy infrastructure.
