const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  const SoulboundCredential = await ethers.getContractFactory("SoulboundCredential");
  const contract = await SoulboundCredential.deploy(deployer.address);

  await contract.waitForDeployment();
  console.log("SoulboundCredential deployed to:", await contract.getAddress());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
