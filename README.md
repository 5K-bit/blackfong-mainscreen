# Blackfong - BKFG Protocol

A Base OnchainKit miniapp built with Next.js, following the [official Base documentation](https://docs.base.org/get-started/build-app).

## Features

- ✅ Base OnchainKit integration
- ✅ Wallet connection (Coinbase Wallet, MetaMask, WalletConnect)
- ✅ Transaction component for on-chain interactions
- ✅ ERC20 token contract integration
- ✅ Farcaster miniapp compatible

## Getting Started

First, install dependencies:

```bash
npm install
```

Next, create a `.env.local` file with your OnchainKit API key:

```bash
NEXT_PUBLIC_ONCHAINKIT_API_KEY=your_api_key_here
```

Get your API key from [Coinbase Developer Portal](https://portal.cdp.coinbase.com/).

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Deployment to Vercel

### 1. Push to GitHub

The repository is already initialized. Push to GitHub:

```bash
git push -u origin main
```

If you need to authenticate, use one of these methods:

**Option A: SSH (Recommended)**
```bash
git remote set-url origin git@github.com:5K-bit/blackfong-mainscreen.git
git push -u origin main
```

**Option B: Personal Access Token**
1. Go to GitHub Settings → Developer settings → Personal access tokens
2. Create a token with `repo` permissions
3. Use it as your password when pushing

### 2. Deploy to Vercel

1. Go to [Vercel](https://vercel.com) and sign in
2. Click "Add New Project"
3. Import your GitHub repository: `5K-bit/blackfong-mainscreen`
4. Configure environment variables:
   - `NEXT_PUBLIC_ONCHAINKIT_API_KEY` - Your OnchainKit API key
   - `NEXT_PUBLIC_PROJECT_NAME` (optional) - Project name
5. Click "Deploy"

Vercel will automatically:
- Detect Next.js
- Install dependencies
- Build and deploy your app
- Provide a live URL

### 3. Environment Variables in Vercel

After deployment, add/update environment variables in:
**Vercel Dashboard → Your Project → Settings → Environment Variables**

Required:
- `NEXT_PUBLIC_ONCHAINKIT_API_KEY` - Your OnchainKit API key from [portal.cdp.coinbase.com](https://portal.cdp.coinbase.com/)

## Base & Farcaster Compliance

This app follows the official Base documentation:
- Uses `@coinbase/onchainkit` latest version
- Implements `OnchainKitProvider` with Base chain
- Uses `Transaction` component per Base docs
- Includes proper wallet configuration
- Compatible with Farcaster miniapp standards

## Learn More

- [Base OnchainKit Documentation](https://docs.base.org/onchainkit)
- [Base Getting Started Guide](https://docs.base.org/get-started/build-app)
- [Next.js Documentation](https://nextjs.org/docs)
- [Vercel Deployment Guide](https://vercel.com/docs)
