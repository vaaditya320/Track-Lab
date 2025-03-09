"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import axios from "axios";
import {
  Container, Typography, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Snackbar, Alert,
  CircularProgress, Box, Grid, Card, CardContent, TextField,
  MenuItem, Select, InputLabel, FormControl, Checkbox, LinearProgress,
  Skeleton, Tooltip, useTheme, Dialog, DialogTitle, DialogContent, 
  DialogActions, IconButton, useMediaQuery, Divider, ListItem,
  List, ListItemText, ListItemSecondaryAction, Chip, DialogContentText,
  SwipeableDrawer
} from "@mui/material";
import { motion } from "framer-motion";
import CloseIcon from '@mui/icons-material/Close';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import DeleteIcon from '@mui/icons-material/Delete';
import InfoIcon from '@mui/icons-material/Info';

// LoadingSkeleton component
const LoadingSkeleton = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Skeleton variant="text" width="40%" height={60} sx={{ mb: 2 }} />
      
      <Box sx={{ mb: 4 }}>
        <Grid container spacing={2}>
          {[1, 2, 3].map((item) => (
            <Grid item xs={12} sm={6} md={4} key={item}>
              <Skeleton variant="rectangular" height={56} />
            </Grid>
          ))}
        </Grid>
      </Box>
      
      <Card sx={{ borderRadius: 2 }}>
        <CardContent>
          <Skeleton variant="text" width="30%" height={40} sx={{ mb: 2 }} />
          <Skeleton variant="rectangular" width="20%" height={36} sx={{ mb: 2 }} />
          
          <TableContainer component={Paper} elevation={3}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: theme.palette.action.hover }}>
                  {[...Array(isMobile ? 3 : 6)].map((_, i) => (
                    <TableCell key={i}>
                      <Skeleton variant="text" />
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {[1, 2, 3, 4].map((row) => (
                  <TableRow key={row}>
                    {[...Array(isMobile ? 3 : 6)].map((_, i) => (
                      <TableCell key={i}>
                        <Skeleton variant="text" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Container>
  );
};

// Futuristic 403 component
const Forbidden403 = ({ isSignedIn }) => {
  const router = useRouter();
  const theme = useTheme();
  const [counter, setCounter] = useState(5);
  
  useEffect(() => {
    const timer = counter > 0 && setInterval(() => setCounter(counter - 1), 1000);
    if (counter === 0) {
      router.push('/');
    }
    return () => clearInterval(timer);
  }, [counter, router]);
  
  return (
    <Box
      sx={{
        height: "100vh",
        background: theme.palette.mode === 'dark'
          ? "linear-gradient(135deg, #0a0a14 0%, #0b1121 50%, #071a30 100%)"
          : "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: theme.palette.common.white,
        overflow: "hidden",
        position: "relative"
      }}
    >
      {/* Animated background elements */}
      <Box sx={{ position: "absolute", width: "100%", height: "100%", overflow: "hidden" }}>
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            style={{
              position: "absolute",
              background: theme.palette.mode === 'dark' 
                ? "rgba(255, 255, 255, 0.03)" 
                : "rgba(255, 255, 255, 0.05)",
              borderRadius: "50%",
              width: Math.random() * 100 + 10,
              height: Math.random() * 100 + 10,
            }}
            animate={{
              x: [Math.random() * window.innerWidth, Math.random() * window.innerWidth],
              y: [Math.random() * window.innerHeight, Math.random() * window.innerHeight],
            }}
            transition={{
              duration: Math.random() * 20 + 10,
              repeat: Infinity,
              repeatType: "reverse",
            }}
          />
        ))}
      </Box>
      
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <Container maxWidth="md">
          <motion.div
            animate={{ rotateY: [0, 360] }}
            transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
            style={{ marginBottom: "2rem", display: "inline-block" }}
          >
            <Typography variant="h1" sx={{ fontSize: "8rem", fontWeight: "900", textAlign: "center" }}>
              403
            </Typography>
          </motion.div>
          
          <Typography 
            variant="h3" 
            sx={{ 
              mb: 3, 
              textAlign: "center",
              textShadow: "0 0 10px rgba(229, 62, 62, 0.7), 0 0 20px rgba(229, 62, 62, 0.5)"
            }}
          >
            SECURITY BREACH DETECTED
          </Typography>
          
          <Card 
            sx={{ 
              p: 4, 
              backgroundColor: "rgba(255, 255, 255, 0.1)", 
              backdropFilter: "blur(10px)",
              border: `1px solid ${theme.palette.mode === 'dark' 
                ? 'rgba(255, 255, 255, 0.1)' 
                : 'rgba(255, 255, 255, 0.2)'}`,
              borderRadius: 4,
              boxShadow: "0 4px 30px rgba(0, 0, 0, 0.1)"
            }}
          >
            <Typography variant="h5" sx={{ mb: 2, color: "#e94560" }}>
              ACCESS VIOLATION // CODE: RESTRICTED
            </Typography>
            
            <Typography variant="body1" sx={{ mb: 3, color: theme.palette.common.white, textShadow: "0 0 8px #ffffff, 0 0 12px #ffffff" }}>
              {isSignedIn ? 
                "Your clearance level is insufficient to access this secure area. This incident has been logged." :
                "Authentication required. Please sign in to proceed with identity verification."
              }
            </Typography>
            
            <Typography variant="body2" sx={{ mb: 4, fontFamily: "monospace", color: "#4ecca3" }}>
              $ System.redirect("/home") initiating in {counter} seconds...
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Button 
                  fullWidth
                  variant="outlined" 
                  onClick={() => router.push('/')}
                  sx={{ 
                    color: theme.palette.common.white, 
                    borderColor: theme.palette.common.white,
                    "&:hover": { 
                      backgroundColor: "rgba(255, 255, 255, 0.1)",
                      borderColor: "#4ecca3" 
                    }
                  }}
                >
                  Return to Safe Zone
                </Button>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Button 
                  fullWidth
                  variant="contained" 
                  onClick={() => router.push('/login')}
                  sx={{ 
                    backgroundColor: "#e94560",
                    "&:hover": { backgroundColor: "#c03546" }
                  }}
                >
                  {isSignedIn ? "Request Security Clearance" : "Verify Identity"}
                </Button>
              </Grid>
            </Grid>
          </Card>
        </Container>
      </motion.div>
    </Box>
  );
};

// Project Details Dialog Component
const ProjectDetailsDialog = ({ open, project, onClose, onDelete, loading }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  if (!project) return null;
  
  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      fullWidth
      maxWidth="xs" // Changed from "sm" to "xs" to make it smaller
      fullScreen={false} // Changed from isMobile to false to prevent fullscreen on mobile
      sx={{
        '& .MuiDialog-paper': {
          borderRadius: 2,
          margin: isMobile ? '16px' : 'auto', // Add margins on mobile
          maxHeight: isMobile ? 'calc(100% - 32px)' : '80vh' // Limit height on mobile
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
        borderBottom: `1px solid ${theme.palette.divider}`,
        padding: '12px 16px' // Reduced padding
      }}>
        <Typography variant="subtitle1" component="div">
          Project Details
        </Typography>
        <IconButton edge="end" color="inherit" onClick={onClose} aria-label="close" size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers sx={{ padding: '16px', paddingBottom: '8px' }}>
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6" component="div" gutterBottom>
            {project.title}
          </Typography>
          <Chip 
            label={project.status} 
            color={project.status === "SUBMITTED" ? "success" : "warning"}
            size="small"
            sx={{ mb: 1 }}
          />
        </Box>
        
        <List dense disablePadding>
          <ListItem divider sx={{ py: 1 }}>
            <ListItemText 
              primary="Project ID" 
              secondary={project.id} 
              primaryTypographyProps={{ variant: 'body2' }}
              secondaryTypographyProps={{ variant: 'caption' }}
            />
          </ListItem>
          <ListItem divider sx={{ py: 1 }}>
            <ListItemText 
              primary="Project Leader" 
              secondary={project.leaderName} 
              primaryTypographyProps={{ variant: 'body2' }}
              secondaryTypographyProps={{ variant: 'caption' }}
            />
          </ListItem>
          <ListItem sx={{ py: 1 }}>
            <ListItemText 
              primary="Status" 
              secondary={project.status} 
              primaryTypographyProps={{ variant: 'body2' }}
              secondaryTypographyProps={{ variant: 'caption' }}
            />
          </ListItem>
        </List>
      </DialogContent>
      <DialogActions sx={{ 
        justifyContent: 'space-between',
        p: 2
      }}>
        <Button 
          onClick={() => { onClose(); window.location.href = `/admin/projects/${project.id}`; }}
          color="primary" 
          variant="outlined"
          size="small"
        >
          View Full Details
        </Button>
        <Button 
          onClick={(e) => { 
            e.stopPropagation(); 
            onDelete(project.id);
          }}
          color="error" 
          variant="contained"
          size="small"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <DeleteIcon />}
        >
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Confirmation Dialog for delete operations
const DeleteConfirmationDialog = ({ open, onClose, onConfirm, multiple, loading }) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Confirm Deletion</DialogTitle>
      <DialogContent>
        <DialogContentText>
          {multiple 
            ? "Are you sure you want to delete all selected projects? This action cannot be undone."
            : "Are you sure you want to delete this project? This action cannot be undone."}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Cancel
        </Button>
        <Button 
          onClick={onConfirm} 
          color="error" 
          variant="contained"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <DeleteIcon />}
        >
          {loading ? "Deleting..." : "Delete"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loadingProjectId, setLoadingProjectId] = useState(null);
  const [filter, setFilter] = useState({ leader: "", status: "", search: "" });
  const [toast, setToast] = useState({ open: false, message: "", severity: "success" });
  const [error, setError] = useState("");
  const [selectedProjects, setSelectedProjects] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [forbidden, setForbidden] = useState(false);
  const [adminChecked, setAdminChecked] = useState(false);
  
  // Mobile specific states
  const [detailsDialog, setDetailsDialog] = useState({ open: false, project: null });
  const [deleteDialog, setDeleteDialog] = useState({ open: false, multiple: false });
  const [mobileSelectionMode, setMobileSelectionMode] = useState(false);
  const [longPressTimer, setLongPressTimer] = useState(null);

  // Check if user has special access
  const hasSpecialAccess = session?.user?.email === "2023pietcsaaditya003@poornima.org";

  useEffect(() => {
    // Only proceed when authentication status is determined
    if (status === "loading") return;
    
    if (status === "authenticated") {
      checkAdminAndFetchProjects();
    } else {
      // User is not authenticated
      setInitialLoading(false);
      setAdminChecked(true);
    }
  }, [status]);

  const checkAdminAndFetchProjects = async () => {
    setInitialLoading(true);
    try {
      const response = await axios.get("/api/admin/projects", {
        headers: { Authorization: `Bearer ${session.user.id}` },
      });
      setProjects(response.data);
      setFilteredProjects(response.data);
      setAdminChecked(true);
    } catch (error) {
      if (error.response && error.response.status === 403) {
        setForbidden(true);
        setAdminChecked(true);
      } else {
        setError("Failed to fetch projects");
        console.error(error);
        setAdminChecked(true);
      }
    } finally {
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    const filtered = projects.filter(project =>
      (filter.leader ? project.leaderName.toLowerCase().includes(filter.leader.toLowerCase()) : true) &&
      (filter.status ? project.status.toLowerCase() === filter.status.toLowerCase() : true) &&
      (filter.search ? project.title.toLowerCase().includes(filter.search.toLowerCase()) || project.leaderName.toLowerCase().includes(filter.search.toLowerCase()) : true)
    );
    setFilteredProjects(filtered);
  }, [filter, projects]);
  
  // Clean up any hanging timers when component unmounts
  useEffect(() => {
    return () => {
      if (longPressTimer) {
        clearTimeout(longPressTimer);
      }
    };
  }, [longPressTimer]);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/api/admin/projects", {
        headers: { Authorization: `Bearer ${session.user.id}` },
      });
      setProjects(response.data);
      setFilteredProjects(response.data);
    } catch (error) {
      if (error.response && error.response.status === 403) {
        setForbidden(true);
      } else {
        setError("Failed to fetch projects");
        console.error(error);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProject = async (projectId) => {
    setLoadingProjectId(projectId);
    try {
      await axios.delete(`/api/admin/projects/${projectId}`, {
        headers: { Authorization: `Bearer ${session.user.id}` },
      });
      setToast({ open: true, message: "Project deleted successfully", severity: "success" });
      // Close the details dialog immediately after deletion
      setDetailsDialog({ open: false, project: null });
      // Refresh the projects list
      await fetchProjects();
    } catch (error) {
      if (error.response && error.response.status === 403) {
        setForbidden(true);
      } else {
        setToast({ open: true, message: "Failed to delete project", severity: "error" });
      }
    } finally {
      setLoadingProjectId(null);
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedProjects.length === 0) return;
    
    setLoading(true);
    try {
      await Promise.all(selectedProjects.map(id =>
        axios.delete(`/api/admin/projects/${id}`, {
          headers: { Authorization: `Bearer ${session.user.id}` },
        })
      ));
      setToast({ open: true, message: "Selected projects deleted successfully", severity: "success" });
      setSelectedProjects([]);
      setSelectAll(false);
      await fetchProjects();
      setMobileSelectionMode(false);
      // Close the delete confirmation dialog after deletion
      setDeleteDialog({ open: false, multiple: false });
    } catch (error) {
      if (error.response && error.response.status === 403) {
        setForbidden(true);
      } else {
        setToast({ open: true, message: "Failed to delete selected projects", severity: "error" });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSelectProject = (projectId) => {
    setSelectedProjects((prev) =>
      prev.includes(projectId) ? prev.filter(id => id !== projectId) : [...prev, projectId]
    );
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedProjects([]);
    } else {
      setSelectedProjects(filteredProjects.map(project => project.id));
    }
    setSelectAll(!selectAll);
  };

  const handleFilterChange = (e) => {
    setFilter({ ...filter, [e.target.name]: e.target.value });
  };
  
  // Mobile specific handlers
  const handleRowClick = (e, project) => {
    // If we're in selection mode on mobile, handle selection
    if (isMobile && mobileSelectionMode) {
      e.preventDefault();
      handleSelectProject(project.id);
      return;
    }
    
    // Otherwise, show the details
    if (isMobile) {
      setDetailsDialog({ open: true, project });
    }
  };
  
  const handleRowTouchStart = (e, project) => {
    if (!isMobile) return;
    
    const timer = setTimeout(() => {
      // Enter selection mode and select this project
      setMobileSelectionMode(true);
      handleSelectProject(project.id);
      
      // Provide haptic feedback if available
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
    }, 500); // Long press threshold (500ms)
    
    setLongPressTimer(timer);
  };
  
  const handleRowTouchEnd = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  };
  
  const handleRowTouchMove = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  };
  
  const handleExitSelectionMode = () => {
    setMobileSelectionMode(false);
    setSelectedProjects([]);
  };

  // Show loading skeleton until we've determined authentication and admin status
  if (initialLoading || !adminChecked) {
    return <LoadingSkeleton />;
  }

  // Render 403 page if access is forbidden
  if (forbidden) {
    return <Forbidden403 isSignedIn={status === "authenticated"} />;
  }

  // If user is not authenticated, show the 403 page for non-authenticated users
  if (status !== "authenticated") {
    return <Forbidden403 isSignedIn={false} />;
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      {loading && <LinearProgress color="primary" />}

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: isMobile ? "flex-start" : "center",
          flexDirection: isMobile ? "column" : "row",
          mb: 3 
        }}>
          <Typography variant="h4" fontWeight="bold" sx={{ mb: isMobile ? 2 : 0 }}>
            Admin Dashboard
          </Typography>
          
          {/* Special button for specific user */}
          {hasSpecialAccess && (
            <Tooltip title="Special User Access">
              <Button
                variant="contained"
                color="secondary"
                onClick={() => router.push('/admin/user-roles')}
                fullWidth={isMobile}
                sx={{ 
                  background: "linear-gradient(45deg, #6a11cb 0%, #2575fc 100%)",
                  boxShadow: "0 4px 20px rgba(106, 17, 203, 0.3)",
                  '&:hover': {
                    background: "linear-gradient(45deg, #5a00cb 0%, #1565fc 100%)",
                    boxShadow: "0 6px 25px rgba(106, 17, 203, 0.4)",
                  }
                }}
              >
                User Management
              </Button>
            </Tooltip>
          )}
        </Box>

        <Box sx={{ mb: 4 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="Search by Leader or Title"
                variant="outlined"
                value={filter.search}
                name="search"
                onChange={handleFilterChange}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select value={filter.status} label="Status" name="status" onChange={handleFilterChange}>
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="PARTIAL">Partial</MenuItem>
                  <MenuItem value="SUBMITTED">Submitted</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="Filter by Leader"
                variant="outlined"
                value={filter.leader}
                name="leader"
                onChange={handleFilterChange}
              />
            </Grid>
          </Grid>
        </Box>

        {error && (
          <Typography color="error" sx={{ mb: 3 }}>
            {error}
          </Typography>
        )}

        <Card sx={{ 
          borderRadius: 2,
          bgcolor: theme.palette.background.paper,
          color: theme.palette.text.primary
        }}>
          <CardContent>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              mb: 2
            }}>
              <Typography variant="h6" fontWeight="bold">
                Manage Projects
              </Typography>
              
              {/* Mobile selection mode actions */}
              {isMobile && mobileSelectionMode && (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography variant="body2" sx={{ mr: 1 }}>
                    {selectedProjects.length} selected
                  </Typography>
                  <Button 
                    size="small" 
                    onClick={handleExitSelectionMode}
                    sx={{ mr: 1 }}
                  >
                    Cancel
                  </Button>
                </Box>
              )}
            </Box>
            
            {/* Delete Selected button - show for desktop or mobile in selection mode */}
            {(!isMobile || (isMobile && mobileSelectionMode)) && (
              <Button
                variant="contained"
                color="error"
                onClick={() => {
                  if (selectedProjects.length > 0) {
                    setDeleteDialog({ open: true, multiple: true });
                  }
                }}
                disabled={selectedProjects.length === 0}
                sx={{ mb: 2 }}
              >
                Delete Selected ({selectedProjects.length})
              </Button>
            )}
            
            <TableContainer component={Paper} elevation={3} sx={{ 
              bgcolor: theme.palette.background.paper,
              overflowX: 'auto'
            }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: theme.palette.action.hover }}>
                    {!isMobile && (
                      <TableCell>
                        <Checkbox checked={selectAll} onChange={handleSelectAll} />
                      </TableCell>
                    )}
                    <TableCell><strong>S. No.</strong></TableCell>
                    <TableCell><strong>Project Title</strong></TableCell>
                    {!isMobile && <TableCell><strong>Leader</strong></TableCell>}
                    <TableCell><strong>Status</strong></TableCell>
                    {!isMobile && <TableCell><strong>Actions</strong></TableCell>}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredProjects.map((project, index) => (
                    <TableRow 
                      key={project.id} 
                      onClick={(e) => handleRowClick(e, project)}
                      onTouchStart={(e) => handleRowTouchStart(e, project)}
                      onTouchEnd={handleRowTouchEnd}
                      onTouchMove={handleRowTouchMove}
                      sx={{
                        cursor: 'pointer',
                        backgroundColor: selectedProjects.includes(project.id) 
                          ? theme.palette.action.selected 
                          : 'inherit',
                        '&:hover': {
                          backgroundColor: theme.palette.action.hover
                        }
                      }}
                    >
                      {!isMobile && (
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <Checkbox
                            checked={selectedProjects.includes(project.id)}
                            onChange={() => handleSelectProject(project.id)}
                          />
                        </TableCell>
                      )}
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{project.title}</TableCell>
                      {!isMobile && <TableCell>{project.leaderName}</TableCell>}
                      <TableCell>
                        <Chip 
                          label={project.status} 
                          size="small"
                          color={project.status === "SUBMITTED" ? "success" : "warning"}
                        />
                      </TableCell>
                      {!isMobile && (
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <Button 
                            variant="contained" 
                            color="primary" 
                            onClick={() => router.push(`/admin/projects/${project.id}`)} 
                            sx={{ mr: 1 }}
                          >
                            View Details
                          </Button>
                          <Button 
                            variant="contained" 
                            color="error" 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteProject(project.id);
                            }}
                            disabled={loadingProjectId === project.id}
                          >
                            {loadingProjectId === project.id ? 
                              <CircularProgress size={24} color="inherit" /> : 
                              "Delete"
                            }
                          </Button>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            
            {/* Empty state */}
            {filteredProjects.length === 0 && !loading && (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body1" color="text.secondary">
                  No projects found matching your filters.
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>
        
        {/* Project Details Dialog */}
        <ProjectDetailsDialog 
          open={detailsDialog.open}
          project={detailsDialog.project}
          onClose={() => setDetailsDialog({ open: false, project: null })}
          onDelete={handleDeleteProject}
          loading={loading || loadingProjectId === detailsDialog.project?.id}
        />
        
        <DeleteConfirmationDialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, multiple: false })}
        onConfirm={() => {
            if (deleteDialog.multiple) {
              handleDeleteSelected();
            } else {
              handleDeleteProject(deleteDialog.projectId);
            }
          }}
        multiple={deleteDialog.multiple}
        loading={loading}
        />
        <Snackbar
          open={toast.open}
          autoHideDuration={6000}
          onClose={() => setToast({ ...toast, open: false })}
        >
          <Alert onClose={() => setToast({ ...toast, open: false })} severity={toast.severity}>
            {toast.message}
          </Alert>
        </Snackbar>
      </Container>
    </motion.div>
  );
}
