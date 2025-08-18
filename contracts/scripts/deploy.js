const hre = require("hardhat");

async function main() {
  const SoulboundCredential = await hre.ethers.getContractFactory("SoulboundCredential");
  const soulboundCredential = await SoulboundCredential.deploy();
  await soulboundCredential.deployed();
  console.log("SoulboundCredential deployed to:", soulboundCredential.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});