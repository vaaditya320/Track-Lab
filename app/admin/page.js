"use client";

import { useEffect, useState, useCallback, useRef } from "react";
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
  SwipeableDrawer, Badge, InputAdornment
} from "@mui/material";
import { motion } from "framer-motion";
import CloseIcon from '@mui/icons-material/Close';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import DeleteIcon from '@mui/icons-material/Delete';
import InfoIcon from '@mui/icons-material/Info';
import AssessmentIcon from '@mui/icons-material/Assessment';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import StarIcon from '@mui/icons-material/Star';
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import { isSuperAdmin } from "@/lib/isSuperAdmin";

const PAGE_SIZE = 20;

function buildProjectListParams({ skip, debouncedSearch, filter }) {
  const params = new URLSearchParams();
  params.set("take", String(PAGE_SIZE));
  params.set("skip", String(skip));
  const q = debouncedSearch.trim();
  if (q.length >= 2) params.set("search", q);
  if (filter.status) params.set("status", filter.status);
  if (filter.batch) params.set("batch", filter.batch);
  if (filter.session) params.set("session", filter.session);
  return params;
}

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
const ProjectDetailsDialog = ({ open, project, onClose, onRequestDelete, loading }) => {
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
            onRequestDelete(project);
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
const DeleteConfirmationDialog = ({
  open,
  onClose,
  onConfirm,
  multiple,
  projectTitle,
  loading,
}) => {
  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      maxWidth="xs"
      fullWidth
      sx={{
        "& .MuiBackdrop-root": { backdropFilter: "blur(4px)" },
      }}
      PaperProps={{
        sx: (theme) => ({
          borderRadius: 3,
          boxShadow: theme.shadows[8],
        }),
      }}
    >
      <DialogTitle component="div" sx={{ fontWeight: 700, pb: 1 }}>
        {multiple ? "Delete selected projects?" : "Delete Project?"}
      </DialogTitle>
      <DialogContent>
        <DialogContentText component="div" sx={{ color: "text.secondary" }}>
          {multiple ? (
            "Are you sure you want to delete all selected projects? This action cannot be undone."
          ) : (
            <>
              Are you sure you want to delete the project{" "}
              <Box component="span" sx={{ fontWeight: 700, color: "text.primary" }}>
                {projectTitle || "this project"}
              </Box>
              ? This action cannot be undone.
            </>
          )}
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
        <Button onClick={onClose} color="primary" disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={onConfirm}
          color="error"
          variant="contained"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <DeleteIcon />}
          sx={{ borderRadius: 999 }}
        >
          {loading ? "Deleting…" : "Delete"}
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
  const [totalCount, setTotalCount] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const firstAuthFetchDone = useRef(false);
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [loadingProjectId, setLoadingProjectId] = useState(null);
  const [appliedFilter, setAppliedFilter] = useState({ status: "", search: "", batch: "", session: "" });
  const [draftFilter, setDraftFilter] = useState({ status: "", batch: "", session: "" });
  const [toast, setToast] = useState({ open: false, message: "", severity: "success" });
  const [error, setError] = useState("");
  const [selectedProjects, setSelectedProjects] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [forbidden, setForbidden] = useState(false);
  const [adminChecked, setAdminChecked] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  
  // Mobile specific states
  const [detailsDialog, setDetailsDialog] = useState({ open: false, project: null });
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    multiple: false,
    projectId: null,
    projectTitle: null,
  });
  const [mobileSelectionMode, setMobileSelectionMode] = useState(false);
  const [longPressTimer, setLongPressTimer] = useState(null);

  // Check if user has special access
  const hasSpecialAccess = isSuperAdmin(session);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(appliedFilter.search), 350);
    return () => clearTimeout(t);
  }, [appliedFilter.search]);

  const fetchFirstPage = useCallback(async () => {
    if (!session?.user?.id) return;
    const params = buildProjectListParams({
      skip: 0,
      debouncedSearch,
      filter: appliedFilter,
    });
    const response = await axios.get(`/api/admin/projects?${params}`, {
      headers: { Authorization: `Bearer ${session.user.id}` },
    });
    setProjects(response.data.items);
    setHasMore(response.data.hasMore);
    setTotalCount(response.data.totalCount ?? response.data.items.length ?? 0);
    setSelectAll(false);
    setSelectedProjects([]);
  }, [session?.user?.id, debouncedSearch, appliedFilter.status, appliedFilter.batch, appliedFilter.session]);

  useEffect(() => {
    if (status === "loading") return;

    if (status !== "authenticated" || !session?.user?.id) {
      firstAuthFetchDone.current = false;
      setProjects([]);
      setHasMore(false);
      setInitialLoading(false);
      setAdminChecked(true);
      return;
    }

    let cancelled = false;

    (async () => {
      if (firstAuthFetchDone.current) setLoading(true);
      else setInitialLoading(true);
      setError("");
      try {
        await fetchFirstPage();
        if (cancelled) return;
        setForbidden(false);
        setAdminChecked(true);
        firstAuthFetchDone.current = true;
      } catch (error) {
        if (cancelled) return;
        if (error.response && error.response.status === 403) {
          setForbidden(true);
          setAdminChecked(true);
        } else {
          setError("Failed to fetch projects");
          console.error(error);
          setAdminChecked(true);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
          setInitialLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [status, session?.user?.id, fetchFirstPage]);
  
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
      await fetchFirstPage();
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

  const loadMore = useCallback(async () => {
    if (!session?.user?.id || !hasMore || loadingMore || loading) return;
    setLoadingMore(true);
    try {
      const params = buildProjectListParams({
        skip: projects.length,
        debouncedSearch,
        filter: appliedFilter,
      });
      const response = await axios.get(`/api/admin/projects?${params}`, {
        headers: { Authorization: `Bearer ${session.user.id}` },
      });
      setProjects((prev) => [...prev, ...response.data.items]);
      setHasMore(response.data.hasMore);
      setTotalCount(response.data.totalCount ?? 0);
    } catch (error) {
      if (error.response && error.response.status === 403) {
        setForbidden(true);
      } else {
        setToast({ open: true, message: "Failed to load more projects", severity: "error" });
      }
    } finally {
      setLoadingMore(false);
    }
  }, [
    session?.user?.id,
    hasMore,
    loadingMore,
    loading,
    projects.length,
    debouncedSearch,
    appliedFilter,
  ]);

  const handleDeleteProject = async (projectId) => {
    setLoadingProjectId(projectId);
    try {
      await axios.delete(`/api/admin/projects/${projectId}`, {
        headers: { Authorization: `Bearer ${session.user.id}` },
      });
      setToast({ open: true, message: "Project deleted successfully", severity: "success" });
      setDetailsDialog({ open: false, project: null });
      setDeleteDialog({ open: false, multiple: false, projectId: null, projectTitle: null });
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
      setDeleteDialog({ open: false, multiple: false, projectId: null, projectTitle: null });
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
      setSelectedProjects(projects.map((project) => project.id));
    }
    setSelectAll(!selectAll);
  };

  const handleFilterChange = (e) => {
    setDraftFilter((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const clearSearch = () => setAppliedFilter((prev) => ({ ...prev, search: "" }));

  const resetAllFilters = () => {
    setAppliedFilter({ status: "", search: "", batch: "", session: "" });
    setDraftFilter({ status: "", batch: "", session: "" });
  };

  const applyDrawerFilters = () => {
    setAppliedFilter((prev) => ({
      ...prev,
      status: draftFilter.status,
      batch: draftFilter.batch,
      session: draftFilter.session,
    }));
    setFiltersOpen(false);
  };

  const openFilters = () => {
    setDraftFilter({
      status: appliedFilter.status,
      batch: appliedFilter.batch,
      session: appliedFilter.session,
    });
    setFiltersOpen(true);
  };

  const activeFilterCount =
    (appliedFilter.status ? 1 : 0) + (appliedFilter.batch ? 1 : 0) + (appliedFilter.session ? 1 : 0);
  
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
          
           {/* Desktop: Horizontal layout */}
           <Box sx={{ 
             display: { xs: 'none', sm: 'flex' }, 
             gap: 2, 
             flexWrap: 'wrap',
             justifyContent: 'flex-start'
           }}>
             {/* Special button for specific user */}
             {hasSpecialAccess && (
               <Tooltip title="Special User Access">
                 <Button
                   variant="contained"
                   color="secondary"
                   onClick={() => router.push('/admin/user-roles')}
                   sx={{ 
                     flex: '0 1 auto',
                     background: "linear-gradient(45deg, #6a11cb 0%, #2575fc 100%)",
                     boxShadow: "0 4px 20px rgba(106, 17, 203, 0.3)",
                     '&:hover': {
                       background: "linear-gradient(45deg, #5a00cb 0%, #1565fc 100%)",
                       boxShadow: "0 6px 25px rgba(106, 17, 203, 0.4)",
                     }
                   }}
                   startIcon={<AssessmentIcon />}
                 >
                   User Management
                 </Button>
               </Tooltip>
             )}
             
             <Button
               variant="contained"
               color="info"
               onClick={() => router.push('/admin/logs')}
               sx={{
                 flex: '0 1 auto',
                 background: "linear-gradient(45deg, #00BCD4 0%, #0097A7 100%)",
                 boxShadow: "0 4px 20px rgba(0, 188, 212, 0.3)",
                 '&:hover': {
                   background: "linear-gradient(45deg, #0097A7 0%, #006064 100%)",
                   boxShadow: "0 6px 25px rgba(0, 188, 212, 0.4)",
                 }
               }}
               startIcon={<AssessmentIcon />}
             >
               System Logs
             </Button>

             <Button
               variant="contained"
               color="warning"
               onClick={() => router.push('/admin/achievements')}
               sx={{
                 flex: '0 1 auto',
                 background: "linear-gradient(45deg, #FF9800 0%, #F57C00 100%)",
                 boxShadow: "0 4px 20px rgba(255, 152, 0, 0.3)",
                 '&:hover': {
                   background: "linear-gradient(45deg, #F57C00 0%, #EF6C00 100%)",
                   boxShadow: "0 6px 25px rgba(255, 152, 0, 0.4)",
                 }
               }}
               startIcon={<EmojiEventsIcon />}
             >
               Achievements
             </Button>

             <Button
               variant="contained"
               color="primary"
               onClick={() => router.push('/admin/idealab/projects')}
               sx={{
                 flex: '0 1 auto',
                 background: "linear-gradient(45deg, #9C27B0 0%, #673AB7 100%)",
                 boxShadow: "0 4px 20px rgba(156, 39, 176, 0.3)",
                 '&:hover': {
                   background: "linear-gradient(45deg, #8E24AA 0%, #5E35B1 100%)",
                   boxShadow: "0 6px 25px rgba(156, 39, 176, 0.4)",
                 }
               }}
               startIcon={<StarIcon />}
             >
               Star Projects
             </Button>
           </Box>

           {/* Mobile: 2x2 Grid layout */}
           <Grid container spacing={2} sx={{ display: { xs: 'flex', sm: 'none' } }}>
             {/* Special button for specific user */}
             {hasSpecialAccess && (
               <Grid item xs={6}>
                 <Tooltip title="Special User Access">
                   <Button
                     variant="contained"
                     color="secondary"
                     onClick={() => router.push('/admin/user-roles')}
                     fullWidth
                     sx={{ 
                       height: 80,
                       py: 2,
                       px: 1,
                       fontSize: '0.875rem',
                       background: "linear-gradient(45deg, #6a11cb 0%, #2575fc 100%)",
                       boxShadow: "0 4px 20px rgba(106, 17, 203, 0.3)",
                       '&:hover': {
                         background: "linear-gradient(45deg, #5a00cb 0%, #1565fc 100%)",
                         boxShadow: "0 6px 25px rgba(106, 17, 203, 0.4)",
                       }
                     }}
                     startIcon={<AssessmentIcon />}
                   >
                     User Management
                   </Button>
                 </Tooltip>
               </Grid>
             )}
             
             <Grid item xs={hasSpecialAccess ? 6 : 6}>
               <Button
                 variant="contained"
                 color="info"
                 onClick={() => router.push('/admin/logs')}
                 fullWidth
                 sx={{
                   height: 80,
                   py: 2,
                   px: 1,
                   fontSize: '0.875rem',
                   background: "linear-gradient(45deg, #00BCD4 0%, #0097A7 100%)",
                   boxShadow: "0 4px 20px rgba(0, 188, 212, 0.3)",
                   '&:hover': {
                     background: "linear-gradient(45deg, #0097A7 0%, #006064 100%)",
                     boxShadow: "0 6px 25px rgba(0, 188, 212, 0.4)",
                   }
                 }}
                 startIcon={<AssessmentIcon />}
               >
                 System Logs
               </Button>
             </Grid>

             <Grid item xs={6}>
               <Button
                 variant="contained"
                 color="warning"
                 onClick={() => router.push('/admin/achievements')}
                 fullWidth
                 sx={{
                   height: 80,
                   py: 2,
                   px: 1,
                   fontSize: '0.875rem',
                   background: "linear-gradient(45deg, #FF9800 0%, #F57C00 100%)",
                   boxShadow: "0 4px 20px rgba(255, 152, 0, 0.3)",
                   '&:hover': {
                     background: "linear-gradient(45deg, #F57C00 0%, #EF6C00 100%)",
                     boxShadow: "0 6px 25px rgba(255, 152, 0, 0.4)",
                   }
                 }}
                 startIcon={<EmojiEventsIcon />}
               >
                 Achievements
               </Button>
             </Grid>

             <Grid item xs={6}>
               <Button
                 variant="contained"
                 color="primary"
                 onClick={() => router.push('/admin/idealab/projects')}
                 fullWidth
                 sx={{
                   height: 80,
                   py: 2,
                   px: 1,
                   fontSize: '0.875rem',
                   background: "linear-gradient(45deg, #9C27B0 0%, #673AB7 100%)",
                   boxShadow: "0 4px 20px rgba(156, 39, 176, 0.3)",
                   '&:hover': {
                     background: "linear-gradient(45deg, #8E24AA 0%, #5E35B1 100%)",
                     boxShadow: "0 6px 25px rgba(156, 39, 176, 0.4)",
                   }
                 }}
                 startIcon={<StarIcon />}
               >
                 Star Projects
               </Button>
             </Grid>
           </Grid>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Paper
            elevation={3}
            sx={{
              p: 2,
              borderRadius: 3,
              bgcolor: theme.palette.background.paper,
            }}
          >
            <Box
              sx={{
                display: "flex",
                gap: 1,
                flexDirection: { xs: "column", sm: "row" },
                alignItems: { xs: "stretch", sm: "center" },
              }}
            >
              <TextField
                fullWidth
                label="Search (name / project title / regid)"
                placeholder="Type at least 2 characters…"
                variant="outlined"
                value={appliedFilter.search}
                name="search"
                onChange={(e) =>
                  setAppliedFilter((prev) => ({ ...prev, search: e.target.value }))
                }
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                        {appliedFilter.search ? (
                          <IconButton
                            aria-label="Clear search"
                            onClick={clearSearch}
                            edge="end"
                            size="small"
                          >
                            <ClearIcon fontSize="small" />
                          </IconButton>
                        ) : null}
                        <Tooltip title="Filters">
                          <IconButton
                            aria-label="Open filters"
                            onClick={openFilters}
                            edge="end"
                          >
                            <Badge
                              color="primary"
                              badgeContent={activeFilterCount}
                              invisible={activeFilterCount === 0}
                            >
                              <FilterAltIcon />
                            </Badge>
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </InputAdornment>
                  ),
                }}
                helperText={
                  appliedFilter.search.trim().length === 1
                    ? "Type at least 2 characters to search"
                    : activeFilterCount > 0
                      ? "Filters are active"
                      : " "
                }
              />
            </Box>

            {(appliedFilter.status || appliedFilter.batch || appliedFilter.session) && (
              <Box sx={{ mt: 1, display: "flex", flexWrap: "wrap", gap: 1 }}>
                {appliedFilter.status && (
                  <Chip
                    label={`Status: ${appliedFilter.status}`}
                    onDelete={() => {
                      setAppliedFilter((p) => ({ ...p, status: "" }));
                      setDraftFilter((p) => ({ ...p, status: "" }));
                    }}
                    size="small"
                    variant="outlined"
                  />
                )}
                {appliedFilter.batch && (
                  <Chip
                    label={`Batch: ${appliedFilter.batch}`}
                    onDelete={() => {
                      setAppliedFilter((p) => ({ ...p, batch: "" }));
                      setDraftFilter((p) => ({ ...p, batch: "" }));
                    }}
                    size="small"
                    variant="outlined"
                  />
                )}
                {appliedFilter.session && (
                  <Chip
                    label={`Session: ${appliedFilter.session === "2025-2026-sem1" ? "2025-2026 (Sem 1)" : "2025-2026 (Sem 2)"}`}
                    onDelete={() => {
                      setAppliedFilter((p) => ({ ...p, session: "" }));
                      setDraftFilter((p) => ({ ...p, session: "" }));
                    }}
                    size="small"
                    variant="outlined"
                  />
                )}
                <Chip
                  label="Reset"
                  onClick={resetAllFilters}
                  size="small"
                  color="default"
                  variant="filled"
                />
              </Box>
            )}
          </Paper>
        </Box>

        <SwipeableDrawer
          anchor={isMobile ? "bottom" : "right"}
          open={filtersOpen}
          onClose={() => setFiltersOpen(false)}
          onOpen={() => setFiltersOpen(true)}
          disableSwipeToOpen={!isMobile}
          PaperProps={{
            sx: {
              borderTopLeftRadius: isMobile ? 16 : 0,
              borderTopRightRadius: isMobile ? 16 : 0,
              width: isMobile ? "100%" : 360,
              p: 2,
            },
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
            <Typography variant="h6" fontWeight={800}>
              Filters
            </Typography>
            <IconButton aria-label="Close filters" onClick={() => setFiltersOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
          <Divider sx={{ mb: 2 }} />

          <Grid container spacing={2}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select value={draftFilter.status} label="Status" name="status" onChange={handleFilterChange}>
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="PARTIAL">Partial</MenuItem>
                  <MenuItem value="SUBMITTED">Submitted</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Batch</InputLabel>
                <Select value={draftFilter.batch} label="Batch" name="batch" onChange={handleFilterChange}>
                  <MenuItem value="">All Batches</MenuItem>
                  <MenuItem value="A1">A1</MenuItem>
                  <MenuItem value="A2">A2</MenuItem>
                  <MenuItem value="A3">A3</MenuItem>
                  <MenuItem value="B1">B1</MenuItem>
                  <MenuItem value="B2">B2</MenuItem>
                  <MenuItem value="B3">B3</MenuItem>
                  <MenuItem value="C1">C1</MenuItem>
                  <MenuItem value="C2">C2</MenuItem>
                  <MenuItem value="C3">C3</MenuItem>
                  <MenuItem value="D1">D1</MenuItem>
                  <MenuItem value="D2">D2</MenuItem>
                  <MenuItem value="D3">D3</MenuItem>
                  <MenuItem value="E1">E1</MenuItem>
                  <MenuItem value="E2">E2</MenuItem>
                  <MenuItem value="E3">E3</MenuItem>
                  <MenuItem value="F1">F1</MenuItem>
                  <MenuItem value="F2">F2</MenuItem>
                  <MenuItem value="F3">F3</MenuItem>
                  <MenuItem value="G1">G1</MenuItem>
                  <MenuItem value="G2">G2</MenuItem>
                  <MenuItem value="G3">G3</MenuItem>
                  <MenuItem value="H1">H1</MenuItem>
                  <MenuItem value="H2">H2</MenuItem>
                  <MenuItem value="H3">H3</MenuItem>
                  <MenuItem value="I1">I1</MenuItem>
                  <MenuItem value="I2">I2</MenuItem>
                  <MenuItem value="I3">I3</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Session</InputLabel>
                <Select value={draftFilter.session} label="Session" name="session" onChange={handleFilterChange}>
                  <MenuItem value="">All sessions</MenuItem>
                  <MenuItem value="2025-2026-sem1">2025-2026 (Sem 1)</MenuItem>
                  <MenuItem value="2025-2026-sem2">2025-2026 (Sem 2)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          <Box sx={{ display: "flex", gap: 1, mt: 3 }}>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => setDraftFilter({ status: "", batch: "", session: "" })}
            >
              Reset
            </Button>
            <Button fullWidth variant="contained" onClick={applyDrawerFilters}>
              Apply
            </Button>
          </Box>
        </SwipeableDrawer>

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
              flexWrap: 'wrap',
              gap: 1.5,
              mb: 2
            }}>
              <Typography variant="h6" fontWeight="bold">
                Manage Projects
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 'auto' }}>
                <Chip
                  label={`Total: ${totalCount}`}
                  color="primary"
                  variant="outlined"
                  size="small"
                />
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
            </Box>
            
            {/* Delete Selected button - show for desktop or mobile in selection mode */}
            {(!isMobile || (isMobile && mobileSelectionMode)) && (
              <Button
                variant="contained"
                color="error"
                onClick={() => {
                  if (selectedProjects.length > 0) {
                    setDeleteDialog({
                      open: true,
                      multiple: true,
                      projectId: null,
                      projectTitle: null,
                    });
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
                  {projects.map((project, index) => (
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
                              setDeleteDialog({
                                open: true,
                                multiple: false,
                                projectId: project.id,
                                projectTitle: project.title,
                              });
                            }}
                            disabled={
                              Boolean(loadingProjectId) ||
                              (deleteDialog.open && deleteDialog.projectId === project.id)
                            }
                          >
                            Delete
                          </Button>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {hasMore && (
              <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
                <Button
                  variant="outlined"
                  onClick={loadMore}
                  disabled={loadingMore || loading}
                  startIcon={loadingMore ? <CircularProgress size={18} /> : null}
                >
                  {loadingMore ? "Loading…" : "Load more"}
                </Button>
              </Box>
            )}
            
            {/* Empty state */}
            {projects.length === 0 && !loading && !initialLoading && (
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
          onRequestDelete={(proj) => {
            setDetailsDialog({ open: false, project: null });
            setDeleteDialog({
              open: true,
              multiple: false,
              projectId: proj.id,
              projectTitle: proj.title,
            });
          }}
          loading={loading || loadingProjectId === detailsDialog.project?.id}
        />
        
        <DeleteConfirmationDialog
          open={deleteDialog.open}
          onClose={() =>
            setDeleteDialog({
              open: false,
              multiple: false,
              projectId: null,
              projectTitle: null,
            })
          }
          onConfirm={() => {
            if (deleteDialog.multiple) {
              handleDeleteSelected();
            } else if (deleteDialog.projectId) {
              handleDeleteProject(deleteDialog.projectId);
            }
          }}
          multiple={deleteDialog.multiple}
          projectTitle={deleteDialog.projectTitle}
          loading={
            deleteDialog.multiple
              ? loading
              : loadingProjectId === deleteDialog.projectId
          }
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