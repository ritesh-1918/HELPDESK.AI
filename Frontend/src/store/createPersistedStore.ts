import { StateCreator, StoreMutatorIdentifier, create } from 'zustand';
import { StateStorage, StorageValue, createJSONStorage, persist } from 'zustand/middleware';

type PersistedStoreOptions<T> = {
  name: string;
  version?: number;
  partialize?: (state: T) => Partial<T>;
};

type WriteResult = {
  ok: boolean;
  error?: Error;
};

const inMemoryFallback = new Map<string, string>();

const normalizeError = (error: unknown): Error => {
  if (error instanceof Error) {
    return error;
  }

  return new Error(typeof error === 'string' ? error : 'Unknown storage error');
};

const safeStorage: StateStorage = {
  getItem: (name) => {
    try {
      if (typeof window === 'undefined' || !window.localStorage) {
        return inMemoryFallback.get(name) ?? null;
      }

      return window.localStorage.getItem(name);
    } catch (error) {
      console.error('[store:persist] Failed to read localStorage key:', name, error);
      return inMemoryFallback.get(name) ?? null;
    }
  },
  setItem: (name, value) => {
    const result = writeStorageValue(name, value);

    if (!result.ok) {
      console.error('[store:persist] Failed to write localStorage key:', name, result.error);
    }
  },
  removeItem: (name) => {
    try {
      inMemoryFallback.delete(name);

      if (typeof window === 'undefined' || !window.localStorage) {
        return;
      }

      window.localStorage.removeItem(name);
    } catch (error) {
      console.error('[store:persist] Failed to remove localStorage key:', name, error);
    }
  },
};

export const writeStorageValue = (name: string, value: string): WriteResult => {
  try {
    inMemoryFallback.set(name, value);

    if (typeof window === 'undefined' || !window.localStorage) {
      return { ok: true };
    }

    window.localStorage.setItem(name, value);
    return { ok: true };
  } catch (error) {
    const normalized = normalizeError(error);

    if (normalized.name === 'QuotaExceededError') {
      console.error('[store:persist] Storage quota exceeded while writing key:', name);
    }

    return { ok: false, error: normalized };
  }
};

export const createPersistedStore = <T extends object>(
  initializer: StateCreator<T, [], []>,
  options: PersistedStoreOptions<T>,
) => {
  return create<T>()(
    persist(initializer, {
      name: options.name,
      version: options.version ?? 1,
      partialize: options.partialize,
      storage: createJSONStorage(() => safeStorage),
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.error('[store:persist] Failed to rehydrate store:', options.name, error);
          return;
        }

        if (!state) {
          console.warn('[store:persist] No state available during rehydration for store:', options.name);
        }
      },
    }),
  );
};

export type PersistedStateCreator<T, Mps extends [StoreMutatorIdentifier, unknown][] = [], Mcs extends [StoreMutatorIdentifier, unknown][] = []> = StateCreator<T, Mps, Mcs>;
export type PersistedStorageValue<T> = StorageValue<T>;
