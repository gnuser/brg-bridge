import 'dotenv/config';
import { HardhatUserConfig } from 'hardhat/config';
import '@nomicfoundation/hardhat-ethers';
import 'hardhat-deploy';
import { EndpointId } from '@layerzerolabs/lz-definitions';

const PRIVATE_KEY = process.env.PRIVATE_KEY || '0x' + '00'.repeat(32);

const config: HardhatUserConfig = {
    paths: {
        sources: './src',
    },
    solidity: {
        version: '0.8.22',
        settings: {
            optimizer: { enabled: true, runs: 200 },
        },
    },
    namedAccounts: {
        deployer: { default: 0 },
    },
    networks: {
        // ── Testnets ──
        sepolia: {
            eid: EndpointId.SEPOLIA_V2_TESTNET,
            url: process.env.RPC_SEPOLIA || 'https://ethereum-sepolia-rpc.publicnode.com',
            accounts: [PRIVATE_KEY],
        },
        'arbitrum-sepolia': {
            eid: EndpointId.ARBSEP_V2_TESTNET,
            url: process.env.RPC_ARBITRUM_SEPOLIA || 'https://sepolia-rollup.arbitrum.io/rpc',
            accounts: [PRIVATE_KEY],
        },
        'base-sepolia': {
            eid: EndpointId.BASESEP_V2_TESTNET,
            url: process.env.RPC_BASE_SEPOLIA || 'https://sepolia.base.org',
            accounts: [PRIVATE_KEY],
        },
        'optimism-sepolia': {
            eid: EndpointId.OPTSEP_V2_TESTNET,
            url: process.env.RPC_OPTIMISM_SEPOLIA || 'https://sepolia.optimism.io',
            accounts: [PRIVATE_KEY],
        },
        // ── Mainnets ──
        ethereum: {
            eid: EndpointId.ETHEREUM_V2_MAINNET,
            url: process.env.RPC_ETHEREUM || '',
            accounts: [PRIVATE_KEY],
        },
        arbitrum: {
            eid: EndpointId.ARBITRUM_V2_MAINNET,
            url: process.env.RPC_ARBITRUM || '',
            accounts: [PRIVATE_KEY],
        },
        base: {
            eid: EndpointId.BASE_V2_MAINNET,
            url: process.env.RPC_BASE || '',
            accounts: [PRIVATE_KEY],
        },
        optimism: {
            eid: EndpointId.OPTIMISM_V2_MAINNET,
            url: process.env.RPC_OPTIMISM || '',
            accounts: [PRIVATE_KEY],
        },
    },
};

export default config;
