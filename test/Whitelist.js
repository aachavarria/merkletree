const { expect } = require("chai");
const { ethers: hardhatEthers } = require("hardhat");
const ethers = require("ethers");
const keccak256 = require("keccak256");
const { MerkleTree } = require("merkletreejs");
const {arrayify} = require("@ethersproject/bytes");


describe("Whitelist", function () {
    let Whitelist;

    before(async function () {

        const merkleRoot = arrayify('0x' + 'd2f5cd9a23e5a64871cfd2476478480e113111b0256f8609edee81518e72d26a');
        Whitelist = await hardhatEthers.getContractFactory("Whitelist");
        whitelist = await Whitelist.deploy(merkleRoot);
        await whitelist.waitForDeployment();
    });

    it("should return valid for buy", async function () {
        const whitelistAddresses = [
            '0x1234567890abcdef1234567890abcdef12345678',
            '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
            '0xabcdefabcdefabcdefabcdefabcdefabcdefabce',
            '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
        ];
        // const leaves = whitelistAddresses.map(addr => keccak256(addr));
        const leaves = whitelistAddresses.map(addr => keccak256(addr));

        merkleTree = new MerkleTree(leaves, keccak256, { sortPairs: true });

        const [buyer] = await hardhatEthers.getSigners();

        const leaf = keccak256(buyer.address);
        const proof = merkleTree.getHexProof(leaf);

        const amount = 100;
        await expect(whitelist.connect(buyer).buy(amount, proof))
            .to.emit(whitelist, 'Purchase')
            .withArgs(buyer.address, amount);

    });

    it("should return invalid for buy", async function () {
        const whitelistAddresses = [
            '0x1234567890abcdef1234567890abcdef12345678',
            '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
            '0xabcdefabcdefabcdefabcdefabcdefabcdefabce',
            '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
            '0x70997970C51812dc3A010C7d01b50e0d17dc79C8'
        ];
        // const leaves = whitelistAddresses.map(addr => keccak256(addr));
        const leaves = whitelistAddresses.map(addr => keccak256(addr));

        merkleTree = new MerkleTree(leaves, keccak256, { sortPairs: true });

        const [buyer, otherBuyer] = await hardhatEthers.getSigners();

        const leaf = keccak256(otherBuyer.address);
        const proof = merkleTree.getHexProof(leaf);


        const amount = 100;
        await expect(whitelist.connect(otherBuyer).buy(amount, proof)).to.be.revertedWith("Proof is not valid");

    });

    it("should return proof must be provided for buy", async function () {
        const whitelistAddresses = [
            '0x1234567890abcdef1234567890abcdef12345678',
            '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
            '0xabcdefabcdefabcdefabcdefabcdefabcdefabce',
            '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
        ];
        // const leaves = whitelistAddresses.map(addr => keccak256(addr));
        const leaves = whitelistAddresses.map(addr => keccak256(addr));

        merkleTree = new MerkleTree(leaves, keccak256, { sortPairs: true });

        const [buyer, otherBuyer] = await hardhatEthers.getSigners();

        const leaf = keccak256(otherBuyer.address);
        const proof = merkleTree.getHexProof(leaf);


        const amount = 100;
        await expect(whitelist.connect(otherBuyer).buy(amount, proof)).to.be.revertedWith("Proof must be provided");

    });
});
