"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";
import { useRouter } from "next/navigation";
import { 
  Box, Container, Typography, Button, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Paper, Snackbar, Alert, 
  CircularProgress, Skeleton, Chip, Tooltip, IconButton,
  Card, CardContent, Grid
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import DashboardIcon from '@mui/icons-material/Dashboard';
import AddIcon from '@mui/icons-material/Add';
import DownloadIcon from '@mui/icons-material/Download';
import SendIcon from '@mui/icons-material/Send';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import FilterListIcon from '@mui/icons-material/FilterList';
import SortIcon from '@mui/icons-material/Sort';
import { ThemeProvider } from "@mui/material/styles";
import { theme } from "./theme/trackLabTheme";
import ProjectStatusBadge from "./components/ProjectStatusBadge";
import ProjectStatsCard from "./components/ProjectStatsCard";
import DashboardSkeleton from "./components/DashboardSkeleton";

// Project table component
const ProjectsTable = ({ projects, loadingProjectId, handleDownloadSummary, handleSubmitProject }) => {
  return (
    <TableContainer 
      component={Paper} 
      elevation={2} 
      sx={{ 
        borderRadius: theme.shape.borderRadius,
        overflow: 'hidden',
        '& .MuiTable-root': {
          borderCollapse: 'separate',
          borderSpacing: 0,
        },
      }}
    >
      <Table>
        <TableHead>
          <TableRow sx={{ backgroundColor: `${theme.palette.primary.light}15` }}>
            <TableCell width="5%"><Typography variant="subtitle2">S. No.</Typography></TableCell>
            <TableCell width="30%"><Typography variant="subtitle2">Project Name</Typography></TableCell>
            <TableCell width="15%"><Typography variant="subtitle2">Status</Typography></TableCell>
            
            <TableCell width="15%"><Typography variant="subtitle2">Actions</Typography></TableCell>
            <TableCell width="15%"><Typography variant="subtitle2">Submit</Typography></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {projects.map((project, index) => (
            <TableRow 
              key={project.id} 
              hover
              component={motion.tr}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <TableCell>{index + 1}</TableCell>
              <TableCell>
                <Typography variant="body1" fontWeight={500}>
                  {project.title}
                </Typography>
              </TableCell>
              <TableCell>
                <ProjectStatusBadge status={project.status} />
              </TableCell>
              
              <TableCell>
                <Tooltip title="Download project summary">
                  <span>
                    <Button
                      variant="outlined"
                      color="primary"
                      size="small"
                      startIcon={loadingProjectId === project.id ? 
                        <CircularProgress size={16} color="inherit" /> : 
                        <DownloadIcon />}
                      onClick={() => handleDownloadSummary(project.id)}
                      disabled={loadingProjectId === project.id}
                      sx={{ borderRadius: 6 }}
                    >
                      Summary
                    </Button>
                  </span>
                </Tooltip>
              </TableCell>
              <TableCell>
                {project.status === "PARTIAL" ? (
                  <Tooltip title="Submit your project">
                    <Button
                      variant="contained"
                      color="primary"
                      size="small"
                      startIcon={<SendIcon />}
                      onClick={() => handleSubmitProject(project.id)}
                      sx={{ borderRadius: 6 }}
                    >
                      Submit
                    </Button>
                  </Tooltip>
                ) : (
                  <Chip 
                    label="Submitted" 
                    color="success" 
                    size="small"
                    sx={{ borderRadius: 6 }}
                  />
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

// Empty state component
const EmptyProjectsState = () => (
  <Box 
    sx={{ 
      textAlign: 'center', 
      py: 8,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 2,
      bgcolor: 'background.paper',
      borderRadius: theme.shape.borderRadius,
      boxShadow: 1,
      my: 4,
    }}
    component={motion.div}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
  >
    <FolderOpenIcon sx={{ fontSize: 64, color: 'text.disabled' }} />
    <Typography variant="h6" color="text.secondary">
      No projects yet
    </Typography>
    <Typography variant="body2" color="text.disabled" sx={{ maxWidth: 400, mb: 2 }}>
      Create your first project to get started tracking your progress
    </Typography>
    <Button 
      variant="contained" 
      color="primary"
      startIcon={<AddIcon />}
      component={Link}
      href="/projects/create"
    >
      Create First Project
    </Button>
  </Box>
);

// Welcome banner for authenticated users
const WelcomeBanner = ({ userName }) => (
  <Card 
    sx={{ 
      mb: 4, 
      background: `linear-gradient(135deg, ${theme.palette.primary.main}15, ${theme.palette.primary.light}30)`,
      borderRadius: theme.shape.borderRadius,
      overflow: 'hidden',
      position: 'relative',
    }}
    elevation={0}
    component={motion.div}
    initial={{ opacity: 0, y: -20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
  >
    <CardContent sx={{ py: 3 }}>
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} md={8}>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            Welcome back, {userName}!
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Track, manage, and submit your projects with ease.
          </Typography>
        </Grid>
        <Grid item xs={12} md={4} sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
          <Button 
            variant="contained" 
            color="primary"
            startIcon={<AddIcon />}
            component={Link}
            href="/projects/create"
            sx={{ 
              px: 3, 
              py: 1.2,
              fontWeight: 600,
              boxShadow: 2,
            }}
          >
            New Project
          </Button>
        </Grid>
      </Grid>
    </CardContent>
  </Card>
);

// Main Home component
export default function Home() {
  const { data: session, status } = useSession();
  const [projects, setProjects] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingProjectId, setLoadingProjectId] = useState(null);
  const [toast, setToast] = useState({ open: false, message: "", severity: "success" });
  const [viewMode, setViewMode] = useState("table"); // table or dashboard
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
  }, [status, session?.user?.id]);

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

  // Calculate project statistics
  const projectStats = {
    total: projects.length,
    submitted: projects.filter(p => p.status !== "PARTIAL").length,
    inProgress: projects.filter(p => p.status === "PARTIAL").length,
  };

  return (
    <ThemeProvider theme={theme}>
      <Box 
        sx={{ 
          minHeight: '100vh',
          backgroundColor: theme.palette.background.default,
          pb: 8
        }}
      >
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {/* App Header */}
            <Box sx={{ mb: 6, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography 
                variant="h4" 
                fontWeight="bold"
                component={motion.h4}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                TrackLab
              </Typography>
              
              {status === "authenticated" && (
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Tooltip title={viewMode === "table" ? "Dashboard View" : "Table View"}>
                    <IconButton 
                      onClick={() => setViewMode(viewMode === "table" ? "dashboard" : "table")}
                      color="primary"
                    >
                      <DashboardIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Filter Projects">
                    <IconButton color="primary">
                      <FilterListIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Sort Projects">
                    <IconButton color="primary">
                      <SortIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              )}
            </Box>

            {loading ? (
              <DashboardSkeleton />
            ) : status === "authenticated" ? (
              <>
                <WelcomeBanner userName={session.user.name} />
                
                {error && (
                  <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                  </Alert>
                )}

                {viewMode === "dashboard" && (
                  <Grid container spacing={3} sx={{ mb: 4 }}>
                    <Grid item xs={12} md={4}>
                      <ProjectStatsCard 
                        title="Total Projects"
                        count={projectStats.total}
                        icon="total"
                        color={theme.palette.primary.main}
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <ProjectStatsCard 
                        title="In Progress"
                        count={projectStats.inProgress}
                        icon="progress"
                        color={theme.palette.warning.main}
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <ProjectStatsCard 
                        title="Submitted"
                        count={projectStats.submitted}
                        icon="submitted"
                        color={theme.palette.success.main}
                      />
                    </Grid>
                  </Grid>
                )}

                <AnimatePresence mode="wait">
                  {projects.length > 0 ? (
                    <motion.div
                      key="projects-table"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.4 }}
                    >
                      <ProjectsTable 
                        projects={projects}
                        loadingProjectId={loadingProjectId}
                        handleDownloadSummary={handleDownloadSummary}
                        handleSubmitProject={handleSubmitProject}
                      />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="empty-state"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.4 }}
                    >
                      <EmptyProjectsState />
                    </motion.div>
                  )}
                </AnimatePresence>
              </>
            ) : (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "60vh",
                  flexDirection: "column",
                  backgroundColor: "white",
                  borderRadius: theme.shape.borderRadius,
                  p: 6,
                  boxShadow: 1,
                }}
                component={motion.div}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <Typography variant="h5" fontWeight="bold" sx={{ mb: 2, textAlign: "center" }}>
                  Welcome to TrackLab
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 4, textAlign: "center", maxWidth: 600 }}>
                  TrackLab helps you manage and submit your projects with ease. Sign in to start tracking your progress.
                </Typography>

                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  sx={{ px: 4, py: 1.5, fontSize: "16px", fontWeight: 600 }}
                  onClick={() => router.push("/api/auth/signin")}
                >
                  Login to Get Started
                </Button>
              </Box>
            )}
          </motion.div>

          {/* Toast Notification */}
          <Snackbar
            open={toast.open}
            autoHideDuration={3000}
            onClose={() => setToast({ ...toast, open: false })}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          >
            <Alert 
              severity={toast.severity} 
              onClose={() => setToast({ ...toast, open: false })}
              elevation={6}
              variant="filled"
            >
              {toast.message}
            </Alert>
          </Snackbar>
        </Container>
      </Box>
    </ThemeProvider>
  );
}