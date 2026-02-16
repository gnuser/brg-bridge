import { parseAbiItem } from 'viem';

const OFT_RECEIVED_EVENT = parseAbiItem(
  'event OFTReceived(bytes32 indexed guid, uint32 srcEid, address indexed toAddress, uint256 amountReceivedLD)',
);

// OFTSent event topic0 hash
const OFT_SENT_TOPIC = '0x85496b760a4b7f8d66384b9df21b381f5d1b1e79f229a47aaf4c232edc2fe59a';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyClient = any;

/**
 * Extract the guid from a source chain bridge tx receipt
 */
export async function getGuidFromTx(
  srcClient: AnyClient,
  txHash: `0x${string}`,
  contractAddress: `0x${string}`,
): Promise<`0x${string}` | null> {
  try {
    const receipt = await srcClient.getTransactionReceipt({ hash: txHash });
    if (receipt.status !== 'success') return null;

    for (const log of receipt.logs) {
      if (
        log.address.toLowerCase() === contractAddress.toLowerCase() &&
        log.topics[0] === OFT_SENT_TOPIC
      ) {
        return log.topics[1] as `0x${string}`;
      }
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Check if a message with the given guid has been received on the destination chain
 */
export async function checkDeliveryOnDst(
  dstClient: AnyClient,
  dstContractAddress: `0x${string}`,
  guid: `0x${string}`,
): Promise<boolean> {
  try {
    const logs = await dstClient.getLogs({
      address: dstContractAddress,
      event: OFT_RECEIVED_EVENT,
      args: { guid },
      fromBlock: 'earliest',
      toBlock: 'latest',
    });
    return logs.length > 0;
  } catch {
    return false;
  }
}
