import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "@prizepour_saved_entries";

export interface SavedEntry {
  id: string;
  giveawayId: number;
  giveawayName: string;
  firstName: string;
  email: string;
  ticketNumbers: string[];
  referralCode: string;
  amountPaid: string;
  createdAt: string;
}

interface EntriesContextValue {
  savedEntries: SavedEntry[];
  saveEntry: (entry: SavedEntry) => Promise<void>;
  removeEntry: (id: string) => Promise<void>;
  isLoaded: boolean;
}

const EntriesContext = createContext<EntriesContextValue>({
  savedEntries: [],
  saveEntry: async () => {},
  removeEntry: async () => {},
  isLoaded: false,
});

export function EntriesProvider({ children }: { children: React.ReactNode }) {
  const [savedEntries, setSavedEntries] = useState<SavedEntry[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (raw) {
          setSavedEntries(JSON.parse(raw) as SavedEntry[]);
        }
      })
      .catch(() => {})
      .finally(() => setIsLoaded(true));
  }, []);

  const persistEntries = useCallback(async (entries: SavedEntry[]) => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  }, []);

  const saveEntry = useCallback(
    async (entry: SavedEntry) => {
      setSavedEntries((prev) => {
        const exists = prev.find((e) => e.id === entry.id);
        const next = exists ? prev.map((e) => (e.id === entry.id ? entry : e)) : [entry, ...prev];
        persistEntries(next);
        return next;
      });
    },
    [persistEntries]
  );

  const removeEntry = useCallback(
    async (id: string) => {
      setSavedEntries((prev) => {
        const next = prev.filter((e) => e.id !== id);
        persistEntries(next);
        return next;
      });
    },
    [persistEntries]
  );

  return (
    <EntriesContext.Provider value={{ savedEntries, saveEntry, removeEntry, isLoaded }}>
      {children}
    </EntriesContext.Provider>
  );
}

export function useEntries() {
  return useContext(EntriesContext);
}
