"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
  Box,
  Divider,
  Paper,
  Breadcrumbs,
  IconButton,
  Tooltip,
  useTheme
} from "@mui/material";
import { motion } from "framer-motion";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import GroupIcon from '@mui/icons-material/Group';
import TitleIcon from '@mui/icons-material/Title';
import ExtensionIcon from '@mui/icons-material/Extension';
import SaveIcon from '@mui/icons-material/Save';
import HomeIcon from '@mui/icons-material/Home';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

// Loading skeleton for create project page
const CreateProjectSkeleton = () => {
  const theme = useTheme();
  
  return (
    <Box sx={{ width: '100%', p: 2 }}>
      <Box sx={{ mb: 3, width: '40%' }}>
        <motion.div 
          animate={{ opacity: [0.5, 0.8, 0.5] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        >
          <Box sx={{ height: 30, bgcolor: 'action.hover', borderRadius: 1, mb: 2 }} />
        </motion.div>
      </Box>
      
      <Paper sx={{ p: 3, borderRadius: 2 }}>
        <Box sx={{ mb: 4, width: '60%' }}>
          <motion.div 
            animate={{ opacity: [0.5, 0.8, 0.5] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          >
            <Box sx={{ height: 40, bgcolor: 'action.hover', borderRadius: 1, mb: 1 }} />
          </motion.div>
        </Box>
        
        <Grid container spacing={3}>
          {[1, 2, 3, 4, 5].map((i) => (
            <Grid item xs={12} key={i}>
              <motion.div 
                animate={{ opacity: [0.5, 0.8, 0.5] }}
                transition={{ repeat: Infinity, duration: 1.5, delay: i * 0.1 }}
              >
                <Box sx={{ height: 56, bgcolor: 'action.hover', borderRadius: 1 }} />
              </motion.div>
            </Grid>
          ))}
          
          <Grid item xs={12}>
            <motion.div 
              animate={{ opacity: [0.5, 0.8, 0.5] }}
              transition={{ repeat: Infinity, duration: 1.5, delay: 0.6 }}
            >
              <Box sx={{ height: 120, bgcolor: 'action.hover', borderRadius: 1 }} />
            </motion.div>
          </Grid>
          
          <Grid item xs={12}>
            <motion.div 
              animate={{ opacity: [0.5, 0.8, 0.5] }}
              transition={{ repeat: Infinity, duration: 1.5, delay: 0.7 }}
            >
              <Box sx={{ height: 50, bgcolor: 'action.hover', borderRadius: 1 }} />
            </motion.div>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default function CreateProject() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const theme = useTheme();

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
      <Container maxWidth="md" sx={{ py: { xs: 2, sm: 4 } }}>
        <CreateProjectSkeleton />
      </Container>
    );
  }

  if (status === "unauthenticated") {
    router.push("/api/auth/signin");
    return (
      <Container maxWidth="md" sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Box 
      sx={{ 
        minHeight: '100vh',
        backgroundColor: 'background.default',
        pb: 8,
        width: '100%',
      }}
    >
      <Container maxWidth="md" sx={{ py: { xs: 2, md: 4 }, px: { xs: 2, sm: 3, md: 4 } }}>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Breadcrumb and page header */}
          <Box sx={{ mb: 3, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' } }}>
            <Box>
              <Breadcrumbs 
                separator={<NavigateNextIcon fontSize="small" />} 
                aria-label="breadcrumb"
                sx={{ mb: 1 }}
              >
                <Link href="/" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center' }}>
                  <HomeIcon sx={{ mr: 0.5 }} fontSize="small" />
                  TrackLab
                </Link>
                <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
                  New Project
                </Typography>
              </Breadcrumbs>
              <Typography variant="h5" fontWeight="bold" component={motion.h1}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                Create New Project
              </Typography>
            </Box>
            
            <Tooltip title="Back to Dashboard">
              <Button
                component={Link}
                href="/"
                startIcon={<ArrowBackIcon />}
                sx={{ mt: { xs: 2, sm: 0 } }}
              >
                Dashboard
              </Button>
            </Tooltip>
          </Box>

          <Card 
            elevation={2} 
            sx={{ 
              borderRadius: 2,
              overflow: 'hidden',
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
            }}
            component={motion.div}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Box sx={{ 
              p: 2, 
              background: (theme) => `linear-gradient(135deg, ${theme.palette.primary.main}15, ${theme.palette.primary.light}30)`,
              borderBottom: (theme) => `1px solid ${theme.palette.divider}`
            }}>
              <Typography variant="h6" fontWeight="medium">
                Project Information
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Fill in the details to create your new project
              </Typography>
            </Box>
            
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              {error && (
                <Alert 
                  severity="error" 
                  sx={{ mb: 3, borderRadius: 1 }}
                  component={motion.div}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {error}
                </Alert>
              )}

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
                      InputProps={{
                        startAdornment: <TitleIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                      }}
                      placeholder="Enter a descriptive title for your project"
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <FormControl fullWidth>
                      <InputLabel>Number of Team Members</InputLabel>
                      <Select
                        value={numMembers}
                        onChange={(e) => setNumMembers(Number(e.target.value))}
                        label="Number of Team Members"
                        startAdornment={<GroupIcon sx={{ mr: 1, ml: -0.5, color: 'text.secondary' }} />}
                      >
                        {[1, 2, 3, 4, 5, 6].map((num) => (
                          <MenuItem key={num} value={num}>
                            {num} {num === 1 ? 'Member' : 'Members'}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Team Members
                    </Typography>
                    <Box 
                      sx={{ 
                        p: 2, 
                        borderRadius: 2, 
                        bgcolor: 'background.paper',
                        border: (theme) => `1px solid ${theme.palette.divider}`
                      }}
                    >
                      <Grid container spacing={2}>
                        {teamMembers.map((member, index) => (
                          <Grid item xs={12} sm={numMembers > 2 ? 6 : 12} key={index}>
                            <TextField
                              label={`Team Member ${index + 1}`}
                              variant="outlined"
                              fullWidth
                              value={member}
                              onChange={(e) => handleTeamMemberChange(index, e.target.value)}
                              required
                              placeholder="Enter full name"
                              size="small"
                            />
                          </Grid>
                        ))}
                      </Grid>
                    </Box>
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      label="Borrowed Components"
                      variant="outlined"
                      fullWidth
                      multiline
                      rows={4}
                      value={borrowedComponents}
                      onChange={(e) => setBorrowedComponents(e.target.value)}
                      required
                      InputProps={{
                        startAdornment: <ExtensionIcon sx={{ mr: 1, color: 'text.secondary', alignSelf: 'flex-start', mt: 1 }} />,
                      }}
                      placeholder="List all the hardware components you borrowed for this project"
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Divider sx={{ my: 1 }} />
                  </Grid>

                  <Grid item xs={12}>
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      fullWidth
                      disabled={loading}
                      size="large"
                      startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                      sx={{ 
                        py: 1.5, 
                        fontWeight: 600,
                        borderRadius: 2,
                        boxShadow: 2
                      }}
                    >
                      {loading ? "Creating Project..." : "Create Project"}
                    </Button>
                  </Grid>
                </Grid>
              </form>
            </CardContent>
          </Card>
        </motion.div>

        {/* Toast Notification */}
        <Snackbar
          open={toast.open}
          autoHideDuration={3000}
          onClose={() => setToast({ ...toast, open: false })}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        >
          <Box sx={{ width: "100%", borderRadius: 1, overflow: 'hidden', boxShadow: 3 }}>
            <Alert 
              severity={toast.severity} 
              onClose={() => setToast({ ...toast, open: false })}
              variant="filled"
            >
              {toast.message}
            </Alert>
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{
                backgroundColor: (theme) => toast.severity === "success" ? 
                  theme.palette.success.dark : theme.palette.error.dark,
                height: 4
              }}
            />
          </Box>
        </Snackbar>
      </Container>
    </Box>
  );
}