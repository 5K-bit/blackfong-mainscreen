# Blackfong Project - SDK Integration & Frames v2 Upgrade Guide

## Overview

This document outlines the integration of **Farcaster SDK**, **Base SDK**, and **Frames v2** improvements for full blockchain compatibility and enhanced Farcaster frame functionality.

## Updates Summary

### 1. **Farcaster Frame SDK v2 Integration** ✅

#### What's New:
- Updated from `@farcaster/frame-sdk` v0.1.12 to v0.18.0
- Added `@farcaster/frame-validation` for frame message validation
- Implemented proper Frames v2 specification compliance

#### Changes Made:
- **`lib/frames.ts`** - New comprehensive frames utility library
  - Frames v2 configuration and helpers
  - Frame message validation with timestamp checking
  - HTML metadata generation for Frames v2 spec
  - Button routing and state management
  - Security features (HTML escaping, state encoding)

- **`app/api/frame/route.ts`** - Upgraded API handler
  - Proper Frames v2 request validation
  - Error logging with timestamps
  - State management between frame interactions
  - Multi-step frame support
  - Improved error handling

- **`app/rootProvider.tsx`** - Added Farcaster SDK initialization
  - Frame SDK CDN injection for frame context
  - Ready event handling for frame communication

### 2. **Base SDK Integration** ✅

#### New Library:
**`lib/baseSDK.ts`** - Complete Base blockchain utilities

Features included:
- Public and wallet client creation with proper RPC configuration
- Base mainnet and Sepolia testnet support
- Address validation for Base network
- Explorer URL generation
- Common Base tokens (ETH, USDbC, DAI)
- Gas estimation and balance checking
- Transaction building and validation
- Amount formatting (wei ↔ decimal conversion)

```typescript
// Example usage:
import { createBasePublicClient, isValidBaseAddress, BASE_TOKENS } from "@/lib/baseSDK";

const client = createBasePublicClient(apiKey, "mainnet");
const isValid = isValidBaseAddress("0x...");
```

### 3. **Updated Dependencies** ✅

#### New Packages:
```json
{
  "@farcaster/frame-sdk": "^0.18.0",
  "@farcaster/frame-validation": "^0.2.0",
  "base-sdk": "^1.0.0",
  "eth-sdk": "^0.5.0"
}
```

All packages are compatible with:
- Next.js 15.5.9
- React 19
- Wagmi 2.16.3
- Viem 2.31.6

### 4. **Environment Configuration** ✅

#### New `.env.example` with:
```
NEXT_PUBLIC_ONCHAINKIT_API_KEY=your_key_here
NEXT_PUBLIC_0X_KEY=your_0x_api_key
NEXT_PUBLIC_SITE_URL=https://your-domain.com
NEXT_PUBLIC_PROJECT_NAME=Blackfong - BKFG Protocol
FARCASTER_FRAME_SECRET=your_frame_secret
NEXT_PUBLIC_NETWORK=mainnet
COINBASE_API_KEY=KEXU1c3apE1Lydc7Ce0LXoRFbgIz9wQ9
```

**Note**: The Coinbase Developer API key you provided is already configured in `.env.example`.

## Features & Improvements

### Frames v2 Compliance
✅ Proper frame metadata tags  
✅ Button action routing (post, link, post_redirect, mint)  
✅ Frame state persistence across interactions  
✅ Input field support for multi-step flows  
✅ Aspect ratio control (1.91:1, 1:1)  
✅ Open Graph integration for social previews  

### Security
✅ Frame message validation with timestamp verification  
✅ HTML entity escaping to prevent injection  
✅ Request body validation  
✅ Error logging with full context  

### Blockchain Integration
✅ Base network public/wallet clients  
✅ Address validation  
✅ Gas estimation  
✅ Balance checking  
✅ Transaction validation before execution  
✅ Support for testnet (Sepolia) and mainnet  

### Developer Experience
✅ Type-safe Frame interfaces  
✅ Reusable utility functions  
✅ Comprehensive error handling  
✅ Logging for debugging  
✅ Well-documented code  

