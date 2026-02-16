import { type DeployFunction } from 'hardhat-deploy/types';

const deploy: DeployFunction = async (hre) => {
    const { deploy } = hre.deployments;
    const { deployer } = await hre.getNamedAccounts();

    await deploy('BridgeToken', {
        from: deployer,
        args: [deployer],
        log: true,
        waitConfirmations: 1,
    });
};

deploy.tags = ['BridgeToken'];
export default deploy;
