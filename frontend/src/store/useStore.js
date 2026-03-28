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
      insights: null,

      currentPage: "dashboard",

      setCurrentPage: (page) => set({ currentPage: page }),
      setData: (data) => set({ data }),
      setSummary: (summary) => set({ summary }),
      setInsights: (insights) => set({ insights }),
      setFileName: (fileName) => set({ fileName }),
      setJournal: (journal) => set({ journal }),
      setLedger: (ledger) => set({ ledger }),
    }),
    {
      name: "finance-storage",
      partialize: (state) => ({
        data: state.data,
        summary: state.summary,
        journal: state.journal,
        ledger: state.ledger,
        insights: state.insights,
        fileName: state.fileName,
        currentPage: state.currentPage,
      }),
    }
  )
);