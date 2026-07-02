import { useState, useEffect, useCallback, useRef } from 'react';

const QUEUE_KEY = 'offline_ticket_queue';

function getQueue() {
  try {
    return JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveQueue(queue) {
  try {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  } catch (e) {
    console.warn('[OfflineQueue] Failed to persist queue:', e);
  }
}

export function useOfflineQueue(onSync) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [queue, setQueue] = useState(getQueue);
  const [syncing, setSyncing] = useState(false);
  const [lastSyncResult, setLastSyncResult] = useState(null); // { succeeded, failed }
  const onSyncRef = useRef(onSync);
  onSyncRef.current = onSync;

  // Keep state in sync with localStorage
  const refreshQueue = useCallback(() => {
    setQueue(getQueue());
  }, []);

  // Enqueue a ticket payload when offline
  const enqueue = useCallback((ticketData) => {
    const entry = {
      id: `offline_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      payload: ticketData,
      queuedAt: new Date().toISOString(),
      attempts: 0,
    };
    const updated = [...getQueue(), entry];
    saveQueue(updated);
    setQueue(updated);
    return entry.id;
  }, []);

  // Remove a single entry from queue
  const dequeue = useCallback((id) => {
    const updated = getQueue().filter((e) => e.id !== id);
    saveQueue(updated);
    setQueue(updated);
  }, []);

  // Attempt to flush the queue
  const flushQueue = useCallback(async () => {
    const current = getQueue();
    if (current.length === 0 || !navigator.onLine) return;

    setSyncing(true);
    let succeeded = 0;
    let failed = 0;

    for (const entry of current) {
      try {
        await onSyncRef.current(entry.payload);
        dequeue(entry.id);
        succeeded++;
      } catch (err) {
        console.warn('[OfflineQueue] Sync failed for entry', entry.id, err);
        // Increment attempt count but keep in queue
        const q = getQueue().map((e) =>
          e.id === entry.id ? { ...e, attempts: e.attempts + 1 } : e
        );
        saveQueue(q);
        setQueue(q);
        failed++;
      }
    }

    setSyncing(false);
    setLastSyncResult({ succeeded, failed });
  }, [dequeue]);

  // Online/offline event listeners
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      flushQueue();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [flushQueue]);

  // On mount: if already online and queue has items, try to flush
  useEffect(() => {
    if (navigator.onLine && getQueue().length > 0) {
      flushQueue();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    isOnline,
    queue,
    syncing,
    lastSyncResult,
    enqueue,
    dequeue,
    flushQueue,
    refreshQueue,
  };
}