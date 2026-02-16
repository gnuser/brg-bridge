import { type DeployFunction } from 'hardhat-deploy/types';

// EndpointV2 addresses — testnet and mainnet differ
const TESTNET_ENDPOINT_V2 = '0x6EDCE65403992e310A62460808c4b910D972f10f';
const MAINNET_ENDPOINT_V2 = '0x1a44076050125825900e736c501f859c50fE728c';

const TESTNET_NETWORKS = ['sepolia', 'arbitrum-sepolia', 'base-sepolia', 'optimism-sepolia'];

const deploy: DeployFunction = async (hre) => {
    const { deploy } = hre.deployments;
    const { deployer } = await hre.getNamedAccounts();

    const endpoint = TESTNET_NETWORKS.includes(hre.network.name)
        ? TESTNET_ENDPOINT_V2
        : MAINNET_ENDPOINT_V2;

    await deploy('BridgeOFT', {
        from: deployer,
        args: ['BridgeToken', 'BRG', endpoint, deployer],
        log: true,
        waitConfirmations: 1,
    });
};

deploy.tags = ['BridgeOFT'];
export default deploy;
