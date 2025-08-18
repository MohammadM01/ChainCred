// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract SoulboundCredential is ERC721, Ownable {
    mapping(uint256 => string) private _tokenURIs;
    uint256 private _tokenIdCounter;

    constructor() ERC721("ChainCred", "CRED") Ownable(msg.sender) {}

    function mint(address to, string memory metadataURI) public onlyOwner returns (uint256) {
        _tokenIdCounter++;
        uint256 tokenId = _tokenIdCounter;
        _mint(to, tokenId);
        _tokenURIs[tokenId] = metadataURI;
        return tokenId;
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_exists(tokenId), "Token does not exist");
        return _tokenURIs[tokenId];
    }

    function verify(address owner, uint256 tokenId) public view returns (bool) {
        return ownerOf(tokenId) == owner;
    }

    function _beforeTokenTransfer(address from, address to, uint256 tokenId, uint256 batchSize) internal override {
        require(from == address(0), "Soulbound: Tokens are non-transferable");
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
    }
}