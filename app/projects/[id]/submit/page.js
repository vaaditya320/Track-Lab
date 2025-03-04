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
  Box,
  Paper,
  Divider,
  Avatar,
  Stack,
  Chip,
  IconButton
} from "@mui/material";
import { motion } from "framer-motion";
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

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
  const [previewUrl, setPreviewUrl] = useState(null);

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
      
      // Create a preview URL for the image
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
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

  const getTeamMembers = () => {
    if (!project) return [];
    
    if (Array.isArray(project.teamMembers)) {
      return project.teamMembers;
    }
    
    try {
      return JSON.parse(project.teamMembers || "[]");
    } catch (e) {
      return [];
    }
  };

  if (loading || status === "loading") {
    return (
      <Container maxWidth="lg" sx={{ height: "100vh", display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Box sx={{ textAlign: "center" }}>
            <CircularProgress size={60} thickness={4} />
            <Typography variant="h6" sx={{ mt: 2, fontWeight: 500 }}>
              Loading project details...
            </Typography>
          </Box>
        </motion.div>
      </Container>
    );
  }

  if (!project) {
    return (
      <Container maxWidth="md" sx={{ textAlign: "center", py: 8 }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
            <Alert severity="error" sx={{ mb: 2 }}>Project not found.</Alert>
            <Button 
              variant="contained" 
              startIcon={<ArrowBackIcon />}
              onClick={() => router.push("/")}
            >
              Return to Dashboard
            </Button>
          </Paper>
        </motion.div>
      </Container>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.5 }}
    >
      <Container maxWidth="lg" sx={{ py: 5 }}>
        <Paper 
          elevation={0}
          sx={{ 
            display: "flex", 
            alignItems: "center", 
            mb: 3, 
            p: 2,
            backgroundColor: "transparent",
            cursor: "pointer"
          }}
          onClick={() => router.push(`/`)}
        >
          <IconButton size="small" sx={{ mr: 1 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="body1">Back to project</Typography>
        </Paper>

        <Card 
          elevation={3} 
          sx={{ 
            borderRadius: 2,
            overflow: "hidden",
            backgroundImage: "linear-gradient(to bottom right, rgba(255,255,255,0.8), rgba(255,255,255,0.9))",
            backdropFilter: "blur(10px)",
          }}
        >
          <Box 
            sx={{ 
              p: 3, 
              py: 4,
              background: "linear-gradient(135deg, #4527a0, #7b1fa2)",
              color: "white" 
            }}
          >
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              Complete Your Project
            </Typography>
            <Typography variant="h6">
              {project.title}
            </Typography>
          </Box>

          <CardContent sx={{ p: 4 }}>
            {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

            <Grid container spacing={4}>
              <Grid item xs={12} md={6}>
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Project Details
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  
                  <Typography variant="subtitle1" sx={{ mb: 0.5 }} color="text.secondary">
                    Team Members
                  </Typography>
                  <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap', gap: 1 }}>
                    {getTeamMembers().map((member, index) => (
                      <Chip 
                        key={index}
                        avatar={<Avatar>{member.charAt(0).toUpperCase()}</Avatar>}
                        label={member}
                        variant="outlined"
                        sx={{ mb: 1 }}
                      />
                    ))}
                  </Stack>
                </Box>

                <form onSubmit={handleSubmit}>
                  <TextField
                    label="Project Summary"
                    variant="outlined"
                    fullWidth
                    multiline
                    rows={5}
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    required
                    placeholder="Describe what you've accomplished in this project, challenges faced, and solutions implemented..."
                    sx={{ mb: 3 }}
                  />

                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    fullWidth
                    disabled={submitting || !photo}
                    size="large"
                    sx={{ 
                      py: 1.5, 
                      borderRadius: 2,
                      background: !submitting && photo ? "linear-gradient(135deg, #4527a0, #7b1fa2)" : undefined
                    }}
                    startIcon={submitting ? <CircularProgress size={24} color="inherit" /> : <CheckCircleIcon />}
                  >
                    {submitting ? "Submitting..." : "Complete Project"}
                  </Button>
                </form>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Project Photo
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  
                  <Paper
                    elevation={0}
                    sx={{
                      border: '2px dashed #ccc',
                      borderRadius: 2,
                      p: 3,
                      textAlign: 'center',
                      backgroundColor: previewUrl ? 'transparent' : '#f8f9fa',
                      position: 'relative',
                      height: 320,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      alignItems: 'center',
                      overflow: 'hidden'
                    }}
                  >
                    {previewUrl ? (
                      <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
                        <img
                          src={previewUrl}
                          alt="Preview"
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            borderRadius: '8px'
                          }}
                        />
                        <Box
                          sx={{
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            p: 1,
                            background: 'rgba(0,0,0,0.6)',
                            color: 'white',
                            borderBottomLeftRadius: '8px',
                            borderBottomRightRadius: '8px'
                          }}
                        >
                          <Typography variant="body2">{photo?.name}</Typography>
                        </Box>
                      </Box>
                    ) : (
                      <>
                        <CloudUploadIcon sx={{ fontSize: 60, color: '#9e9e9e', mb: 2 }} />
                        <Typography variant="body1" gutterBottom>
                          Drag and drop your project photo here
                        </Typography>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          or click to browse files
                        </Typography>
                      </>
                    )}
                    
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      style={{
                        opacity: 0,
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        cursor: 'pointer'
                      }}
                      id="photo-upload"
                    />
                  </Paper>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1, textAlign: 'center' }}>
                    Showcase your completed project with a high-quality photo
                  </Typography>
                </Box>
              </Grid>
            </Grid>
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
        <Box sx={{ width: "100%", maxWidth: 400 }}>
          <Alert 
            severity={toast.severity} 
            onClose={() => setToast({ ...toast, open: false })}
            sx={{ 
              borderTopLeftRadius: 8, 
              borderTopRightRadius: 8,
              borderBottomLeftRadius: 0,
              borderBottomRightRadius: 0
            }}
            variant="filled"
          >
            {toast.message}
          </Alert>
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{
              borderBottomLeftRadius: 8,
              borderBottomRightRadius: 8,
              height: 6,
              backgroundColor: toast.severity === "success" ? "rgba(27, 94, 32, 0.3)" : "rgba(183, 28, 28, 0.3)",
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