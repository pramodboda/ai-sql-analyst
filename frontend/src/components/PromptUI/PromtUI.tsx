import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";


export default function PromptUI(){
return(
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
)
}




