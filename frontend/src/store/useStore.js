import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useStore = create(
  persist(
    (set) => ({
      data: [],
      summary: null,
      fileName: "",
      journal: [],
      ledger: {},

      setData: (data) => set({ data }),
      setSummary: (summary) => set({ summary }),
      setFileName: (fileName) => set({ fileName }),
      setJournal: (journal) => set({ journal }),
      setLedger: (ledger) => set({ ledger }),
    }),
    {
      name: "finance-storage",
    }
  )
);