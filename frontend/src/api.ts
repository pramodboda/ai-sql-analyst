import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000",
  timeout: 30000,
});

export interface SafetyInfo {
  valid: boolean;
  checks: string[];
  reason?: string | null;
}

export interface AnalyzeResponse {
  question: string;
  sql: string;
  safety: SafetyInfo;
  columns: string[];
  rows: Record<string, unknown>[];
  row_count: number;
  execution_time_ms: number;
}

export async function analyzeQuestion(question: string) {
  const { data } = await api.post<AnalyzeResponse>("/api/analyze", { question });
  return data;
}
