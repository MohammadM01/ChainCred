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
    // Add the Transfer event signature:
    'event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)'
  ],
  getSigner()
);

const TRANSFER_EVENT_TOPIC = ethers.id("Transfer(address,address,uint256)");

const mint = async (to, metadataURI) => {
  const contract = getContract();
  const tx = await contract.mint(to, metadataURI);
  const receipt = await tx.wait();

  // Debug: print all logs
  console.log('Transaction receipt logs:', JSON.stringify(receipt.logs, null, 2));

  // Filter logs for Transfer event from this contract
  const transferLog = receipt.logs.find(
    log =>
      log.address.toLowerCase() === contract.target.toLowerCase() &&
      log.topics[0] === TRANSFER_EVENT_TOPIC
  );

  if (!transferLog) {
    throw new Error('Transfer event not found in transaction logs');
  }

  // Decode the event using the contract interface
  const parsed = contract.interface.parseLog(transferLog);
  const tokenId = parsed.args.tokenId.toString();

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
