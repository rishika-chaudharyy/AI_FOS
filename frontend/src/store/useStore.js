import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useStore = create(
  persist(
    (set, get) => ({
      data: [],
      summary: null,
      fileName: "",
      journal: [],
      ledger: {},

      files: {},

      // 🔥 NEW: track page
      currentPage: "dashboard",

      setCurrentPage: (page) => {
        const pageData = get().files[page] || {};

        set({
          currentPage: page,
          fileName: pageData.fileName || "",
          data: pageData.data || [],
          summary: pageData.summary || null,
          journal: pageData.journal || [],
          ledger: pageData.ledger || {},
        });
      },

      setData: (data) => {
        const page = get().currentPage;

        set((state) => ({
          data,
          files: {
            ...state.files,
            [page]: {
              ...(state.files[page] || {}),
              data,
              fileName: state.fileName,
            },
          },
        }));
      },

      setSummary: (summary) => {
        const page = get().currentPage;

        set((state) => ({
          summary,
          files: {
            ...state.files,
            [page]: {
              ...(state.files[page] || {}),
              summary,
            },
          },
        }));
      },

      setFileName: (fileName) => {
        const page = get().currentPage;
        const pageData = get().files[page] || {};

        set({
          fileName,
          data: pageData.data || [],
          summary: pageData.summary || null,
          journal: pageData.journal || [],
          ledger: pageData.ledger || {},
        });
      },

      setJournal: (journal) => {
        const page = get().currentPage;

        set((state) => ({
          journal,
          files: {
            ...state.files,
            [page]: {
              ...(state.files[page] || {}),
              journal,
              fileName: state.fileName,
            },
          },
        }));
      },

      setLedger: (ledger) => {
        const page = get().currentPage;

        set((state) => ({
          ledger,
          files: {
            ...state.files,
            [page]: {
              ...(state.files[page] || {}),
              ledger,
            },
          },
        }));
      },
    }),
    {
      name: "finance-storage",
      partialize: (state) => ({
        data: state.data,
        summary: state.summary,
        journal: state.journal,
        ledger: state.ledger,
        fileName: state.fileName,
        files: state.files,
        currentPage: state.currentPage,
      }),
    }
  )
);