"use client"; 

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";
import { useRouter } from "next/navigation";
import { 
  Container, Typography, Button, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Paper, Snackbar, Alert, CircularProgress 
} from "@mui/material";
import { motion } from "framer-motion";

export default function Home() {
  const { data: session, status } = useSession();
  const [projects, setProjects] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(null); // Track loading per project
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
        });
    }
  }, [status, session?.user.id]);

  const handleDownloadSummary = async (projectId) => {
    setLoading(projectId); // Show loader for this project

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
      setLoading(null); // Remove loading state
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
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Welcome to TrackLab
        </Typography>

        {status === "authenticated" ? (
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
                            disabled={loading === project.id} // Disable if loading
                          >
                            {loading === project.id ? <CircularProgress size={24} color="inherit" /> : "Download"}
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
          <Typography variant="body1" color="error">
            Please sign in to view your projects.
          </Typography>
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
