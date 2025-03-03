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
  Skeleton
} from "@mui/material";
import { motion } from "framer-motion";

// LoadingSkeleton component
const LoadingSkeleton = () => {
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
                <TableRow sx={{ backgroundColor: "#eeeeee" }}>
                  {[1, 2, 3, 4, 5, 6].map((item) => (
                    <TableCell key={item}>
                      <Skeleton variant="text" />
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {[1, 2, 3, 4].map((row) => (
                  <TableRow key={row}>
                    {[1, 2, 3, 4, 5, 6].map((cell) => (
                      <TableCell key={cell}>
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
        background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "white",
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
              background: "rgba(255, 255, 255, 0.05)",
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
              border: "1px solid rgba(255, 255, 255, 0.2)",
              borderRadius: 4,
              boxShadow: "0 4px 30px rgba(0, 0, 0, 0.1)"
            }}
          >
            <Typography variant="h5" sx={{ mb: 2, color: "#e94560" }}>
              Access Denied
            </Typography>
            
            <Typography variant="body1" sx={{ mb: 3 }}>
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
                    color: "white", 
                    borderColor: "white",
                    "&:hover": { 
                      backgroundColor: "rgba(255, 255, 255, 0.1)",
                      borderColor: "#4ecca3" 
                    }
                  }}
                >
                  Return to Safety
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
                  {isSignedIn ? "Request Access" : "Sign In"}
                </Button>
              </Grid>
            </Grid>
          </Card>
        </Container>
      </motion.div>
    </Box>
  );
};

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

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
      fetchProjects();
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

    try {
      await Promise.all(selectedProjects.map(id =>
        axios.delete(`/api/admin/projects/${id}`, {
          headers: { Authorization: `Bearer ${session.user.id}` },
        })
      ));
      setToast({ open: true, message: "Selected projects deleted successfully", severity: "success" });
      setSelectedProjects([]);
      setSelectAll(false);
      fetchProjects();
    } catch (error) {
      if (error.response && error.response.status === 403) {
        setForbidden(true);
      } else {
        setToast({ open: true, message: "Failed to delete selected projects", severity: "error" });
      }
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
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Admin Dashboard
        </Typography>

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

        <Card sx={{ borderRadius: 2 }}>
          <CardContent>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Manage Projects
            </Typography>
            <Button
              variant="contained"
              color="error"
              onClick={handleDeleteSelected}
              disabled={selectedProjects.length === 0}
              sx={{ mb: 2 }}
            >
              Delete Selected
            </Button>
            <TableContainer component={Paper} elevation={3}>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: "#eeeeee" }}>
                    <TableCell>
                      <Checkbox checked={selectAll} onChange={handleSelectAll} />
                    </TableCell>
                    <TableCell><strong>S. No.</strong></TableCell>
                    <TableCell><strong>Project Title</strong></TableCell>
                    <TableCell><strong>Leader</strong></TableCell>
                    <TableCell><strong>Status</strong></TableCell>
                    <TableCell><strong>Actions</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredProjects.map((project, index) => (
                    <TableRow key={project.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedProjects.includes(project.id)}
                          onChange={() => handleSelectProject(project.id)}
                        />
                      </TableCell>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{project.title}</TableCell>
                      <TableCell>{project.leaderName}</TableCell>
                      <TableCell>{project.status}</TableCell>
                      <TableCell>
                        <Button variant="contained" color="primary" onClick={() => router.push(`/admin/projects/${project.id}`)} sx={{ mr: 1 }}>
                          View Details
                        </Button>
                        <Button variant="contained" color="error" onClick={() => handleDeleteProject(project.id)} disabled={loadingProjectId === project.id}>
                          {loadingProjectId === project.id ? <CircularProgress size={24} color="inherit" /> : "Delete"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>

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