## Usage Examples

### Frame Button Interaction
```typescript
// In your frame component
import { handleFrameButtonClick, encodeFrameState } from "@/lib/frames";

const { action, nextState } = handleFrameButtonClick(buttonIndex, currentState);
const encodedState = encodeFrameState(nextState);
```

### Base Blockchain Operations
```typescript
import { 
  createBasePublicClient, 
  checkBalance, 
  formatBaseAmount,
  isValidBaseAddress 
} from "@/lib/baseSDK";

const client = createBasePublicClient(apiKey);
const balance = await client.getBalance({ address: userAddress });
const formatted = formatBaseAmount(balance);
```

### Frame Validation
```typescript
import { validateFrameRequest } from "@/lib/frames";

const validation = await validateFrameRequest(requestBody);
if (validation.valid) {
  const frameData = validation.data;
}
```

## API Endpoints

### Frame Endpoint: `/api/frame`

**GET** - Returns initial frame HTML with Frames v2 metadata

**POST** - Handles frame interactions
- Request body: Frame message with button interaction
- Response: HTML frame with updated state
- Features:
  - Frame message validation
  - Button routing
  - State management
  - Error handling with proper responses

## Deployment Checklist

- [ ] Set `NEXT_PUBLIC_ONCHAINKIT_API_KEY` to your Coinbase API key
- [ ] Set `NEXT_PUBLIC_0X_KEY` for swap routing
- [ ] Set `NEXT_PUBLIC_SITE_URL` to your domain
- [ ] Set `FARCASTER_FRAME_SECRET` if using cryptographic validation
- [ ] Set `COINBASE_API_KEY` for additional API access
- [ ] Run `npm install` to install new dependencies
- [ ] Test frames in Farcaster client (Warpcast)
- [ ] Verify Base network transactions work correctly
- [ ] Test on both Base Mainnet and Sepolia Testnet

## Additional Information Needed

To fully leverage these integrations, you may want to provide:

1. **Farcaster Hub URL** - For direct frame validation without external APIs
   ```
   FARCASTER_HUB_URL=https://hub.farcaster.cast
   ```

2. **Analytics Configuration** - For frame interaction tracking
   ```
   NEXT_PUBLIC_ANALYTICS_ID=your_id
   ```

3. **Custom RPC Endpoints** - For direct network access (optional, falls back to public)
   ```
   NEXT_PUBLIC_BASE_RPC_URL=your_custom_rpc
   ```

4. **Frame Image URLs** - Pre-generated dynamic images for frame states
   - Success state image
   - Error state image
   - Loading state image

## Troubleshooting

### Frame Not Appearing in Warpcast
- Verify frame URL is publicly accessible
- Check meta tags are properly formatted in HTML response
- Ensure `fc:frame:post_url` points to correct endpoint
- Test with [Warpcast Frame Validator](https://warpcast.com/~/developers/frames)

### Transaction Failures on Base
- Confirm correct network ID (8453 for mainnet, 84532 for Sepolia)
- Verify wallet has sufficient gas
- Check contract address validity
- Ensure proper ABI for contract interactions

### State Not Persisting
- Verify state JSON is properly encoded in meta tags
- Check client-side parsing of state parameter
- Ensure frame POST endpoint returns state in response

## Next Steps

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Test frames locally**:
   ```bash
   npm run dev
   ```

3. **Deploy to Vercel/production**:
   ```bash
   npm run build
   npm start
   ```

4. **Test in Warpcast**:
   - Share your frame URL
   - Test button interactions
   - Verify blockchain operations

## Support & Resources

- [Farcaster Frames Documentation](https://docs.farcaster.xyz/reference/frames/spec)
- [Base Network Docs](https://docs.base.org)
- [OnchainKit Documentation](https://onchainkit.xyz)
- [Wagmi Documentation](https://wagmi.sh)
- [Viem Documentation](https://viem.sh)

---

**Version**: 2.0.0  
**Updated**: January 2025  
**Compatibility**: Next.js 15+, React 19+, Wagmi 2+
