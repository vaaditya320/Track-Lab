'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { 
  Container, Typography, Box, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Paper, CircularProgress,
  TextField, FormControl, InputLabel, Select, MenuItem, Chip,
  IconButton, Tooltip, Card, CardContent, Grid, InputAdornment,
  Skeleton
} from '@mui/material';
import { motion } from 'framer-motion';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import RefreshIcon from '@mui/icons-material/Refresh';
import InfoIcon from '@mui/icons-material/Info';

// Forbidden403 component
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
        
        <Paper 
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
            ACCESS VIOLATION // CODE: RESTRICTED
          </Typography>
          
          <Typography variant="body1" sx={{ mb: 3, color: "white", textShadow: "0 0 8px #ffffff, 0 0 12px #ffffff" }}>
            {isSignedIn ? 
              "Your clearance level is insufficient to access this secure area. This incident has been logged." :
              "Authentication required. Please sign in to proceed with identity verification."
            }
          </Typography>
          
          <Typography variant="body2" sx={{ mb: 4, fontFamily: "monospace", color: "#4ecca3" }}>
            $ System.redirect("/home") initiating in {counter} seconds...
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
};

const LogTypeChip = ({ type }) => {
  const getColor = (type) => {
    switch (type) {
      case 'PROJECT_CREATION':
        return 'success';
      case 'PROJECT_DELETION':
        return 'error';
      case 'PROJECT_UPDATE':
        return 'info';
      case 'USER_MANAGEMENT':
        return 'warning';
      case 'SYSTEM':
        return 'default';
      default:
        return 'primary';
    }
  };

  return (
    <Chip 
      label={type.replace(/_/g, ' ')} 
      color={getColor(type)} 
      size="small"
      sx={{ fontWeight: 500 }}
    />
  );
};

const categorizeLog = (message) => {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('created project')) return 'PROJECT_CREATION';
  if (lowerMessage.includes('deleted project')) return 'PROJECT_DELETION';
  if (lowerMessage.includes('updated project')) return 'PROJECT_UPDATE';
  if (lowerMessage.includes('user role') || lowerMessage.includes('user management')) return 'USER_MANAGEMENT';
  if (lowerMessage.includes('system') || lowerMessage.includes('error')) return 'SYSTEM';
  
  return 'OTHER';
};

