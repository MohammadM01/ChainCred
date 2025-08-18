const { expect } = require('chai');

describe('SoulboundCredential', function () {
  it('mints and is soulbound', async function () {
    const [owner, other] = await ethers.getSigners();
    const Soulbound = await ethers.getContractFactory('SoulboundCredential');
    const soul = await Soulbound.deploy('ChainCred', 'CRED');
    await soul.deployed();

    const tx = await soul.mint(owner.address);
    await tx.wait();

    expect(await soul.ownerOf(1)).to.equal(owner.address);

    await expect(soul.transferFrom(owner.address, other.address, 1)).to.be.revertedWith('Soulbound: token is non-transferable');
  });
});
