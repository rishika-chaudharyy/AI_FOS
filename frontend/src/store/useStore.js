import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useStore = create(
  persist(
    (set) => ({
      data: [],              // ✅ FIXED (not undefined)
      summary: null,

      setData: (data) => set({ data }),
      setSummary: (summary) => set({ summary }),
    }),
    {
      name: "finance-storage",
    }
  )
);