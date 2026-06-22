import React from 'react';
import { WifiOff, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';

/**
 * Banner that shows:
 * - Offline warning when disconnected
 * - Pending queue count
 * - Sync result feedback
 */
export default function OfflineQueueBanner({ isOnline, queue, syncing, lastSyncResult, onRetry }) {
  if (isOnline && queue.length === 0 && !lastSyncResult) return null;

  return (
    <div className="w-full px-4 py-2 text-sm font-medium flex items-center gap-2 z-50"
      style={{
        background: !isOnline
          ? '#fef3c7'
          : syncing
          ? '#eff6ff'
          : lastSyncResult?.failed > 0
          ? '#fef2f2'
          : '#f0fdf4',
        borderBottom: '1px solid',
        borderColor: !isOnline ? '#fde68a' : syncing ? '#bfdbfe' : lastSyncResult?.failed > 0 ? '#fecaca' : '#bbf7d0',
        color: !isOnline ? '#92400e' : syncing ? '#1e40af' : lastSyncResult?.failed > 0 ? '#991b1b' : '#166534',
      }}
    >
      {!isOnline && (
        <>
          <WifiOff className="w-4 h-4 shrink-0" />
          <span>
            You&apos;re offline.
            {queue.length > 0
              ? ` ${queue.length} ticket${queue.length > 1 ? 's' : ''} queued — will sync when you reconnect.`
              : ' New tickets will be queued until connection is restored.'}
          </span>
        </>
      )}

      {isOnline && syncing && (
        <>
          <RefreshCw className="w-4 h-4 shrink-0 animate-spin" />
          <span>Syncing {queue.length} queued ticket{queue.length > 1 ? 's' : ''}…</span>
        </>
      )}

      {isOnline && !syncing && lastSyncResult?.succeeded > 0 && lastSyncResult?.failed === 0 && (
        <>
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>
            {lastSyncResult.succeeded} offline ticket{lastSyncResult.succeeded > 1 ? 's' : ''} synced successfully.
          </span>
        </>
      )}

      {isOnline && !syncing && lastSyncResult?.failed > 0 && (
        <>
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>
            {lastSyncResult.failed} ticket{lastSyncResult.failed > 1 ? 's' : ''} failed to sync.
          </span>
          {onRetry && (
            <button
              onClick={onRetry}
              className="ml-auto underline text-xs font-semibold hover:opacity-80"
            >
              Retry
            </button>
          )}
        </>
      )}

      {isOnline && !syncing && queue.length > 0 && !lastSyncResult && (
        <>
          <RefreshCw className="w-4 h-4 shrink-0" />
          <span>{queue.length} ticket{queue.length > 1 ? 's' : ''} pending sync.</span>
          {onRetry && (
            <button onClick={onRetry} className="ml-auto underline text-xs font-semibold hover:opacity-80">
              Sync now
            </button>
          )}
        </>
      )}
    </div>
  );
}