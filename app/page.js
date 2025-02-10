"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";
import { useRouter } from "next/navigation";
import { 
  Container, Typography, Button, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Paper, Snackbar, Alert, 
  CircularProgress, LinearProgress 
} from "@mui/material";
import { motion } from "framer-motion";

export default function Home() {
  const { data: session, status } = useSession();
  const [projects, setProjects] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true); // Page-wide loading state
  const [loadingProjectId, setLoadingProjectId] = useState(null); // Track loading per project
  const [toast, setToast] = useState({ open: false, message: "", severity: "success" });
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      axios
        .get("/api/projects", { headers: { Authorization: `Bearer ${session.user.id}` } })
        .then((response) => setProjects(response.data))
        .catch((error) => {
          console.error("Error fetching projects:", error);
          setError("There was an issue fetching your projects.");
        })
        .finally(() => setLoading(false));
    } else if (status === "unauthenticated") {
      setLoading(false);
    }
  }, [status, session?.user.id]);

  const handleDownloadSummary = async (projectId) => {
    setLoadingProjectId(projectId);

    try {
      const response = await axios.get(`/api/projects/${projectId}/download`);
      if (response.status === 200) {
        setToast({ open: true, message: "The project summary has been emailed to you.", severity: "success" });
      } else {
        throw new Error("Download failed");
      }
    } catch (error) {
      console.error("Error downloading summary:", error);
      setToast({ open: true, message: "There was an issue downloading the summary.", severity: "error" });
    } finally {
      setLoadingProjectId(null);
    }
  };

  const handleSubmitProject = (projectId) => {
    router.push(`/projects/${projectId}/submit`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {loading && <LinearProgress color="primary" />}

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Welcome to TrackLab
        </Typography>

        {loading ? null : status === "authenticated" ? (
          <>
            <Typography variant="h6" color="textSecondary" sx={{ mb: 3 }}>
              Hello, {session.user.name}
            </Typography>

            <Link href="/projects/create" passHref>
              <Button variant="contained" color="success" sx={{ mb: 3 }}>
                Create New Project
              </Button>
            </Link>

            {error && (
              <Typography color="error" sx={{ mb: 3 }}>
                {error}
              </Typography>
            )}

            {projects.length > 0 ? (
              <TableContainer component={Paper} elevation={3} sx={{ borderRadius: 2 }}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: "#eeeeee" }}>
                      <TableCell><strong>S. No.</strong></TableCell>
                      <TableCell><strong>Project Name</strong></TableCell>
                      <TableCell><strong>Status</strong></TableCell>
                      <TableCell><strong>Download Summary</strong></TableCell>
                      <TableCell><strong>Submit</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {projects.map((project, index) => (
                      <TableRow key={project.id} hover>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>{project.title}</TableCell>
                        <TableCell>
                          {project.status === "PARTIAL" ? "Partial" : "Submitted"}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="contained"
                            color="primary"
                            onClick={() => handleDownloadSummary(project.id)}
                            disabled={loadingProjectId === project.id}
                          >
                            {loadingProjectId === project.id ? <CircularProgress size={24} color="inherit" /> : "Download"}
                          </Button>
                        </TableCell>
                        <TableCell>
                          {project.status === "PARTIAL" ? (
                            <Button
                              variant="contained"
                              color="warning"
                              onClick={() => handleSubmitProject(project.id)}
                            >
                              Submit
                            </Button>
                          ) : (
                            <Typography color="textSecondary">Already Submitted</Typography>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Typography variant="body1" color="textSecondary" sx={{ mt: 4 }}>
                No projects found.
              </Typography>
            )}
          </>
        ) : (
          <Container
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "60vh",
              flexDirection: "column",
            }}
          >
            <Typography variant="h5" color="textSecondary" sx={{ mb: 3, textAlign: "center" }}>
              Welcome to TrackLab! <br />
              TrackLab helps you manage and submit your projects with ease. <br />
              Sign in to start tracking your progress.
            </Typography>

            <Button
              variant="contained"
              color="primary"
              size="large"
              sx={{ px: 4, py: 2, fontSize: "16px" }}
              onClick={() => router.push("/api/auth/signin")}
            >
              Login
            </Button>
          </Container>
        )}

        {/* Toast Notification */}
        <Snackbar
          open={toast.open}
          autoHideDuration={3000}
          onClose={() => setToast({ ...toast, open: false })}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        >
          <Alert severity={toast.severity} onClose={() => setToast({ ...toast, open: false })}>
            {toast.message}
          </Alert>
        </Snackbar>
      </Container>
    </motion.div>
  );
}