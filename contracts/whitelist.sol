// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
import "hardhat/console.sol";

import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

contract Whitelist {
    bytes32 public merkleRoot;

    event Purchase(address indexed buyer, uint amount);

    constructor(bytes32 _merkleRoot) {
        merkleRoot = _merkleRoot;
    }

    function buy(uint _amount, bytes32[] calldata _proof) public {
        require(_amount > 0, "Purchase amount must be greater than 0");
        require(_proof.length > 0, "Proof must be provided");
        require(isWhitelisted(msg.sender, _proof), "Proof is not valid");

        emit Purchase(msg.sender, _amount);

    }

    function isWhitelisted(address _address, bytes32[] calldata _proof) private view returns (bool) {
        bytes32 leaf = keccak256(abi.encodePacked(_address));
        return MerkleProof.verify(_proof, merkleRoot, leaf);
    }
}