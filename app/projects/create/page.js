"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import {
  Container,
  Typography,
  TextField,
  Select,
  MenuItem,
  Button,
  Grid,
  Card,
  CardContent,
  InputLabel,
  FormControl,
  Alert,
  CircularProgress,
  Snackbar,
  LinearProgress,
  Box
} from "@mui/material";
import { motion } from "framer-motion";

export default function CreateProject() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [numMembers, setNumMembers] = useState(1);
  const [teamMembers, setTeamMembers] = useState([]);
  const [borrowedComponents, setBorrowedComponents] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ open: false, message: "", severity: "success" });
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    setTeamMembers(Array(numMembers).fill(""));
  }, [numMembers]);

  const handleTeamMemberChange = (index, value) => {
    const updatedMembers = [...teamMembers];
    updatedMembers[index] = value;
    setTeamMembers(updatedMembers);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title || !borrowedComponents || teamMembers.some((member) => !member)) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const projectData = {
        title,
        teamMembers: teamMembers,
        components: borrowedComponents,
      };

      const response = await axios.post("/api/projects/create", projectData);

      if (response.status === 201) {
        setToast({ open: true, message: "Project created successfully!", severity: "success" });

        // Start progress countdown
        let timeLeft = 3000; // 3 seconds
        const interval = setInterval(() => {
          setProgress((prev) => Math.max(prev - (100 / (timeLeft / 100)), 0));
        }, 100);

        // Redirect after 3 seconds
        setTimeout(() => {
          clearInterval(interval);
          router.push(`/`);
        }, 3000);
      }
    } catch (error) {
      setToast({ open: true, message: "Error creating project!", severity: "error" });
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <Container
        maxWidth="md"
        sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}
      >
        <CircularProgress />
      </Container>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Card elevation={3} sx={{ borderRadius: 2 }}>
          <CardContent>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              Create New Project
            </Typography>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <form onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    label="Project Title"
                    variant="outlined"
                    fullWidth
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </Grid>

                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Number of Team Members</InputLabel>
                    <Select
                      value={numMembers}
                      onChange={(e) => setNumMembers(Number(e.target.value))}
                      label="Number of Team Members"
                    >
                      {[1, 2, 3, 4, 5, 6].map((num) => (
                        <MenuItem key={num} value={num}>
                          {num}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                {teamMembers.map((member, index) => (
                  <Grid item xs={12} key={index}>
                    <TextField
                      label={`Team Member ${index + 1}`}
                      variant="outlined"
                      fullWidth
                      value={member}
                      onChange={(e) => handleTeamMemberChange(index, e.target.value)}
                      required
                    />
                  </Grid>
                ))}

                <Grid item xs={12}>
                  <TextField
                    label="Borrowed Components"
                    variant="outlined"
                    fullWidth
                    multiline
                    rows={3}
                    value={borrowedComponents}
                    onChange={(e) => setBorrowedComponents(e.target.value)}
                    required
                  />
                </Grid>

                <Grid item xs={12}>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    fullWidth
                    disabled={loading}
                  >
                    {loading ? <CircularProgress size={24} color="inherit" /> : "Create Project"}
                  </Button>
                </Grid>
              </Grid>
            </form>
          </CardContent>
        </Card>
      </Container>

      {/* Toast Notification */}
      <Snackbar
        open={toast.open}
        autoHideDuration={3000}
        onClose={() => setToast({ ...toast, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Box sx={{ width: "100%" }}>
          <Alert severity={toast.severity} onClose={() => setToast({ ...toast, open: false })}>
            {toast.message}
          </Alert>
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{
              backgroundColor: toast.severity === "success" ? "#1B5E20" : "#B71C1C",
            }}
          />
        </Box>
      </Snackbar>
    </motion.div>
  );
}
