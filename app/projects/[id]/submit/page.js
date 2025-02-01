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
} from "@mui/material";
import { motion } from "framer-motion";

export default function SubmitPage() {
  const { data: session, status } = useSession();
  const [project, setProject] = useState(null);
  const [summary, setSummary] = useState("");
  const [photo, setPhoto] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const params = useParams();
  const projectId = params?.id;

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
    const formData = new FormData();
    formData.append("summary", summary);
    formData.append("photo", photo);

    try {
      const response = await fetch(`/api/projects/${projectId}/complete`, {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        alert("Project submitted successfully.");
        router.push("/");
      } else {
        setError("Error submitting project.");
      }
    } catch (error) {
      console.error("Error submitting project:", error);
      setError("Error submitting project.");
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ textAlign: "center", py: 6 }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>Loading...</Typography>
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
                  <Button type="submit" variant="contained" color="primary" fullWidth>
                    Complete Submission
                  </Button>
                </Grid>
              </Grid>
            </form>
          </CardContent>
        </Card>
      </Container>
    </motion.div>
  );
}
