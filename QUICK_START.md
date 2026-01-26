# Quick Start Guide - Blackfong v2.0 Setup

## Installation & Setup (5 minutes)

### Step 1: Install Dependencies
```bash
npm install
```

This installs:
- ✅ Farcaster Frame SDK v0.18.0
- ✅ Base SDK utilities  
- ✅ Coinbase OnchainKit
- ✅ All blockchain dependencies

### Step 2: Configure Environment Variables

Create or update `.env.local`:

```bash
# Required: Coinbase Developer API Key (provided)
NEXT_PUBLIC_ONCHAINKIT_API_KEY=KEXU1c3apE1Lydc7Ce0LXoRFbgIz9wQ9

# Required: 0x API Key for DEX swaps
NEXT_PUBLIC_0X_KEY=your_0x_api_key_here

# Optional but recommended
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_PROJECT_NAME=Blackfong - BKFG Protocol
NEXT_PUBLIC_NETWORK=mainnet
```

### Step 3: Start Development Server
```bash
npm run dev
```

Visit: `http://localhost:3000`

## Testing Your Integration

### Test 1: Frame Endpoint
```bash
curl http://localhost:3000/api/frame
```
You should see HTML with Frames v2 meta tags.

### Test 2: Frame Interaction (POST)
```bash
curl -X POST http://localhost:3000/api/frame \
  -H "Content-Type: application/json" \
  -d '{
    "untrustedData": {
      "fid": 1,
      "url": "http://localhost:3000/api/frame",
      "messageHash": "0x",
      "timestamp": 1704067200,
      "network": {
        "chain": "mainnet",
        "name": "Ethereum"
      },
      "buttonIndex": 1
    }
  }'
```

### Test 3: Warpcast Frame Testing
1. Open Warpcast
2. Create a new cast
3. Paste your frame URL: `https://your-domain.com/api/frame`
4. Click buttons to test interactions

## Verifying Blockchain Integration

### Check Base Network Connection
```javascript
// In browser console or test file:
import { createBasePublicClient } from "@/lib/baseSDK";

const client = createBasePublicClient(apiKey, "mainnet");
const blockNumber = await client.getBlockNumber();
console.log("Current block:", blockNumber);
```

### Test Address Validation
```javascript
import { isValidBaseAddress } from "@/lib/baseSDK";

console.log(isValidBaseAddress("0xCD025D20B1284c79eE4c63e003E0f1E421FbE249")); // true
console.log(isValidBaseAddress("invalid")); // false
```

## Key Files Modified/Created

| File | Purpose |
|------|---------|
| `lib/frames.ts` | Frames v2 utilities & validation |
| `lib/baseSDK.ts` | Base blockchain operations |
| `app/api/frame/route.ts` | Frame endpoint with v2 support |
| `app/rootProvider.tsx` | Farcaster SDK initialization |
| `.env.example` | Environment variable reference |
| `package.json` | Updated dependencies |

## Common Issues & Solutions

### ❌ "Module not found" errors
**Solution**: Run `npm install` again
```bash
npm install --save
```

### ❌ Frame not showing in Warpcast
**Solution**: Check that:
- Your site is publicly accessible (HTTPS recommended)
- Frame URL is correct in cast
- No console errors in browser
- Meta tags are properly formatted

### ❌ Blockchain calls failing
**Solution**: Verify:
- `NEXT_PUBLIC_ONCHAINKIT_API_KEY` is set
- Correct network (mainnet = 8453, sepolia = 84532)
- Address format is valid (0x...)
- Sufficient gas/balance

### ❌ "Coinbase API key invalid"
**Solution**: 
- Verify the key: `KEXU1c3apE1Lydc7Ce0LXoRFbgIz9wQ9`
- Check it's in `.env.local` (not `.env`)
- Restart dev server after changing env vars

## What's New in This Version

### Frames v2 Features
- ✅ Proper frame message validation
- ✅ State persistence between interactions  
- ✅ Multi-step frame flows
- ✅ Button action routing
- ✅ Improved error handling

### Base SDK Features
- ✅ Native public/wallet clients
- ✅ Address validation
- ✅ Gas estimation
- ✅ Transaction validation
- ✅ Amount formatting utilities

### Security Improvements
- ✅ Timestamp validation (5 min window)
- ✅ HTML escaping for meta tags
- ✅ Frame message structural validation
- ✅ Enhanced error logging

## Next Steps

1. **Customize your frame**
   - Update images in `public/` folder
   - Modify button labels in `/api/frame`
   - Add custom state handlers

2. **Connect to your contracts**
   - Import ABIs into `lib/abi.ts`
   - Use Base SDK in `page.tsx`
   - Add transaction handlers

3. **Deploy to production**
   ```bash
   npm run build
   npm start
   # or deploy to Vercel
   vercel
   ```

4. **Share on Farcaster**
   - Cast your frame URL
   - Pin for discoverability
   - Share with community

## API Reference Quick Look

### Frame Utilities
```typescript
import { 
  generateFrameHTML,
  validateFrameRequest,
  handleFrameButtonClick,
  encodeFrameState,
  parseFrameState
} from "@/lib/frames";
```

### Base Utilities
```typescript
import {
  createBasePublicClient,
  createBaseWalletClient,
  isValidBaseAddress,
  getBaseExplorerUrl,
  checkBalance,
  validateBaseTransaction
} from "@/lib/baseSDK";
```

## Support

- 📖 **Integration Guide**: See `INTEGRATION_GUIDE.md`
- 🔗 **Frames Spec**: https://docs.farcaster.xyz/reference/frames/spec
- ⛓️ **Base Docs**: https://docs.base.org
- 💬 **Community**: Farcaster /builders channel

---

**You're all set! Your Blackfong project is now Frames v2 + Base blockchain ready! 🚀**
