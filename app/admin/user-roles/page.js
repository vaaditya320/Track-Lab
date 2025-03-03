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
                  {[1, 2, 3, 4, 5].map((item) => (
                    <TableCell key={item}>
                      <Skeleton variant="text" />
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {[1, 2, 3, 4].map((row) => (
                  <TableRow key={row}>
                    {[1, 2, 3, 4, 5].map((cell) => (
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

export default function AdminUsersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [filter, setFilter] = useState({ name: "", role: "", email: "" });
  const [toast, setToast] = useState({ open: false, message: "", severity: "success" });
  const [error, setError] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [forbidden, setForbidden] = useState(false);
  const [adminChecked, setAdminChecked] = useState(false);

  useEffect(() => {
    // Only proceed when authentication status is determined
    if (status === "loading") return;
    
    if (status === "authenticated") {
      checkAdminAndFetchUsers();
    } else {
      // User is not authenticated
      setInitialLoading(false);
      setAdminChecked(true);
    }
  }, [status]);

  const checkAdminAndFetchUsers = async () => {
    setInitialLoading(true);
    try {
      const response = await axios.get("/api/admin/users", {
        headers: { Authorization: `Bearer ${session?.user?.id}` },
      });
      setUsers(response.data);
      setFilteredUsers(response.data);
      setAdminChecked(true);
    } catch (error) {
      if (error.response && error.response.status === 403) {
        setForbidden(true);
        setAdminChecked(true);
      } else {
        setError("Failed to fetch users");
        console.error(error);
        setAdminChecked(true);
      }
    } finally {
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    const filtered = users.filter(user =>
      (filter.name ? user.name.toLowerCase().includes(filter.name.toLowerCase()) : true) &&
      (filter.role ? user.role.toLowerCase() === filter.role.toLowerCase() : true) &&
      (filter.email ? user.email.toLowerCase().includes(filter.email.toLowerCase()) : true)
    );
    setFilteredUsers(filtered);
  }, [filter, users]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/api/admin/users", {
        headers: { Authorization: `Bearer ${session?.user?.id}` },
      });
      setUsers(response.data);
      setFilteredUsers(response.data);
      setToast({ open: true, message: "Users refreshed successfully", severity: "success" });
    } catch (error) {
      if (error.response && error.response.status === 403) {
        setForbidden(true);
      } else {
        setError("Failed to fetch users");
        setToast({ open: true, message: "Failed to refresh users", severity: "error" });
        console.error(error);
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle Promote/Demote
  async function handleRoleChange(id, action) {
    setUpdatingId(id);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.user?.id}`
        },
        body: JSON.stringify({ id, action }),
      });
      
      if (!res.ok) throw new Error("Failed to update role");
      const updatedUser = await res.json();
      
      // Update state with new role
      setUsers(users.map(user => (user.id === id ? { ...user, role: updatedUser.role } : user)));
      setToast({ 
        open: true, 
        message: `User ${action === "PROMOTE" ? "promoted" : "demoted"} successfully`, 
        severity: "success" 
      });
    } catch (error) {
      console.error(error);
      setToast({ 
        open: true, 
        message: `Failed to ${action === "PROMOTE" ? "promote" : "demote"} user`, 
        severity: "error" 
      });
    } finally {
      setUpdatingId(null);
    }
  }

  const handleSelectUser = (userId) => {
    setSelectedUsers((prev) =>
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map(user => user.id));
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
          User Role Management
        </Typography>

        <Box sx={{ mb: 4 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="Search by Name"
                variant="outlined"
                value={filter.name}
                name="name"
                onChange={handleFilterChange}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth>
                <InputLabel>Role</InputLabel>
                <Select value={filter.role} label="Role" name="role" onChange={handleFilterChange}>
                  <MenuItem value="">All Roles</MenuItem>
                  <MenuItem value="ADMIN">Admin</MenuItem>
                  <MenuItem value="STUDENT">Student</MenuItem>
                  <MenuItem value="TEACHER">Teacher</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="Search by Email"
                variant="outlined"
                value={filter.email}
                name="email"
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
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" fontWeight="bold">
                Manage Users
              </Typography>
              
              <Button
                variant="contained"
                color="primary"
                onClick={fetchUsers}
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
                disabled={loading}
              >
                Refresh Users
              </Button>
            </Box>

            <TableContainer component={Paper} elevation={3}>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: "#eeeeee" }}>
                    <TableCell>
                      <Checkbox checked={selectAll} onChange={handleSelectAll} />
                    </TableCell>
                    <TableCell><strong>Name</strong></TableCell>
                    <TableCell><strong>Email</strong></TableCell>
                    <TableCell><strong>Role</strong></TableCell>
                    <TableCell align="center"><strong>Actions</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                        <Typography variant="body1" color="textSecondary">
                          No users found matching your filters
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedUsers.includes(user.id)}
                            onChange={() => handleSelectUser(user.id)}
                          />
                        </TableCell>
                        <TableCell>{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Box
                            sx={{
                              display: 'inline-block',
                              px: 1.5,
                              py: 0.5,
                              borderRadius: 1,
                              backgroundColor: 
                                user.role === "ADMIN" 
                                  ? "rgba(255, 99, 132, 0.15)" 
                                  : user.role === "TEACHER" 
                                    ? "rgba(54, 162, 235, 0.15)" 
                                    : "rgba(75, 192, 192, 0.15)",
                              color: 
                                user.role === "ADMIN" 
                                  ? "rgb(255, 99, 132)" 
                                  : user.role === "TEACHER" 
                                    ? "rgb(54, 162, 235)" 
                                    : "rgb(75, 192, 192)",
                              fontWeight: 'bold'
                            }}
                          >
                            {user.role}
                          </Box>
                        </TableCell>
                        <TableCell align="center">
                          {user.role === "STUDENT" ? (
                            <Button
                              variant="contained"
                              color="success"
                              size="small"
                              onClick={() => handleRoleChange(user.id, "PROMOTE")}
                              disabled={updatingId === user.id}
                              sx={{ mr: 1 }}
                            >
                              {updatingId === user.id ? <CircularProgress size={20} /> : "Promote"}
                            </Button>
                          ) : (
                            <Button
                              variant="contained"
                              color="warning"
                              size="small"
                              onClick={() => handleRoleChange(user.id, "DEMOTE")}
                              disabled={updatingId === user.id}
                              sx={{ mr: 1 }}
                            >
                              {updatingId === user.id ? <CircularProgress size={20} /> : "Demote"}
                            </Button>
                          )}
                          
                          <Button
                            variant="outlined"
                            color="primary"
                            size="small"
                            onClick={() => router.push(`/admin/users/${user.id}`)}
                          >
                            View Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
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