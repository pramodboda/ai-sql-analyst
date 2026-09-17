
import { BorderBeam } from 'border-beam';
// =============================================
// Import - MUI components
// =============================================
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Fab from '@mui/material/Fab';

import ArrowUpwardSharpIcon from '@mui/icons-material/ArrowUpwardSharp';

import { useMutation } from "@tanstack/react-query";
import { analyzeQuestion, type AnalyzeResponse } from "../../api";
import { useAnalystStore } from "../../store/store";
import { examples } from "../../data/examples";




export default function PromptUI() {
  const question = useAnalystStore((state) => state.question);
  const setQuestion = useAnalystStore((state) => state.setQuestion);



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

  return (
    <Paper sx={{ p: 3 }}>
      <Stack spacing={2}>
        <Typography variant="h6">
          Ask your database
        </Typography>
        <BorderBeam>

          <Box sx={{ position: "relative" }}>
            <TextField
              multiline
              minRows={3}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Example: Show the top 10 customers by revenue this year."
              fullWidth

            />


            <Fab size="small" color="primary" aria-label="Analyze" variant="contained" onClick={run}
              disabled={mutation.isPending || !question.trim()} sx={{ position: "absolute", bottom: "5px", right: "5px" }}>
              <ArrowUpwardSharpIcon />

            </Fab>

            {/* <Button variant="contained" startIcon={<ArrowUpwardSharpIcon />} sx={{ position: "absolute", bottom: "5px", right: "5px" }}>
            </Button> */}

          </Box>

        </BorderBeam>


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
        {/* 
        <Button
          variant="contained"
          size="large"
          onClick={run}
          disabled={mutation.isPending || !question.trim()}

        >
          {mutation.isPending ? "Analyzing..." : "Analyze"}
        </Button> */}


        {mutation.isError && (
          <Alert severity="error">
            {(mutation.error as any)?.response?.data?.detail ||
              "Request failed. Check the backend and AI configuration."}
          </Alert>
        )}
      </Stack>
    </Paper >

  );
}