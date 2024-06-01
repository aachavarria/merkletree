const { expect } = require("chai");
const { ethers: hardhatEthers } = require("hardhat");
const ethers = require("ethers");
const keccak256 = require("keccak256");
const { MerkleTree } = require("merkletreejs");
const {arrayify} = require("@ethersproject/bytes");


describe("Whitelist", function () {
    let Whitelist;

    before(async function () {
        // const whitelistAddresses = [
        //     {address: '0x1234567890abcdef1234567890abcdef12345678', maxAmount: 100 },
        //     {address: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd', maxAmount: 100 },
        //     {address: '0xabcdefabcdefabcdefabcdefabcdefabcdefabce', maxAmount: 100 },
        //     {address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266', maxAmount: 400 },
        // ];
        //
        //
        // const leaves = whitelistAddresses.map(addr => keccak256(ethers.solidityPacked(["address", "uint256"], [addr.address, addr.maxAmount])));
        // const tree = new MerkleTree(leaves, keccak256, { sortPairs: true });
        // const root = tree.getRoot().toString('hex');
        // const merkleRoot = arrayify('0x' + root);

        const merkleRoot = arrayify('0x' + 'bd584b72d135c044bcb9d80e9c6cb382eeeb877ae344ee593e63cb595228fd3b');
        Whitelist = await hardhatEthers.getContractFactory("Whitelist");
        whitelist = await Whitelist.deploy(merkleRoot);
        await whitelist.waitForDeployment();
    });

    it("should return valid for buy", async function () {
        const whitelistAddresses = [
            {address: '0x1234567890abcdef1234567890abcdef12345678', maxAmount: 100 },
            {address: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd', maxAmount: 100 },
            {address: '0xabcdefabcdefabcdefabcdefabcdefabcdefabce', maxAmount: 100 },
            {address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266', maxAmount: 400 },
        ];
        // const leaves = whitelistAddresses.map(addr => keccak256(addr));
        const leaves = whitelistAddresses.map(addr => keccak256(ethers.solidityPacked(["address", "uint256"], [addr.address, addr.maxAmount])));

        merkleTree = new MerkleTree(leaves, keccak256, { sortPairs: true });

        const [buyer] = await hardhatEthers.getSigners();

        const leaf = keccak256(ethers.solidityPacked(["address", "uint256"], [buyer.address, 400]));
        const proof = merkleTree.getHexProof(leaf);

        const amount = 100;
        await expect(whitelist.connect(buyer).buy(amount, 400, proof))
            .to.emit(whitelist, 'Purchase')
            .withArgs(buyer.address, amount);

    });

    it("should not exceds max amount ", async function () {
        const whitelistAddresses = [
            {address: '0x1234567890abcdef1234567890abcdef12345678', maxAmount: 100 },
            {address: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd', maxAmount: 100 },
            {address: '0xabcdefabcdefabcdefabcdefabcdefabcdefabce', maxAmount: 100 },
            {address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266', maxAmount: 400 },
        ];
        // const leaves = whitelistAddresses.map(addr => keccak256(addr));
        const leaves = whitelistAddresses.map(addr => keccak256(ethers.solidityPacked(["address", "uint256"], [addr.address, addr.maxAmount])));

        merkleTree = new MerkleTree(leaves, keccak256, { sortPairs: true });

        const [buyer] = await hardhatEthers.getSigners();

        const leaf = keccak256(ethers.solidityPacked(["address", "uint256"], [buyer.address, 400]));
        const proof = merkleTree.getHexProof(leaf);

        const amount = 500;
        await expect(whitelist.connect(buyer).buy(amount, 400, proof)).to.be.revertedWith("Purchase amount exceeds max amount");

    });

    it("should return invalid proof", async function () {
        const whitelistAddresses = [
            {address: '0x1234567890abcdef1234567890abcdef12345678', maxAmount: 100 },
            {address: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd', maxAmount: 100 },
            {address: '0xabcdefabcdefabcdefabcdefabcdefabcdefabce', maxAmount: 100 },
            {address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266', maxAmount: 400 },
        ];
        // const leaves = whitelistAddresses.map(addr => keccak256(addr));
        const leaves = whitelistAddresses.map(addr => keccak256(ethers.solidityPacked(["address", "uint256"], [addr.address, addr.maxAmount])));

        merkleTree = new MerkleTree(leaves, keccak256, { sortPairs: true });

        const [buyer] = await hardhatEthers.getSigners();

        const leaf = keccak256(ethers.solidityPacked(["address", "uint256"], [buyer.address, 400]));
        const proof = merkleTree.getHexProof(leaf);

        const amount = 100;
        await expect(whitelist.connect(buyer).buy(amount, 500, proof)).to.be.revertedWith("Proof is not valid");

    });
});
