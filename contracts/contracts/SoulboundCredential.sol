// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
contract SoulboundCredential is ERC721 {
    mapping(uint256 => string) private _tokenURIs;
    constructor() ERC721("ChainCred", "CRED") {}
    function mint(address to, uint256 tokenId, string memory uri) public {
        _mint(to, tokenId);
        _tokenURIs[tokenId] = uri;
    }
    function _beforeTokenTransfer(address, address, uint256, uint256) internal override {
        revert("Soulbound: Tokens are non-transferable");
    }
    function verify(address owner, uint256 tokenId) public view returns (bool) {
        return ownerOf(tokenId) == owner;
    }
}