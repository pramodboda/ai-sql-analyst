import { create } from "zustand";
import type { AnalyzeResponse } from "./api";

const examples = [
    "Show the top 10 customers by revenue this year.",
    "Compare total revenue by region this year.",
    "Show monthly revenue for this year.",
    "Which products have the highest sales?",
];

interface AnalystState {
    question: string;

    history: AnalyzeResponse[];

    setQuestion: (question: string) => void;
    addHistory: (result: AnalyzeResponse) => void;
    clearHistory: () => void;
}

export const useAnalystStore = create<AnalystState>((set) => ({
    // Global question
    question: examples[0],

    // Existing history
    history: [],

    setQuestion: (question) => set({ question }),

    addHistory: (result) =>
        set((state) => ({
            history: [result, ...state.history],
        })),

    clearHistory: () =>
        set({
            history: [],
        }),
}));