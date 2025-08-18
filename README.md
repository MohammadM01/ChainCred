# ChainCred – Decentralized Verifiable Credential Platform
Built for Binance Hackathon 2025. A decentralized platform for issuing, storing, and verifying academic/professional credentials using BNB Smart Chain, opBNB, and BNB Greenfield.

## Problem
Credential fraud in education and hiring is rampant (e.g., 20% of resumes in India contain fake degrees). Verification is slow, centralized, and error-prone.

## Solution
ChainCred uses blockchain for tamper-proof credentials:
- Institutes issue certificates as soulbound NFTs on opBNB.
- Certificates stored on BNB Greenfield.
- Students own NFTs in wallets.
- Employers verify instantly with a hash or wallet address.

<<<<<<< Updated upstream
This README is a placeholder. See `docs/` for architecture and demo instructions.


=======
## Tech Stack
- **Blockchain**: BNB Smart Chain (opBNB testnet for low-cost txns)
- **Storage**: BNB Greenfield (decentralized file storage)
- **Frontend**: React + Tailwind CSS
- **Backend**: Node.js + Express
- **Smart Contracts**: Solidity (soulbound ERC-721)
- **Auth**: Web3Auth (Google/Email login)

## Setup
1. Clone: `git clone <repo-url>`
2. Contracts:
   - `cd contracts && npm install`
   - Deploy: `npx hardhat run scripts/deploy.js --network opbnbTestnet`
3. Backend:
   - `cd backend && npm install`
   - Run: `npm start`
4. Frontend:
   - `cd frontend && npm install`
   - Run: `npm run dev`
5. Set .env vars (see .env.example files).

## Demo
- Live: <deployed-url> (e.g., Vercel for frontend, Render for backend)
- Video: <link-to-video>
- Testnet: opBNB testnet (chainId: 5611), contract at <contract-address>

## Team
Built for Binance Hackathon 2025 to revolutionize credential verification!
>>>>>>> Stashed changes
