import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Divider,
  Grid,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import SecurityIcon from "@mui/icons-material/Security";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { analyzeQuestion, type AnalyzeResponse } from "./api";
import { useAnalystStore } from "./store";

const examples = [
  "Show the top 10 customers by revenue this year.",
  "Compare total revenue by region this year.",
  "Show monthly revenue for this year.",
  "Which products have the highest sales?",
];

export default function App() {
  const [question, setQuestion] = useState(examples[0]);
  const [result, setResult] = useState<AnalyzeResponse | null>(null);
  const { history, addHistory, clearHistory } = useAnalystStore();

  const mutation = useMutation({
    mutationFn: analyzeQuestion,
    onSuccess: (data) => {
      setResult(data);
      addHistory(data);
    },
  });

  const run = () => {
    if (question.trim()) mutation.mutate(question.trim());
  };

  const columns: GridColDef[] = result
    ? result.columns.map((field) => ({
        field,
        headerName: field.replaceAll("_", " ").replace(/\b\w/g, (c) => c.toUpperCase()),
        flex: 1,
        minWidth: 140,
      }))
    : [];

  const rows = result
    ? result.rows.map((row, index) => ({ id: index, ...row }))
    : [];

  const chartData = result
    ? result.rows.slice(0, 10).map((row) => {
        const values = Object.values(row);
        return {
          name: String(values[0] ?? ""),
          value: Number(values[values.length - 1] ?? 0),
        };
      })
    : [];

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Stack spacing={3}>
        <Box>
          <Stack direction="row" spacing={1} alignItems="center">
            <AutoAwesomeIcon />
            <Typography variant="h4" fontWeight={800}>
              AI SQL Analyst
            </Typography>
            <Chip label="Read-only AI analytics" size="small" />
          </Stack>
          <Typography color="text.secondary" sx={{ mt: 1 }}>
            Ask business questions in natural language. The system generates, validates,
            and safely executes PostgreSQL SQL.
          </Typography>
        </Box>

        <Paper sx={{ p: 3 }}>
          <Stack spacing={2}>
            <Typography variant="h6">Ask your database</Typography>
            <TextField
              multiline
              minRows={3}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Example: Show the top 10 customers by revenue this year."
              fullWidth
            />
            <Stack direction="row" spacing={1} flexWrap="wrap">
              {examples.map((example) => (
                <Chip
                  key={example}
                  label={example}
                  onClick={() => setQuestion(example)}
                  sx={{ mb: 1 }}
                />
              ))}
            </Stack>
            <Button
              variant="contained"
              size="large"
              startIcon={mutation.isPending ? <CircularProgress size={20} /> : <PlayArrowIcon />}
              onClick={run}
              disabled={mutation.isPending || !question.trim()}
            >
              {mutation.isPending ? "Analyzing..." : "Analyze"}
            </Button>
            {mutation.isError && (
              <Alert severity="error">
                {(mutation.error as any)?.response?.data?.detail ||
                  "Request failed. Check the backend and AI configuration."}
              </Alert>
            )}
          </Stack>
        </Paper>

        {result && (
          <>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 8 }}>
                <Paper sx={{ p: 3, height: "100%" }}>
                  <Typography variant="h6" gutterBottom>
                    Generated SQL
                  </Typography>
                  <Box
                    component="pre"
                    sx={{
                      p: 2,
                      m: 0,
                      overflow: "auto",
                      borderRadius: 2,
                      bgcolor: "background.default",
                      fontFamily: "monospace",
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {result.sql}
                  </Box>
                </Paper>
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <Paper sx={{ p: 3, height: "100%" }}>
                  <Stack direction="row" spacing={1} alignItems="center" mb={2}>
                    <SecurityIcon />
                    <Typography variant="h6">Safety checks</Typography>
                  </Stack>
                  <Stack spacing={1}>
                    {result.safety.checks.map((check) => (
                      <Chip key={check} label={`✓ ${check}`} variant="outlined" />
                    ))}
                  </Stack>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="body2" color="text.secondary">
                    {result.row_count} rows • {result.execution_time_ms} ms
                  </Typography>
                </Paper>
              </Grid>
            </Grid>

            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Results
              </Typography>
              <Box sx={{ height: 420 }}>
                <DataGrid
                  rows={rows}
                  columns={columns}
                  disableRowSelectionOnClick
                  pageSizeOptions={[10, 25, 50]}
                />
              </Box>
            </Paper>

            {chartData.length > 0 && (
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Visualization
                </Typography>
                <Box sx={{ height: 360 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </Paper>
            )}
          </>
        )}

        <Paper sx={{ p: 3 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Recent queries</Typography>
            <Button size="small" onClick={clearHistory} disabled={!history.length}>
              Clear
            </Button>
          </Stack>
          <Stack spacing={1} sx={{ mt: 2 }}>
            {history.length === 0 ? (
              <Typography color="text.secondary">No queries yet.</Typography>
            ) : (
              history.map((item) => (
                <Button
                  key={item.id}
                  variant="text"
                  sx={{ justifyContent: "flex-start", textTransform: "none" }}
                  onClick={() => {
                    setQuestion(item.question);
                    setResult(item);
                  }}
                >
                  {item.question}
                </Button>
              ))
            )}
          </Stack>
        </Paper>
      </Stack>
    </Container>
  );
}
