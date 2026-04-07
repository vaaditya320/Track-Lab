"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import axios from "axios";
import {
  Container, Typography, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Snackbar, Alert,
  CircularProgress, Box, Grid, Card, CardContent, TextField,
  MenuItem, Select, InputLabel, FormControl, LinearProgress,
  Skeleton, alpha, Dialog, DialogTitle, DialogContent, DialogActions,
  IconButton
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { motion } from "framer-motion";

const PAGE_SIZE = 20;
const ROLE_OPTIONS = ["STUDENT", "TEACHER", "ADMIN"];

const ROLE_UI = {
  STUDENT: { label: "Student", color: "#26a69a" },
  TEACHER: { label: "Teacher", color: "#42a5f5" },
  ADMIN: { label: "Admin", color: "#ef5350" },
};

function getRolePillStyles(theme, role) {
  const color = ROLE_UI[role]?.color || theme.palette.text.primary;
  return {
    px: 1.2,
    py: 0.35,
    borderRadius: 999,
    fontWeight: 700,
    fontSize: "0.78rem",
    letterSpacing: "0.04em",
    textTransform: "uppercase",
    color,
    border: `1px solid ${alpha(color, theme.palette.mode === "dark" ? 0.45 : 0.35)}`,
    backgroundColor: alpha(color, theme.palette.mode === "dark" ? 0.16 : 0.12),
  };
}

function buildUserListParams({ skip, debouncedSearch, debouncedEmail, filter }) {
  const params = new URLSearchParams();
  params.set("take", String(PAGE_SIZE));
  params.set("skip", String(skip));
  const q = debouncedSearch.trim();
  if (q.length >= 2) params.set("search", q);
  const em = debouncedEmail.trim();
  if (em.length >= 2) params.set("email", em);
  if (filter.role) params.set("role", filter.role);
  return params;
}

// LoadingSkeleton component
const LoadingSkeleton = () => {
  const theme = useTheme();
  
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
                <TableRow sx={{ backgroundColor: theme.palette.mode === 'dark' ? alpha(theme.palette.common.white, 0.05) : alpha(theme.palette.common.black, 0.05) }}>
                  {[1, 2, 3, 4].map((item) => (
                    <TableCell key={item}>
                      <Skeleton variant="text" />
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {[1, 2, 3, 4].map((row) => (
                  <TableRow key={row}>
                    {[1, 2, 3, 4].map((cell) => (
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

// User Details Dialog
const UserDetailsDialog = ({ open, handleClose, user, handleRoleChange, updatingId, router }) => {
  const theme = useTheme();

  if (!user) return null;

  const getRoleBadgeStyles = (role) => {
    const colors = {
      SUPER_ADMIN: {
        light: {
          bg: "rgba(255, 215, 0, 0.15)",
          text: "#FFD700"
        },
        dark: {
          bg: "rgba(255, 215, 0, 0.25)",
          text: "#FFE44D"
        }
      },
      ADMIN: {
        light: {
          bg: "rgba(255, 99, 132, 0.15)",
          text: "rgb(255, 99, 132)"
        },
        dark: {
          bg: "rgba(255, 99, 132, 0.25)",
          text: "rgb(255, 129, 152)"
        }
      },
      TEACHER: {
        light: {
          bg: "rgba(54, 162, 235, 0.15)",
          text: "rgb(54, 162, 235)"
        },
        dark: {
          bg: "rgba(54, 162, 235, 0.25)",
          text: "rgb(84, 182, 255)"
        }
      },
      STUDENT: {
        light: {
          bg: "rgba(75, 192, 192, 0.15)",
          text: "rgb(75, 192, 192)"
        },
        dark: {
          bg: "rgba(75, 192, 192, 0.25)",
          text: "rgb(105, 212, 212)"
        }
      }
    };
    
    const colorSet = theme.palette.mode === 'dark' ? colors[role].dark : colors[role].light;
    
    return {
      display: 'inline-block',
      px: 1.5,
      py: 0.5,
      borderRadius: 1,
      backgroundColor: colorSet.bg,
      color: colorSet.text,
      fontWeight: 'bold'
    };
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: {
          borderRadius: 2,
          bgcolor: theme.palette.background.paper
        }
      }}
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography component="span" variant="h6" fontWeight="bold">User Details</Typography>
        <IconButton onClick={handleClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" color="textSecondary" gutterBottom>
            Name
          </Typography>
          <Typography variant="body1" fontWeight="medium">
            {user.name}
          </Typography>
        </Box>
        
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" color="textSecondary" gutterBottom>
            Email
          </Typography>
          <Typography variant="body1">
            {user.email}
          </Typography>
        </Box>
        
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" color="textSecondary" gutterBottom>
            Role
          </Typography>
          <Box sx={getRoleBadgeStyles(user.role)}>
            {user.role}
          </Box>
        </Box>
      </DialogContent>
      <DialogActions sx={{ flexDirection: 'column', gap: 1, p: 2 }}>
        {user.role === "SUPER_ADMIN" ? (
          <Box sx={{ 
            width: '100%',
            p: 2,
            borderRadius: 2,
            background: theme.palette.mode === 'dark' 
              ? 'linear-gradient(45deg, rgba(255,215,0,0.1), rgba(255,215,0,0.05))'
              : 'linear-gradient(45deg, rgba(255,215,0,0.15), rgba(255,215,0,0.08))',
            border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,215,0,0.3)' : 'rgba(255,215,0,0.4)'}`,
            boxShadow: theme.palette.mode === 'dark'
              ? '0 0 20px rgba(255,215,0,0.1)'
              : '0 0 20px rgba(255,215,0,0.15)'
          }}>
            <Typography 
              variant="body1" 
              sx={{ 
                color: theme.palette.mode === 'dark' ? '#FFE44D' : '#FFD700',
                fontStyle: 'italic',
                fontWeight: 'bold',
                textAlign: 'center',
                letterSpacing: '0.5px',
                textTransform: 'uppercase',
                mb: 1
              }}
            >
              ⭐ Supreme Authority
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                color: theme.palette.mode === 'dark' ? 'rgba(255,228,77,0.8)' : 'rgba(255,215,0,0.8)',
                textAlign: 'center',
                fontStyle: 'italic'
              }}
            >
              This role represents the highest level of authority in the system and cannot be modified
            </Typography>
          </Box>
        ) : (
          <Box sx={{ width: "100%" }}>
            <Typography variant="subtitle2" color="textSecondary" sx={{ mb: 1 }}>
              Change Role
            </Typography>
            <FormControl fullWidth size="small">
              <InputLabel id="mobile-user-role-select">Assign Role</InputLabel>
              <Select
                labelId="mobile-user-role-select"
                value={user.role}
                label="Assign Role"
                onChange={(e) => handleRoleChange(user.id, e.target.value)}
                disabled={updatingId === user.id}
                renderValue={(value) => (
                  <Box component="span" sx={getRolePillStyles(theme, value)}>
                    {ROLE_UI[value]?.label || value}
                  </Box>
                )}
                sx={{
                  "& .MuiSelect-select": { display: "flex", alignItems: "center", py: 1.1 },
                  "& fieldset": {
                    borderColor: alpha(theme.palette.primary.main, theme.palette.mode === "dark" ? 0.45 : 0.3),
                  },
                }}
              >
                {ROLE_OPTIONS.map((role) => (
                  <MenuItem key={role} value={role} sx={{ py: 1 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.1 }}>
                      <Box
                        sx={{
                          width: 9,
                          height: 9,
                          borderRadius: "50%",
                          backgroundColor: ROLE_UI[role].color,
                          boxShadow: `0 0 0 3px ${alpha(ROLE_UI[role].color, 0.15)}`,
                        }}
                      />
                      <Typography fontWeight={600}>{ROLE_UI[role].label}</Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {updatingId === user.id && (
              <Box sx={{ display: "flex", justifyContent: "center", mt: 1 }}>
                <CircularProgress size={20} />
              </Box>
            )}
          </Box>
        )}
        
        <Button
          variant="outlined"
          color="primary"
          fullWidth
          onClick={() => {
            router.push(`/admin/users/${user.id}`);
            handleClose();
          }}
        >
          View Full Profile
        </Button>
      </DialogActions>
    </Dialog>
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
          ? "linear-gradient(135deg, #0a0a14 0%, #0a1029 50%, #071830 100%)"
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
              backgroundColor: alpha(theme.palette.background.paper, 0.1), 
              backdropFilter: "blur(10px)",
              border: `1px solid ${alpha(theme.palette.common.white, 0.2)}`,
              borderRadius: 4,
              boxShadow: "0 4px 30px rgba(0, 0, 0, 0.1)"
            }}
          >
            {/* Fix: Don't nest Typography variants that create different heading levels */}
            <Typography component="div" variant="h5" sx={{ mb: 2, color: "#e94560" }}>
              Access Denied
            </Typography>
            
            <Typography variant="body1" sx={{ 
              mb: 3, 
              color: theme.palette.common.white, 
              textShadow: "0 0 5px rgba(255, 255, 255, 0.5)",
              letterSpacing: "0.5px"
            }}>
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
                      backgroundColor: alpha(theme.palette.common.white, 0.1),
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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { data: session, status } = useSession();
  const router = useRouter();

  const [users, setUsers] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const firstAuthFetchDone = useRef(false);
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [debouncedEmail, setDebouncedEmail] = useState("");
  const [updatingId, setUpdatingId] = useState(null);
  const [filter, setFilter] = useState({ search: "", role: "", email: "" });
  const [toast, setToast] = useState({ open: false, message: "", severity: "success" });
  const [error, setError] = useState("");
  const [forbidden, setForbidden] = useState(false);
  const [adminChecked, setAdminChecked] = useState(false);
  
  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(filter.search), 350);
    return () => clearTimeout(t);
  }, [filter.search]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedEmail(filter.email), 350);
    return () => clearTimeout(t);
  }, [filter.email]);

  const fetchFirstPage = useCallback(async () => {
    if (!session?.user?.id) return;
    const params = buildUserListParams({
      skip: 0,
      debouncedSearch,
      debouncedEmail,
      filter,
    });
    const response = await axios.get(`/api/admin/users?${params}`, {
      headers: { Authorization: `Bearer ${session.user.id}` },
    });
    setUsers(response.data.items);
    setTotalCount(response.data.totalCount ?? response.data.items.length);
    setHasMore(response.data.hasMore);
  }, [session?.user?.id, debouncedSearch, debouncedEmail, filter.role]);

  useEffect(() => {
    if (status === "loading") return;

    if (status !== "authenticated" || !session?.user?.id) {
      firstAuthFetchDone.current = false;
      setUsers([]);
      setTotalCount(0);
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
        const unauthorized =
          error.response &&
          (error.response.status === 401 || error.response.status === 403);
        if (unauthorized) {
          setForbidden(true);
          setAdminChecked(true);
        } else {
          setError("Failed to fetch users");
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

  const fetchUsers = async () => {
    setLoading(true);
    try {
      await fetchFirstPage();
      setToast({ open: true, message: "Users refreshed successfully", severity: "success" });
    } catch (error) {
      const unauthorized =
        error.response &&
        (error.response.status === 401 || error.response.status === 403);
      if (unauthorized) {
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

  const loadMore = useCallback(async () => {
    if (!session?.user?.id || !hasMore || loadingMore || loading) return;
    setLoadingMore(true);
    try {
      const params = buildUserListParams({
        skip: users.length,
        debouncedSearch,
        debouncedEmail,
        filter,
      });
      const response = await axios.get(`/api/admin/users?${params}`, {
        headers: { Authorization: `Bearer ${session.user.id}` },
      });
      setUsers((prev) => [...prev, ...response.data.items]);
      setTotalCount(response.data.totalCount ?? users.length + response.data.items.length);
      setHasMore(response.data.hasMore);
    } catch (error) {
      const unauthorized =
        error.response &&
        (error.response.status === 401 || error.response.status === 403);
      if (unauthorized) {
        setForbidden(true);
      } else {
        setToast({ open: true, message: "Failed to load more users", severity: "error" });
      }
    } finally {
      setLoadingMore(false);
    }
  }, [
    session?.user?.id,
    hasMore,
    loadingMore,
    loading,
    users.length,
    debouncedSearch,
    debouncedEmail,
    filter,
  ]);

  // Handle Promote/Demote
  async function handleRoleChange(id, nextRole) {
    try {
      setUpdatingId(id);
      
      const currentUser = users.find(user => user.id === id);
      if (!currentUser) {
        throw new Error("User not found");
      }

      if (currentUser.role === "SUPER_ADMIN") {
        throw new Error("SUPER_ADMIN role cannot be changed");
      }

      if (!ROLE_OPTIONS.includes(nextRole)) {
        throw new Error("Invalid role");
      }

      if (currentUser.role === nextRole) {
        return;
      }

      await axios.put(`/api/admin/users`, { userId: id, role: nextRole });
      
      // Update users list
      const updatedUsers = users.map(user => 
        user.id === id ? { ...user, role: nextRole } : user
      );
      setUsers(updatedUsers);
      
      // Update selectedUser if it's the same user
      if (selectedUser && selectedUser.id === id) {
        setSelectedUser({ ...selectedUser, role: nextRole });
      }
      
      setToast({
        open: true,
        message: `User role updated to ${nextRole}`,
        severity: "success"
      });
    } catch (error) {
      console.error("Error updating user role:", error);
      setToast({
        open: true,
        message: "Failed to update user role. Please try again.",
        severity: "error"
      });
    } finally {
      setUpdatingId(null);
    }
  }

  const handleFilterChange = (e) => {
    setFilter({ ...filter, [e.target.name]: e.target.value });
  };

  // Handle row click for mobile view
  const handleRowClick = (user) => {
    if (isMobile) {
      setSelectedUser(user);
      setDialogOpen(true);
    }
  };

  // Close user details dialog
  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  // Get role badge color based on role and theme
  const getRoleBadgeStyles = (role) => {
    const colors = {
      SUPER_ADMIN: {
        light: {
          bg: "rgba(255, 215, 0, 0.15)",
          text: "#FFD700"
        },
        dark: {
          bg: "rgba(255, 215, 0, 0.25)",
          text: "#FFE44D"
        }
      },
      ADMIN: {
        light: {
          bg: "rgba(255, 99, 132, 0.15)",
          text: "rgb(255, 99, 132)"
        },
        dark: {
          bg: "rgba(255, 99, 132, 0.25)",
          text: "rgb(255, 129, 152)"
        }
      },
      TEACHER: {
        light: {
          bg: "rgba(54, 162, 235, 0.15)",
          text: "rgb(54, 162, 235)"
        },
        dark: {
          bg: "rgba(54, 162, 235, 0.25)",
          text: "rgb(84, 182, 255)"
        }
      },
      STUDENT: {
        light: {
          bg: "rgba(75, 192, 192, 0.15)",
          text: "rgb(75, 192, 192)"
        },
        dark: {
          bg: "rgba(75, 192, 192, 0.25)",
          text: "rgb(105, 212, 212)"
        }
      }
    };
    
    const colorSet = theme.palette.mode === 'dark' ? colors[role].dark : colors[role].light;
    
    return {
      display: 'inline-block',
      px: 1.5,
      py: 0.5,
      borderRadius: 1,
      backgroundColor: colorSet.bg,
      color: colorSet.text,
      fontWeight: 'bold'
    };
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
                label="Search by name or Reg ID"
                variant="outlined"
                value={filter.search}
                name="search"
                onChange={handleFilterChange}
                helperText={
                  filter.search.trim().length === 1
                    ? "Type at least 2 characters to search"
                    : undefined
                }
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth>
                <InputLabel>Role</InputLabel>
                <Select value={filter.role} label="Role" name="role" onChange={handleFilterChange}>
                  <MenuItem value="">All Roles</MenuItem>
                  <MenuItem value="ADMIN">Admin</MenuItem>
                  <MenuItem value="TEACHER">Teacher</MenuItem>
                  <MenuItem value="STUDENT">Student</MenuItem>
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
                helperText={
                  filter.email.trim().length === 1
                    ? "Type at least 2 characters to search"
                    : undefined
                }
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
              {/* Fix: Ensure we don't create nested heading levels */}
              <Typography component="div" variant="h6" fontWeight="bold">
                Manage Users
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Showing {users.length} of {totalCount} users
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
                  <TableRow sx={{ backgroundColor: theme.palette.mode === 'dark' ? alpha(theme.palette.common.white, 0.05) : alpha(theme.palette.common.black, 0.05) }}>
                    <TableCell width="10%"><strong>#</strong></TableCell>
                    <TableCell><strong>Name</strong></TableCell>
                    {!isMobile && <TableCell><strong>Email</strong></TableCell>}
                    <TableCell><strong>Role</strong></TableCell>
                    {!isMobile && <TableCell align="center"><strong>Actions</strong></TableCell>}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.length === 0 && !loading && !initialLoading ? (
                    <TableRow>
                      <TableCell colSpan={isMobile ? 3 : 5} align="center" sx={{ py: 3 }}>
                        <Typography variant="body1" color="textSecondary">
                          No users found matching your filters
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.map((user, index) => (
                      <TableRow 
                        key={user.id} 
                        onClick={() => handleRowClick(user)}
                        sx={{ 
                          cursor: isMobile ? 'pointer' : 'default',
                          '&:hover': { bgcolor: isMobile ? alpha(theme.palette.primary.main, 0.08) : 'inherit' }
                        }}
                      >
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>{user.name}</TableCell>
                        {!isMobile && <TableCell>{user.email}</TableCell>}
                        <TableCell>
                          <Box sx={getRoleBadgeStyles(user.role)}>
                            {user.role}
                          </Box>
                        </TableCell>
                        {!isMobile && (
                          <TableCell align="center">
                            {user.role === "SUPER_ADMIN" ? (
                              <Box sx={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: 1,
                                px: 2,
                                py: 1,
                                borderRadius: 1,
                                background: theme.palette.mode === 'dark' 
                                  ? 'linear-gradient(45deg, rgba(255,215,0,0.1), rgba(255,215,0,0.05))'
                                  : 'linear-gradient(45deg, rgba(255,215,0,0.15), rgba(255,215,0,0.08))',
                                border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,215,0,0.3)' : 'rgba(255,215,0,0.4)'}`,
                                boxShadow: theme.palette.mode === 'dark'
                                  ? '0 0 15px rgba(255,215,0,0.1)'
                                  : '0 0 15px rgba(255,215,0,0.15)'
                              }}>
                                <Typography 
                                  variant="body2" 
                                  sx={{ 
                                    color: theme.palette.mode === 'dark' ? '#FFE44D' : '#FFD700',
                                    fontStyle: 'italic',
                                    fontWeight: 'bold',
                                    letterSpacing: '0.5px',
                                    textTransform: 'uppercase',
                                    fontSize: '0.85rem'
                                  }}
                                >
                                  ⭐ Supreme Authority
                                </Typography>
                              </Box>
                            ) : (
                              <FormControl size="small" sx={{ minWidth: 170, mr: 1 }}>
                                <InputLabel id={`desktop-role-select-${user.id}`}>Role</InputLabel>
                                <Select
                                  labelId={`desktop-role-select-${user.id}`}
                                  value={user.role}
                                  label="Role"
                                  onClick={(e) => e.stopPropagation()}
                                  onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                  disabled={updatingId === user.id}
                                  renderValue={(value) => (
                                    <Box component="span" sx={getRolePillStyles(theme, value)}>
                                      {ROLE_UI[value]?.label || value}
                                    </Box>
                                  )}
                                  sx={{
                                    "& .MuiSelect-select": { display: "flex", alignItems: "center", py: 1 },
                                    "& fieldset": {
                                      borderColor: alpha(theme.palette.primary.main, theme.palette.mode === "dark" ? 0.45 : 0.3),
                                    },
                                  }}
                                >
                                  {ROLE_OPTIONS.map((role) => (
                                    <MenuItem key={role} value={role} sx={{ py: 1 }}>
                                      <Box sx={{ display: "flex", alignItems: "center", gap: 1.1 }}>
                                        <Box
                                          sx={{
                                            width: 9,
                                            height: 9,
                                            borderRadius: "50%",
                                            backgroundColor: ROLE_UI[role].color,
                                            boxShadow: `0 0 0 3px ${alpha(ROLE_UI[role].color, 0.15)}`,
                                          }}
                                        />
                                        <Typography fontWeight={600}>{ROLE_UI[role].label}</Typography>
                                      </Box>
                                    </MenuItem>
                                  ))}
                                </Select>
                              </FormControl>
                            )}
                            
                            <Button
                              variant="outlined"
                              color="primary"
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                router.push(`/admin/users/${user.id}`);
                              }}
                            >
                              View Details
                            </Button>
                          </TableCell>
                        )}
                      </TableRow>
                    ))
                  )}
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
          </CardContent>
        </Card>

        {/* User Details Dialog for Mobile */}
        <UserDetailsDialog
          open={dialogOpen}
          handleClose={handleCloseDialog}
          user={selectedUser}
          handleRoleChange={handleRoleChange}
          updatingId={updatingId}
          router={router}
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