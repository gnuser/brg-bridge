import { ethers } from 'hardhat';
import * as hre from 'hardhat';

// Deployed contract addresses
const CONTRACTS: Record<string, { address: string; network: string }> = {
    'sepolia': { address: '0xE13fe9644FFE15Fad35f22B5c9E9E86e2133e21c', network: 'sepolia' },
    'arbitrum-sepolia': { address: '0x4dBBdC8CE1267c170E5aB37831cdC9870f386Dc9', network: 'arbitrum-sepolia' },
    'base-sepolia': { address: '0x4dBBdC8CE1267c170E5aB37831cdC9870f386Dc9', network: 'base-sepolia' },
    'optimism-sepolia': { address: '0x4dBBdC8CE1267c170E5aB37831cdC9870f386Dc9', network: 'optimism-sepolia' },
};

// Testnet EIDs
const EIDS: Record<string, number> = {
    'sepolia': 40161,
    'arbitrum-sepolia': 40231,
    'base-sepolia': 40245,
    'optimism-sepolia': 40232,
};

function addressToBytes32(addr: string): string {
    return '0x' + addr.slice(2).padStart(64, '0');
}

async function main() {
    const currentNetwork = hre.network.name;
    const currentContract = CONTRACTS[currentNetwork];
    if (!currentContract) {
        console.log(`No contract configured for network: ${currentNetwork}`);
        return;
    }

    console.log(`\nWiring peers on ${currentNetwork} (${currentContract.address})`);

    const signer = (await ethers.getSigners())[0];
    const abi = ['function setPeer(uint32 _eid, bytes32 _peer) external'];
    const contract = new ethers.Contract(currentContract.address, abi, signer);

    // Set peer for each other network
    for (const [networkName, info] of Object.entries(CONTRACTS)) {
        if (networkName === currentNetwork) continue;

        const peerEid = EIDS[networkName];
        const peerBytes32 = addressToBytes32(info.address);

        console.log(`  setPeer(${peerEid}, ${info.address}) [${networkName}]`);
        try {
            const tx = await contract.setPeer(peerEid, peerBytes32);
            await tx.wait();
            console.log(`    ✓ tx: ${tx.hash}`);
        } catch (e: any) {
            if (e.message?.includes('already set') || e.message?.includes('execution reverted')) {
                console.log(`    ⚠ Already set or reverted, skipping`);
            } else {
                console.log(`    ✗ Error: ${e.message}`);
            }
        }
    }

    console.log(`Done wiring ${currentNetwork}\n`);
}

main().catch(console.error);
