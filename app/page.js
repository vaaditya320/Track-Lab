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
  Card, CardContent, Grid, Dialog, DialogActions, DialogContent,
  DialogContentText, DialogTitle, useTheme, useMediaQuery
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import DashboardIcon from '@mui/icons-material/Dashboard';
import AddIcon from '@mui/icons-material/Add';
import DownloadIcon from '@mui/icons-material/Download';
import SendIcon from '@mui/icons-material/Send';
import DeleteIcon from '@mui/icons-material/Delete';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import CloseIcon from '@mui/icons-material/Close';
import ProjectStatusBadge from "./components/ProjectStatusBadge";
import ProjectStatsCard from "./components/ProjectStatsCard";
import DashboardSkeleton from "./components/DashboardSkeleton";

// Project table component with responsive design
const ProjectsTable = ({ projects, loadingProjectId, handleDownloadSummary, handleSubmitProject, handleDeleteClick }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [selectedProject, setSelectedProject] = useState(null);
  
  const handleProjectClick = (project) => {
    if (isMobile) {
      setSelectedProject(project);
    }
  };

  const handleCloseDetails = () => {
    setSelectedProject(null);
  };
  
  return (
    <>
      <TableContainer 
        component={Paper} 
        elevation={2} 
        sx={{ 
          borderRadius: 2,
          overflow: 'auto',
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
              <TableCell width="25%"><Typography variant="subtitle2">Project Name</Typography></TableCell>
              <TableCell width="15%"><Typography variant="subtitle2">Status</Typography></TableCell>
              {!isMobile && (
                <>
                  <TableCell width="30%"><Typography variant="subtitle2">Actions</Typography></TableCell>
                  <TableCell width="15%"><Typography variant="subtitle2">Submit</Typography></TableCell>
                </>
              )}
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
                onClick={() => handleProjectClick(project)}
                sx={isMobile ? { cursor: 'pointer' } : {}}
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
                {!isMobile && (
                  <>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
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
                              sx={{ borderRadius: 4 }}
                            >
                              Summary
                            </Button>
                          </span>
                        </Tooltip>
                        <Tooltip title="Delete project">
                          <Button
                            variant="outlined"
                            color="error"
                            size="small"
                            startIcon={<DeleteIcon />}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteClick(project);
                            }}
                            sx={{ borderRadius: 4 }}
                          >
                            Delete
                          </Button>
                        </Tooltip>
                      </Box>
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
                            sx={{ borderRadius: 4 }}
                          >
                            Submit
                          </Button>
                        </Tooltip>
                      ) : (
                        <Chip 
                          label="Submitted" 
                          color="success" 
                          size="small"
                          sx={{ borderRadius: 4 }}
                        />
                      )}
                    </TableCell>
                  </>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Mobile Project Details Dialog - FIXED */}
      <Dialog
        open={Boolean(selectedProject)}
        onClose={handleCloseDetails}
        fullWidth
        maxWidth="sm"
        sx={{
          '& .MuiDialog-paper': {
            borderRadius: 2,
            m: { xs: 1, sm: 2 },
          },
        }}
      >
        {selectedProject && (
          <>
            <DialogTitle 
              sx={{ 
                pb: 1, 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                fontWeight: 600
              }}
            >
              Project Details
              <IconButton 
                onClick={handleCloseDetails}
                size="small"
                aria-label="close"
                edge="end"
              >
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent dividers>
              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  Project Name
                </Typography>
                <Typography variant="h6" fontWeight={500}>
                  {selectedProject.title}
                </Typography>
              </Box>
              
              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  Status
                </Typography>
                <Box sx={{ mt: 0.5 }}>
                  <ProjectStatusBadge status={selectedProject.status} />
                </Box>
              </Box>
              
              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Actions
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 0.5 }}>
                  <Button
                    variant="outlined"
                    color="primary"
                    size="small"
                    startIcon={loadingProjectId === selectedProject.id ? 
                      <CircularProgress size={16} color="inherit" /> : 
                      <DownloadIcon />}
                    onClick={() => {
                      handleDownloadSummary(selectedProject.id);
                      handleCloseDetails();
                    }}
                    disabled={loadingProjectId === selectedProject.id}
                    sx={{ borderRadius: 4 }}
                  >
                    Download Summary
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    startIcon={<DeleteIcon />}
                    onClick={() => {
                      handleDeleteClick(selectedProject);
                      handleCloseDetails();
                    }}
                    sx={{ borderRadius: 4 }}
                  >
                    Delete
                  </Button>
                </Box>
              </Box>
            </DialogContent>
            <DialogActions sx={{ px: 3, py: 2 }}>
              {selectedProject.status === "PARTIAL" ? (
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  startIcon={<SendIcon />}
                  onClick={() => {
                    handleSubmitProject(selectedProject.id);
                    handleCloseDetails();
                  }}
                  sx={{ borderRadius: 4 }}
                >
                  Submit Project
                </Button>
              ) : (
                <Chip 
                  label="Project Already Submitted" 
                  color="success" 
                  size="medium"
                  sx={{ 
                    borderRadius: 4, 
                    py: 2.5,
                    width: '100%',
                    justifyContent: 'center'
                  }}
                />
              )}
            </DialogActions>
          </>
        )}
      </Dialog>
    </>
  );
};

