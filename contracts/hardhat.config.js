require('dotenv').config();
require('@nomiclabs/hardhat-ethers');

module.exports = {
  solidity: "0.8.20", // update compiler to match your contracts
  networks: {
    opbnbTestnet: {
      url: process.env.OPBNB_TESTNET_RPC,
      chainId: 5611,
      accounts: [process.env.PRIVATE_KEY],
    },
  },
};