// LoadingSkeleton component
const LoadingSkeleton = () => {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Header Skeleton */}
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Skeleton variant="text" width={200} height={40} />
          <Skeleton variant="circular" width={40} height={40} />
        </Box>

        {/* Filters Card Skeleton */}
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              {[1, 2, 3].map((item) => (
                <Grid item xs={12} md={4} key={item}>
                  <Skeleton variant="rectangular" height={56} />
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>

        {/* Table Skeleton */}
        <TableContainer component={Paper} elevation={3}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><Skeleton variant="text" /></TableCell>
                <TableCell><Skeleton variant="text" /></TableCell>
                <TableCell><Skeleton variant="text" /></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {[1, 2, 3, 4, 5].map((row) => (
                <TableRow key={row}>
                  <TableCell>
                    <Skeleton variant="text" width={150} />
                  </TableCell>
                  <TableCell>
                    <Skeleton variant="rectangular" width={100} height={24} />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Skeleton variant="text" width="80%" />
                      <Skeleton variant="circular" width={24} height={24} />
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Container>
    </motion.div>
  );
};

export default function AdminLogs() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [forbidden, setForbidden] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    type: 'ALL',
    dateRange: 'ALL'
  });

  useEffect(() => {
    if (status === 'loading') return;

    if (status === 'unauthenticated') {
      setLoading(false);
      return;
    }

    fetchLogs();
  }, [session, status]);

  const fetchLogs = async () => {
    try {
      const response = await fetch('/api/admin/logs');
      if (response.status === 401 || response.status === 403) {
        setForbidden(true);
        setLoading(false);
        return;
      }
      if (!response.ok) {
        throw new Error('Failed to fetch logs');
      }
      const data = await response.json();
      const categorizedLogs = data.logs.map(log => ({
        ...log,
        type: log.type || categorizeLog(log.message)
      }));
      setLogs(categorizedLogs);
      setFilteredLogs(categorizedLogs);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let filtered = [...logs];

    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(log => 
        log.message.toLowerCase().includes(searchLower)
      );
    }

    // Apply type filter
    if (filters.type !== 'ALL') {
      filtered = filtered.filter(log => log.type === filters.type);
    }

    // Apply date range filter
    if (filters.dateRange !== 'ALL') {
      const now = new Date();
      
      switch (filters.dateRange) {
        case 'TODAY':
          filtered = filtered.filter(log => 
            new Date(log.timestamp).toDateString() === now.toDateString()
          );
          break;
        case 'WEEK':
          const weekAgo = new Date(now.setDate(now.getDate() - 7));
          filtered = filtered.filter(log => new Date(log.timestamp) >= weekAgo);
          break;
        case 'MONTH':
          const monthAgo = new Date(now.setMonth(now.getMonth() - 1));
          filtered = filtered.filter(log => new Date(log.timestamp) >= monthAgo);
          break;
      }
    }

    setFilteredLogs(filtered);
  }, [filters, logs]);

  if (status === 'loading' || loading) {
    return <LoadingSkeleton />;
  }

  if (forbidden || status === 'unauthenticated') {
    return <Forbidden403 isSignedIn={status === 'authenticated'} />;
  }

  if (error) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography color="error" variant="h6">{error}</Typography>
      </Box>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h4" fontWeight="bold">
            System Logs
          </Typography>
          <Tooltip title="Refresh Logs">
            <IconButton onClick={fetchLogs} color="primary">
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>

        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Search Logs"
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Log Type</InputLabel>
                  <Select
                    value={filters.type}
                    label="Log Type"
                    onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                    startAdornment={
                      <InputAdornment position="start">
                        <FilterListIcon />
                      </InputAdornment>
                    }
                  >
                    <MenuItem value="ALL">All Types</MenuItem>
                    <MenuItem value="PROJECT_CREATION">Project Creation</MenuItem>
                    <MenuItem value="PROJECT_DELETION">Project Deletion</MenuItem>
                    <MenuItem value="PROJECT_UPDATE">Project Updates</MenuItem>
                    <MenuItem value="USER_MANAGEMENT">User Management</MenuItem>
                    <MenuItem value="SYSTEM">System Events</MenuItem>
                    <MenuItem value="OTHER">Other Events</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Time Range</InputLabel>
                  <Select
                    value={filters.dateRange}
                    label="Time Range"
                    onChange={(e) => setFilters({ ...filters, dateRange: e.target.value })}
                  >
                    <MenuItem value="ALL">All Time</MenuItem>
                    <MenuItem value="TODAY">Today</MenuItem>
                    <MenuItem value="WEEK">Last 7 Days</MenuItem>
                    <MenuItem value="MONTH">Last 30 Days</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <TableContainer component={Paper} elevation={3}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: 'primary.light' }}>
                <TableCell><strong>Timestamp</strong></TableCell>
                <TableCell><strong>Type</strong></TableCell>
                <TableCell><strong>Message</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredLogs.map((log) => (
                <TableRow 
                  key={log.eventId}
                  sx={{ 
                    '&:hover': { 
                      backgroundColor: 'action.hover',
                      cursor: 'pointer'
                    }
                  }}
                >
                  <TableCell>
                    <Tooltip title={new Date(log.timestamp).toLocaleString()}>
                      <Typography variant="body2" color="text.secondary">
                        {new Date(log.timestamp).toLocaleString()}
                      </Typography>
                    </Tooltip>
                  </TableCell>
                  <TableCell>
                    <LogTypeChip type={log.type} />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2">
                        {log.message}
                      </Typography>
                      <Tooltip title="View Details">
                        <IconButton size="small">
                          <InfoIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
              {filteredLogs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} align="center" sx={{ py: 3 }}>
                    <Typography color="text.secondary">
                      No logs found matching your filters
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Container>
    </motion.div>
  );
} 