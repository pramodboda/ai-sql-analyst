import { create } from "zustand";
import type { AnalyzeResponse } from "./api";

interface HistoryItem extends AnalyzeResponse {
  id: string;
}

interface AnalystState {
  history: HistoryItem[];
  addHistory: (result: AnalyzeResponse) => void;
  clearHistory: () => void;
}

export const useAnalystStore = create<AnalystState>((set) => ({
  history: [],
  addHistory: (result) =>
    set((state) => ({
      history: [
        { ...result, id: crypto.randomUUID() },
        ...state.history,
      ].slice(0, 10),
    })),
  clearHistory: () => set({ history: [] }),
}));
