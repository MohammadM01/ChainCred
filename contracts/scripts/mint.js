async function main() {
  const [owner] = await ethers.getSigners();
  const address = process.env.CONTRACT_ADDRESS;
  if (!address) throw new Error('CONTRACT_ADDRESS not set');
  const Soulbound = await ethers.getContractFactory('SoulboundCredential');
  const soul = Soulbound.attach(address);
  const tx = await soul.mint(owner.address);
  await tx.wait();
  console.log('Minted to', owner.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
