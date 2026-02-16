import type { BridgeTx } from '../types/bridge';

const STORAGE_KEY = 'brg-bridge-tx-history';

export function getTxHistory(): BridgeTx[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function addTxToHistory(tx: BridgeTx): void {
  const history = getTxHistory();
  history.unshift(tx);
  // Keep only last 50 transactions
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history.slice(0, 50)));
}

export function updateTxStatus(txHash: string, status: BridgeTx['status']): void {
  const history = getTxHistory();
  const idx = history.findIndex((tx) => tx.txHash === txHash);
  if (idx !== -1) {
    history[idx].status = status;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  }
}

export function clearTxHistory(): void {
  localStorage.removeItem(STORAGE_KEY);
}
