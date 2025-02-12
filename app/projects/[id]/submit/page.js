"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  Container,
  Typography,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  Snackbar,
  LinearProgress,
  Box
} from "@mui/material";
import { motion } from "framer-motion";

export default function SubmitPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const projectId = params?.id;

  const [project, setProject] = useState(null);
  const [summary, setSummary] = useState("");
  const [photo, setPhoto] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState({ open: false, message: "", severity: "success" });
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (status === "authenticated" && projectId) {
      fetch(`/api/projects/${projectId}`)
        .then((response) => response.json())
        .then((data) => {
          setProject(data);
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching project:", error);
          setError("Error loading project details.");
          setLoading(false);
        });
    }
  }, [status, projectId]);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setPhoto(file);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    const formData = new FormData();
    formData.append("summary", summary);
    formData.append("photo", photo);

    try {
      const response = await fetch(`/api/projects/${projectId}/complete`, {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        setToast({ open: true, message: "Project submitted successfully!", severity: "success" });

        let timeLeft = 3000;
        const interval = setInterval(() => {
          setProgress((prev) => Math.max(prev - (100 / (timeLeft / 100)), 0));
        }, 100);

        setTimeout(() => {
          clearInterval(interval);
          router.push("/");
        }, 3000);
      } else {
        setToast({ open: true, message: "Error submitting project.", severity: "error" });
      }
    } catch (error) {
      console.error("Error submitting project:", error);
      setToast({ open: true, message: "Error submitting project.", severity: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || status === "loading") {
    return (
      <Container
        maxWidth="md"
        sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}
      >
        <CircularProgress />
      </Container>
    );
  }

  if (!project) {
    return (
      <Container maxWidth="md" sx={{ textAlign: "center", py: 6 }}>
        <Alert severity="error">Project not found.</Alert>
      </Container>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Card elevation={3} sx={{ borderRadius: 2 }}>
          <CardContent>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              Submit Project: {project.title}
            </Typography>

            <Typography variant="body1" sx={{ mb: 2 }}>
              <strong>Team Members:</strong> {Array.isArray(project.teamMembers) 
                ? project.teamMembers.join(", ") 
                : JSON.parse(project.teamMembers || "[]").join(", ")}
            </Typography>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <form onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    label="Project Summary"
                    variant="outlined"
                    fullWidth
                    multiline
                    rows={3}
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    required
                  />
                </Grid>

                <Grid item xs={12}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    style={{ display: "none" }}
                    id="photo-upload"
                  />
                  <label htmlFor="photo-upload">
                    <Button variant="contained" component="span" fullWidth>
                      Upload Project Photo
                    </Button>
                  </label>
                  {photo && (
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      Selected file: {photo.name}
                    </Typography>
                  )}
                </Grid>

                <Grid item xs={12}>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    fullWidth
                    disabled={submitting}
                  >
                    {submitting ? <CircularProgress size={24} color="inherit" /> : "Complete Submission"}
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
              "& .MuiLinearProgress-bar": {
                backgroundColor: toast.severity === "success" ? "#4CAF50" : "#E53935",
              },
            }}
          />
        </Box>
      </Snackbar>
    </motion.div>
  );
}
