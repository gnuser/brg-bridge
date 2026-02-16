import { EndpointId } from '@layerzerolabs/lz-definitions';
import type { OAppOmniGraphHardhat } from '@layerzerolabs/toolbox-hardhat';

// DVN addresses (verify per-chain at https://docs.layerzero.network/v2/deployments/dvn-addresses)
const LZ_DVN = '0x589dEDbD617F7E266a090e916B2a37dDc4e3b0C4';
const GOOGLE_DVN = '0xD56e4eAb23cb81f43168F9F45211Eb027b9aC7cc';

// MUST be sorted ascending by address: 0x589... < 0xD56...
const REQUIRED_DVNS = [LZ_DVN, GOOGLE_DVN];

function makeUlnConfig(confirmations: number) {
    return {
        confirmations: BigInt(confirmations),
        requiredDVNCount: 2,
        optionalDVNCount: 0,
        optionalDVNThreshold: 0,
        requiredDVNs: REQUIRED_DVNS,
        optionalDVNs: [],
    };
}

function makeConnection(
    fromEid: EndpointId,
    fromName: string,
    toEid: EndpointId,
    toName: string,
    sendConfirmations: number,
    receiveConfirmations: number,
) {
    return {
        from: { eid: fromEid, contractName: fromName },
        to: { eid: toEid, contractName: toName },
        config: {
            sendConfig: { ulnConfig: makeUlnConfig(sendConfirmations) },
            receiveConfig: { ulnConfig: makeUlnConfig(receiveConfirmations) },
        },
    };
}

const ETH = EndpointId.ETHEREUM_V2_MAINNET;
const ARB = EndpointId.ARBITRUM_V2_MAINNET;
const BASE = EndpointId.BASE_V2_MAINNET;
const OPT = EndpointId.OPTIMISM_V2_MAINNET;

const ADAPTER = 'BridgeOFTAdapter';
const OFT = 'BridgeOFT';

const config: OAppOmniGraphHardhat = {
    contracts: [
        { contract: { eid: ETH, contractName: ADAPTER } },
        { contract: { eid: ARB, contractName: OFT } },
        { contract: { eid: BASE, contractName: OFT } },
        { contract: { eid: OPT, contractName: OFT } },
    ],
    connections: [
        // Ethereum ↔ Arbitrum
        makeConnection(ETH, ADAPTER, ARB, OFT, 15, 5),
        makeConnection(ARB, OFT, ETH, ADAPTER, 5, 15),
        // Ethereum ↔ Base
        makeConnection(ETH, ADAPTER, BASE, OFT, 15, 5),
        makeConnection(BASE, OFT, ETH, ADAPTER, 5, 15),
        // Ethereum ↔ Optimism
        makeConnection(ETH, ADAPTER, OPT, OFT, 15, 5),
        makeConnection(OPT, OFT, ETH, ADAPTER, 5, 15),
        // Arbitrum ↔ Base
        makeConnection(ARB, OFT, BASE, OFT, 5, 5),
        makeConnection(BASE, OFT, ARB, OFT, 5, 5),
        // Arbitrum ↔ Optimism
        makeConnection(ARB, OFT, OPT, OFT, 5, 5),
        makeConnection(OPT, OFT, ARB, OFT, 5, 5),
        // Base ↔ Optimism
        makeConnection(BASE, OFT, OPT, OFT, 5, 5),
        makeConnection(OPT, OFT, BASE, OFT, 5, 5),
    ],
};

export default config;