// Empty state component
const EmptyProjectsState = () => {
  const theme = useTheme();
  
  return (
    <Box 
      sx={{ 
        textAlign: 'center', 
        py: 8,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 2,
        bgcolor: 'background.paper',
        borderRadius: 2,
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
      <Typography variant="body2" color="text.disabled" sx={{ maxWidth: 400, mb: 2, px: 2 }}>
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
};

// Welcome banner for authenticated users
const WelcomeBanner = ({ userName }) => {
  const theme = useTheme();
  
  return (
    <Card 
      sx={{ 
        mb: 4, 
        background: `linear-gradient(135deg, ${theme.palette.primary.main}15, ${theme.palette.primary.light}30)`,
        borderRadius: 2,
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
          <Grid item xs={12} md={4} sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' }, mt: { xs: 2, md: 0 }, gap: 1, flexWrap: 'wrap' }}>
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
                borderRadius: 2,
              }}
            >
              New Project
            </Button>
            <Button 
              variant="outlined" 
              color="secondary"
              component={Link}
              href="/idealab"
              sx={{ 
                px: 3, 
                py: 1.2,
                fontWeight: 600,
                borderRadius: 2,
              }}
            >
              Explore IDEA Lab
            </Button>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

// Main Home component
export default function Home() {
  const { data: session, status } = useSession();
  const [projects, setProjects] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingProjectId, setLoadingProjectId] = useState(null);
  const [toast, setToast] = useState({ open: false, message: "", severity: "success" });
  const [viewMode, setViewMode] = useState("table"); // table or dashboard
  const [deleteDialog, setDeleteDialog] = useState({ open: false, project: null, isDeleting: false });
  const router = useRouter();
  const theme = useTheme();

  const fetchProjects = async () => {
    if (status === "authenticated") {
      try {
        const response = await axios.get("/api/projects", { 
          headers: { Authorization: `Bearer ${session.user.id}` } 
        });
        setProjects(response.data);
      } catch (error) {
        console.error("Error fetching projects:", error);
        setError("There was an issue fetching your projects.");
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    if (status === "authenticated") {
      // Redirect to /profile if any required field is missing
      if (!session?.user?.branch || !session?.user?.section || !session?.user?.batch || !session?.user?.phoneNumber) {
        router.push("/profile");
      } else {
        fetchProjects();
      }
    } else if (status === "unauthenticated") {
      setLoading(false);
    }
  }, [status, session?.user?.id, session?.user?.branch, session?.user?.section, session?.user?.batch, session?.user?.phoneNumber]);

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

  const handleDeleteClick = (project) => {
    setDeleteDialog({ open: true, project, isDeleting: false });
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialog({ open: false, project: null, isDeleting: false });
  };

  const handleConfirmDelete = async () => {
    const projectId = deleteDialog.project.id;
    setDeleteDialog(prev => ({ ...prev, isDeleting: true }));
    
    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete project');
      }
      
      // Update projects list by removing the deleted project
      setProjects(projects.filter(p => p.id !== projectId));
      setToast({ 
        open: true, 
        message: "Project deleted successfully.", 
        severity: "success" 
      });
    } catch (error) {
      console.error('Error deleting project:', error.message);
      setToast({ 
        open: true, 
        message: `Failed to delete project: ${error.message}`, 
        severity: "error" 
      });
    } finally {
      setDeleteDialog({ open: false, project: null, isDeleting: false });
    }
  };

  // Calculate project statistics
  const projectStats = {
    total: projects.length,
    submitted: projects.filter(p => p.status !== "PARTIAL").length,
    inProgress: projects.filter(p => p.status === "PARTIAL").length,
  };

  return (
    <Box 
      sx={{ 
        minHeight: '100vh',
        backgroundColor: theme.palette.background.default,
        pb: 8,
        width: '100%',
      }}
    >
      <Container maxWidth="lg" sx={{ py: { xs: 2, md: 4 }, px: { xs: 2, sm: 3, md: 4 } }}>
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
                  <Grid item xs={12} sm={6} md={4}>
                    <ProjectStatsCard 
                      title="Total Projects"
                      count={projectStats.total}
                      icon="total"
                      color={theme.palette.primary.main}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <ProjectStatsCard 
                      title="In Progress"
                      count={projectStats.inProgress}
                      icon="progress"
                      color={theme.palette.warning.main}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <ProjectStatsCard 
                      title="Submitted"
                      count={projectStats.submitted}
                      icon="submitted"
                      color={theme.palette.success.main}
                    />
                  </Grid>
                </Grid>
              )}

              <Box sx={{ width: '100%' }}>
                <AnimatePresence mode="wait">
                  {projects.length > 0 ? (
                    <motion.div
                      key="projects-table"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.4 }}
                      style={{ width: '100%' }}
                    >
                      <ProjectsTable 
                        projects={projects}
                        loadingProjectId={loadingProjectId}
                        handleDownloadSummary={handleDownloadSummary}
                        handleSubmitProject={handleSubmitProject}
                        handleDeleteClick={handleDeleteClick}
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
              </Box>
            </>
          ) : (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "60vh",
                flexDirection: "column",
                backgroundColor: theme.palette.mode === 'dark' ? theme.palette.background.paper : "white",
                borderRadius: 2,
                p: { xs: 3, sm: 6 },
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
              <Typography variant="body1" color="text.secondary" sx={{ mb: 4, textAlign: "center", maxWidth: 600, px: 2 }}>
                TrackLab helps you manage and submit your projects with ease. Sign in to start tracking your progress.
              </Typography>

              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  sx={{ px: 4, py: 1.5, fontSize: "16px", fontWeight: 600, borderRadius: 2 }}
                  onClick={() => router.push("/api/auth/signin")}
                >
                  Login to Get Started
                </Button>
                <Button
                  variant="outlined"
                  color="secondary"
                  size="large"
                  component={Link}
                  href="/idealab"
                  sx={{ px: 4, py: 1.5, fontSize: "16px", fontWeight: 600, borderRadius: 2 }}
                >
                  Explore IDEA Lab
                </Button>
              </Box>
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

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteDialog.open}
          onClose={handleCloseDeleteDialog}
          aria-labelledby="delete-dialog-title"
          aria-describedby="delete-dialog-description"
        >
          <DialogTitle id="delete-dialog-title">
            {"Delete Project?"}
          </DialogTitle>
          <DialogContent>
            <DialogContentText id="delete-dialog-description">
              Are you sure you want to delete the project{" "}
              <strong>{deleteDialog.project?.title}</strong>? This action cannot be undone.
            </DialogContentText>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button 
              onClick={handleCloseDeleteDialog} 
              disabled={deleteDialog.isDeleting}
              sx={{ borderRadius: 2 }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleConfirmDelete} 
              color="error" 
              variant="contained"
              disabled={deleteDialog.isDeleting}
              startIcon={deleteDialog.isDeleting ? <CircularProgress size={16} color="inherit" /> : <DeleteIcon />}
              sx={{ borderRadius: 2 }}
            >
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
}