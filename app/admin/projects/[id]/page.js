"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import axios from "axios";
import {
  Container, Typography, Button, Card, CardContent, CircularProgress,
  Box, Paper, Divider, Alert, Snackbar, Chip, Grid, IconButton, Tooltip,
  Skeleton, useTheme
} from "@mui/material";
import { motion } from "framer-motion";
import DownloadIcon from "@mui/icons-material/Download";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import GroupIcon from "@mui/icons-material/Group";
import BuildIcon from "@mui/icons-material/Build";

// Skeleton component for loading state
const ProjectDetailsSkeleton = () => {
  const theme = useTheme();
  
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3, alignItems: "center" }}>
        <Skeleton variant="rectangular" width={150} height={40} sx={{ borderRadius: 1 }} />
        <Skeleton variant="rectangular" width={180} height={40} sx={{ borderRadius: 1 }} />
      </Box>

      <Card elevation={4} sx={{ borderRadius: 3, overflow: "hidden" }}>
        <Skeleton variant="rectangular" width="100%" height={200} />
        
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <Skeleton variant="text" width="60%" height={45} />
            <Skeleton variant="rectangular" width={100} height={32} sx={{ borderRadius: 16 }} />
          </Box>
          
          <Divider sx={{ my: 3 }} />
          
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Box sx={{ mb: 3 }}>
                <Skeleton variant="text" width={150} height={30} sx={{ mb: 1 }} />
                <Skeleton variant="rectangular" width="100%" height={90} sx={{ borderRadius: 2 }} />
              </Box>
              
              <Box sx={{ mb: 3 }}>
                <Skeleton variant="text" width={170} height={30} sx={{ mb: 1 }} />
                <Skeleton variant="rectangular" width="100%" height={100} sx={{ borderRadius: 2 }} />
              </Box>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Box sx={{ mb: 3 }}>
                <Skeleton variant="text" width={150} height={30} sx={{ mb: 1 }} />
                <Skeleton variant="rectangular" width="100%" height={90} sx={{ borderRadius: 2 }} />
              </Box>
              
              <Box sx={{ mb: 3 }}>
                <Skeleton variant="text" width={130} height={30} sx={{ mb: 1 }} />
                <Skeleton variant="rectangular" width="100%" height={90} sx={{ borderRadius: 2 }} />
              </Box>
            </Grid>
          </Grid>

          <Box sx={{ mt: 3 }}>
            <Skeleton variant="text" width={160} height={30} sx={{ mb: 1 }} />
            <Skeleton variant="rectangular" width="100%" height={150} sx={{ borderRadius: 2 }} />
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default function ProjectDetails() {
  const theme = useTheme();
  const { data: session, status } = useSession();
  const router = useRouter();
  const { id } = useParams();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [downloading, setDownloading] = useState(false);
  const [toast, setToast] = useState({ open: false, message: "", severity: "info" });

  useEffect(() => {
    if (status === "authenticated") {
      fetchProjectDetails();
    } else if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, id]);

  const fetchProjectDetails = async () => {
    try {
      const response = await axios.get(`/api/admin/projects/${id}`, {
        headers: { Authorization: `Bearer ${session.user.id}` },
      });
      setProject(response.data);
    } catch (error) {
      console.error("Error fetching project:", error);
      setError("Failed to fetch project details. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const response = await axios.get(`/api/projects/${id}/download`);
      if (response.status === 200) {
        setToast({ 
          open: true, 
          message: "The project summary has been emailed to you.", 
          severity: "success" 
        });
      } else {
        throw new Error("Download failed");
      }
    } catch (error) {
      console.error("Error downloading summary:", error);
      setToast({ 
        open: true, 
        message: "There was an issue downloading the summary.", 
        severity: "error" 
      });
    } finally {
      setDownloading(false);
    }
  };

  const handleCloseToast = () => {
    setToast({ ...toast, open: false });
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  };

  // Show skeleton loading state
  if (status === "loading" || loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <ProjectDetailsSkeleton />
      </motion.div>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 5 }}>
        <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
        <Button 
          variant="contained" 
          startIcon={<ArrowBackIcon />} 
          onClick={() => router.push("/admin")}
        >
          Back to Dashboard
        </Button>
      </Container>
    );
  }

  if (!project) {
    return (
      <Container maxWidth="md" sx={{ mt: 5 }}>
        <Alert severity="warning">Project not found</Alert>
        <Button 
          variant="contained" 
          startIcon={<ArrowBackIcon />} 
          onClick={() => router.push("/admin")}
          sx={{ mt: 2 }}
        >
          Back to Dashboard
        </Button>
      </Container>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3, alignItems: "center" }}>
          <Button 
            variant="contained" 
            startIcon={<ArrowBackIcon />} 
            onClick={() => router.push("/admin")}
          >
            Back to Dashboard
          </Button>
          
          <Button
            variant="contained"
            color="success"
            startIcon={<DownloadIcon />}
            onClick={handleDownload}
            disabled={downloading}
          >
            {downloading ? "Sending..." : "Download Summary"}
          </Button>
        </Box>

        <Card 
          elevation={4} 
          sx={{ 
            borderRadius: 3, 
            overflow: "hidden",
            bgcolor: theme.palette.background.paper
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <Typography variant="h4" fontWeight="bold" gutterBottom>
                {project.title}
              </Typography>
              
              <Chip 
                label={project.status} 
                color={project.status === "SUBMITTED" ? "success" : "warning"}
                sx={{ fontWeight: "bold" }}
              />
            </Box>
            
            <Divider sx={{ my: 3 }} />
            
            {/* Main Info Grid */}
            <Grid container spacing={4}>
              {/* Left Column: Team Leader and Project Timeline */}
              <Grid item xs={12} md={6}>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                    <GroupIcon sx={{ mr: 1 }} /> Team Leader
                  </Typography>
                  <Paper 
                    elevation={1} 
                    sx={{ 
                      p: 2, 
                      backgroundColor: theme.palette.mode === 'dark' ? theme.palette.background.paper : "#f9f9f9", 
                      borderRadius: 2 
                    }}
                  >
                    <Typography variant="body1" fontWeight="medium">
                      {project.leader.name} ({project.leader.regId})
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {project.leader.email}
                    </Typography>
                  </Paper>
                </Box>
                
                {/* Project Image Box - Moved to Left Column */}
                {project.projectPhoto && project.status === "SUBMITTED" && (
                  <Box 
                    sx={{ 
                      mt: 3, // Add some top margin below Team Leader
                      width: '300px', // Set a larger fixed width
                      height: '300px', // Set a larger fixed height for 1:1 ratio
                      margin: '0 auto', // Center within the grid column
                      overflow: 'hidden', 
                      bgcolor: theme.palette.mode === 'dark' ? theme.palette.grey[900] : theme.palette.grey[100],
                      borderRadius: 2, 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      padding: 1 // Keep padding around the image
                    }}
                  >
                    <img 
                      src={`/api/projects/${id}/image?key=${encodeURIComponent(project.projectPhoto)}`}
                      alt="Project" 
                      style={{ 
                        maxWidth: '100%', 
                        maxHeight: '100%', 
                        width: 'auto', 
                        height: 'auto', 
                        objectFit: 'contain' 
                      }} 
                    />
                  </Box>
                )}

                {project.createdAt && (
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                      <CalendarTodayIcon sx={{ mr: 1 }} /> Project Timeline
                    </Typography>
                    <Paper 
                      elevation={1} 
                      sx={{ 
                        p: 2, 
                        backgroundColor: theme.palette.mode === 'dark' ? theme.palette.background.paper : "#f9f9f9", 
                        borderRadius: 2 
                      }}
                    >
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">Created</Typography>
                          <Typography variant="body1">{formatDate(project.createdAt)}</Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">Last Updated</Typography>
                          <Typography variant="body1">{formatDate(project.updatedAt)}</Typography>
                        </Grid>
                      </Grid>
                    </Paper>
                  </Box>
                )}
              </Grid>
              
              {/* Right Column: Team Members and Project Image */}
              <Grid item xs={12} md={6}>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                    <GroupIcon sx={{ mr: 1 }} /> Team Members
                  </Typography>
                  <Paper 
                    elevation={1} 
                    sx={{ 
                      p: 2, 
                      backgroundColor: theme.palette.mode === 'dark' ? theme.palette.background.paper : "#f9f9f9", 
                      borderRadius: 2 
                    }}
                  >
                    {project.teamMembers && (
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                        {JSON.parse(project.teamMembers).map((member, index) => (
                          <Chip key={index} label={member} size="small" sx={{ mb: 1 }} />
                        ))}
                      </Box>
                    )}
                  </Paper>
                </Box>
              </Grid>
            </Grid>

            {/* Components Section - Full Width */}
            <Grid container spacing={4} sx={{ mt: 0 }}> {/* mt: 0 to reduce space between grids */}
              <Grid item xs={12}>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                    <BuildIcon sx={{ mr: 1 }} /> Components
                  </Typography>
                  <Paper 
                    elevation={1} 
                    sx={{ 
                      p: 2, 
                      backgroundColor: theme.palette.mode === 'dark' ? theme.palette.background.paper : "#f9f9f9", 
                      borderRadius: 2 
                    }}
                  >
                    <Grid container spacing={1}>
                      {project.components.split(',').map((component, index) => (
                        <Grid item xs={12} sm={6} md={4} key={index}> {/* Responsive 3-column grid for components */}
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Box 
                              component="span" 
                              sx={{ 
                                width: 6, 
                                height: 6, 
                                borderRadius: '50%', 
                                bgcolor: 'primary.main',
                                mr: 1
                              }} 
                            />
                            <Typography variant="body2">
                              {component.trim()}
                            </Typography>
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                  </Paper>
                </Box>
              </Grid>
            </Grid>

            {/* Project Summary - Full Width */}
            {project.summary && (
              <Box sx={{ mt: 1 }}> {/* Adjusted top margin */}
                <Typography variant="h6" sx={{ mb: 1 }}>Project Summary</Typography>
                <Paper 
                  elevation={1} 
                  sx={{ 
                    p: 3, 
                    backgroundColor: theme.palette.mode === 'dark' ? theme.palette.background.paper : "#f9f9f9", 
                    borderRadius: 2 
                  }}
                >
                  <Typography variant="body1" sx={{ whiteSpace: "pre-line" }}>
                    {project.summary}
                  </Typography>
                </Paper>
              </Box>
            )}
          </CardContent>
        </Card>
        
        <Snackbar
          open={toast.open}
          autoHideDuration={6000}
          onClose={handleCloseToast}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert onClose={handleCloseToast} severity={toast.severity} sx={{ width: "100%" }}>
            {toast.message}
          </Alert>
        </Snackbar>
      </Container>
    </motion.div>
  );
}