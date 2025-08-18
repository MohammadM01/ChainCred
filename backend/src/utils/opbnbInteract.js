const ethers = require('ethers');

/**
 * Utility for interacting with opBNB testnet and SoulboundCredential contract.
 * Uses Ethers v6: Provider from OPBNB_TESTNET_RPC, Signer from PRIVATE_KEY, Contract from CONTRACT_ADDRESS.
 * Functions: mint(to, metadataURI), verify(owner, tokenId), getTokenURI(tokenId).
 * For ChainCred MVP: Assumes contract is deployed; handles gas estimation minimally.
 * Error handling: Throws for now; wrap in try/catch in controllers.
 */
const getProvider = () => new ethers.JsonRpcProvider(process.env.OPBNB_TESTNET_RPC);

const getSigner = () => new ethers.Wallet(process.env.PRIVATE_KEY, getProvider());

const getContract = () => new ethers.Contract(
  process.env.CONTRACT_ADDRESS,
  [
    'function mint(address to, string memory metadataURI) returns (uint256)',
    'function verify(address owner, uint256 tokenId) view returns (bool)',
    'function tokenURI(uint256 tokenId) view returns (string)',
  ],
  getSigner()
);

const mint = async (to, metadataURI) => {
  const contract = getContract();
  const tx = await contract.mint(to, metadataURI);
  const receipt = await tx.wait();
  const tokenId = receipt.logs[0].args.tokenId; // Parse from event or counter if needed
  return { txHash: receipt.hash, tokenId };
};

const verify = async (owner, tokenId) => {
  const contract = getContract();
  return await contract.verify(owner, tokenId);
};

const getTokenURI = async (tokenId) => {
  const contract = getContract();
  return await contract.tokenURI(tokenId);
};

module.exports = { mint, verify, getTokenURI };
