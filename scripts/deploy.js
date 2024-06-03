const keccak256 = require("keccak256");
const {MerkleTree} = require("merkletreejs");
const {arrayify} = require("@ethersproject/bytes");


async function main() {
    const [deployer] = await ethers.getSigners();
    const deployerAddress = await deployer.getAddress();

    console.log('Deploying contracts with the account:', deployerAddress);

    const whitelistAddresses = [
        '0x1234567890abcdef1234567890abcdef12345678',
        '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
        '0xabcdefabcdefabcdefabcdefabcdefabcdefabce',
        '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
    ];


    const leaves = whitelistAddresses.map(addr => keccak256(addr));
    const tree = new MerkleTree(leaves, keccak256, { sortPairs: true });
    const root = tree.getRoot().toString('hex');
    const merkleRoot = arrayify('0x' + root);
    console.log(root)


    const MyContractFactory = await ethers.getContractFactory("Whitelist")



    const myContract = (await MyContractFactory.connect(deployer).deploy(merkleRoot));
    await myContract.waitForDeployment();
    const myContractDeployedAddress = await myContract.getAddress();

    console.log("Whitelist deployed to:", myContractDeployedAddress);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });