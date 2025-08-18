async function main() {
  const [deployer] = await ethers.getSigners();
  console.log('Deploying contracts with account:', deployer.address);

  const Soulbound = await ethers.getContractFactory('SoulboundCredential');
  const soul = await Soulbound.deploy('ChainCred', 'CRED');
  await soul.deployed();

  console.log('SoulboundCredential deployed to:', soul.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
