import { EndpointId } from '@layerzerolabs/lz-definitions';
import type { OAppOmniGraphHardhat } from '@layerzerolabs/toolbox-hardhat';

// Testnet config — sets peers for all 12 directional pathways
// Uses default DVN settings (LayerZero Labs testnet DVN)

const ETH = EndpointId.SEPOLIA_V2_TESTNET;
const ARB = EndpointId.ARBSEP_V2_TESTNET;
const BASE = EndpointId.BASESEP_V2_TESTNET;
const OPT = EndpointId.OPTSEP_V2_TESTNET;

const ADAPTER = 'BridgeOFTAdapter';
const OFT = 'BridgeOFT';

function makeConnection(
    fromEid: EndpointId,
    fromName: string,
    toEid: EndpointId,
    toName: string,
) {
    return {
        from: { eid: fromEid, contractName: fromName },
        to: { eid: toEid, contractName: toName },
    };
}

const config: OAppOmniGraphHardhat = {
    contracts: [
        { contract: { eid: ETH, contractName: ADAPTER } },
        { contract: { eid: ARB, contractName: OFT } },
        { contract: { eid: BASE, contractName: OFT } },
        { contract: { eid: OPT, contractName: OFT } },
    ],
    connections: [
        // Ethereum ↔ Arbitrum
        makeConnection(ETH, ADAPTER, ARB, OFT),
        makeConnection(ARB, OFT, ETH, ADAPTER),
        // Ethereum ↔ Base
        makeConnection(ETH, ADAPTER, BASE, OFT),
        makeConnection(BASE, OFT, ETH, ADAPTER),
        // Ethereum ↔ Optimism
        makeConnection(ETH, ADAPTER, OPT, OFT),
        makeConnection(OPT, OFT, ETH, ADAPTER),
        // Arbitrum ↔ Base
        makeConnection(ARB, OFT, BASE, OFT),
        makeConnection(BASE, OFT, ARB, OFT),
        // Arbitrum ↔ Optimism
        makeConnection(ARB, OFT, OPT, OFT),
        makeConnection(OPT, OFT, ARB, OFT),
        // Base ↔ Optimism
        makeConnection(BASE, OFT, OPT, OFT),
        makeConnection(OPT, OFT, BASE, OFT),
    ],
};

export default config;
