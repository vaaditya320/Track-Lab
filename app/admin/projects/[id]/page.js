"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import axios from "axios";
import {
  Container, Typography, Button, Card, CardContent, CircularProgress,
  Box, Paper, Divider, Alert
} from "@mui/material";
import { motion } from "framer-motion";

export default function ProjectDetails() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { id } = useParams();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "authenticated") {
      fetchProjectDetails();
    }
  }, [status]);

  const fetchProjectDetails = async () => {
    try {
      const response = await axios.get(`/api/admin/projects/${id}`, {
        headers: { Authorization: `Bearer ${session.user.id}` },
      });
      setProject(response.data);
    } catch (error) {
      setError("Failed to fetch project details.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 5 }}>
        <Alert severity="error">{error}</Alert>
        <Button variant="contained" sx={{ mt: 2 }} onClick={() => router.push("/admin")}>
          Back to Dashboard
        </Button>
      </Container>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Button variant="contained" onClick={() => router.push("/admin")} sx={{ mb: 2 }}>
          Back to Dashboard
        </Button>

        <Card elevation={3} sx={{ borderRadius: 2 }}>
          <CardContent>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              {project.title}
            </Typography>
            <Divider sx={{ my: 2 }} />

            <Box sx={{ mb: 2 }}>
              <Typography variant="h6">Leader:</Typography>
              <Typography variant="body1">{project.leader.name} ({project.leader.regId})</Typography>
              <Typography variant="body2" color="textSecondary">{project.leader.email}</Typography>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="h6">Status:</Typography>
              <Typography variant="body1" sx={{ fontWeight: "bold", color: project.status === "SUBMITTED" ? "green" : "orange" }}>
                {project.status}
              </Typography>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="h6">Team Members:</Typography>
              <Paper elevation={1} sx={{ p: 2, backgroundColor: "#f9f9f9" }}>
                <Typography variant="body1">
                  {JSON.parse(project.teamMembers).join(", ")}
                </Typography>
              </Paper>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="h6">Components:</Typography>
              <Paper elevation={1} sx={{ p: 2, backgroundColor: "#f9f9f9" }}>
                <Typography variant="body1">{project.components}</Typography>
              </Paper>
            </Box>

            {project.summary && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="h6">Summary:</Typography>
                <Paper elevation={1} sx={{ p: 2, backgroundColor: "#f9f9f9" }}>
                  <Typography variant="body1">{project.summary}</Typography>
                </Paper>
              </Box>
            )}

            {project.projectPhoto && (
              <Box sx={{ textAlign: "center", mt: 3 }}>
                <Typography variant="h6">Project Photo:</Typography>
                <img src={project.projectPhoto} alt="Project" style={{ maxWidth: "100%", borderRadius: 8, marginTop: 10 }} />
              </Box>
            )}
          </CardContent>
        </Card>
      </Container>
    </motion.div>
  );
}