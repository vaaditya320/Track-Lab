"use client";

import { 
  Box, 
  Container, 
  Typography, 
  Button, 
  Card, 
  CardContent,
  Grid,
  useTheme,
  Breadcrumbs,
  Link as MuiLink,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Snackbar,
  Tooltip
} from "@mui/material";
import { motion } from "framer-motion";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { isSuperAdmin } from "@/lib/isSuperAdmin";
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import HomeIcon from '@mui/icons-material/Home';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import PersonIcon from '@mui/icons-material/Person';

export default function OverlordManagementPage() {
  const theme = useTheme();
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [overlords, setOverlords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [deleteDialog, setDeleteDialog] = useState({ open: false, overlord: null });
  const [addDialog, setAddDialog] = useState(false);
  const [newOverlord, setNewOverlord] = useState({ name: '', email: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchOverlords = async () => {
      try {
        const response = await fetch('/api/superuser/overlords');
        if (!response.ok) {
          if (response.status === 401) {
            setError('Unauthorized access');
            return;
          }
          throw new Error('Failed to fetch overlords');
        }
        const data = await response.json();
        setOverlords(data);
      } catch (err) {
        console.error('Error fetching overlords:', err);
        setError('Failed to load overlords. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    // Only fetch if user is authenticated and is super admin
    if (status === "authenticated" && isSuperAdmin(session)) {
      fetchOverlords();
    } else if (status === "unauthenticated") {
      setLoading(false);
    }
  }, [status, session]);

  // Handle redirects and permissions after all hooks are called
  if (status === "loading") {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (status === "unauthenticated") {
    router.push('/api/auth/signin');
    return null;
  }

  if (!isSuperAdmin(session)) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">
          You don't have permission to access this page. Only SUPER_ADMIN users can access this page.
        </Alert>
      </Container>
    );
  }

  const handleAddOverlord = async () => {
    if (!newOverlord.name || !newOverlord.email) {
      setError('Please fill in all fields');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('/api/superuser/overlords', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newOverlord),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create overlord');
      }

      const createdOverlord = await response.json();
      setOverlords([createdOverlord, ...overlords]);
      setAddDialog(false);
      setNewOverlord({ name: '', email: '' });
      setSuccess('Overlord added successfully');
    } catch (err) {
      console.error('Error creating overlord:', err);
      setError(err.message || 'Failed to create overlord');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteOverlord = async () => {
    if (!deleteDialog.overlord) return;

    setSubmitting(true);
    try {
      const response = await fetch('/api/superuser/overlords', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: deleteDialog.overlord.id }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete overlord');
      }

      setOverlords(overlords.filter(o => o.id !== deleteDialog.overlord.id));
      setDeleteDialog({ open: false, overlord: null });
      setSuccess('Overlord deleted successfully');
    } catch (err) {
      console.error('Error deleting overlord:', err);
      setError(err.message || 'Failed to delete overlord');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 3 }} aria-label="breadcrumb">
        <MuiLink
          component={Link}
          href="/"
          sx={{
            display: 'flex',
            alignItems: 'center',
            textDecoration: 'none',
            color: 'text.secondary',
            '&:hover': { color: 'primary.main' }
          }}
        >
          <HomeIcon sx={{ mr: 0.5, fontSize: 20 }} />
          Home
        </MuiLink>
        <MuiLink
          component={Link}
          href="/admin"
          sx={{
            display: 'flex',
            alignItems: 'center',
            textDecoration: 'none',
            color: 'text.secondary',
            '&:hover': { color: 'primary.main' }
          }}
        >
          <AdminPanelSettingsIcon sx={{ mr: 0.5, fontSize: 20 }} />
          Admin
        </MuiLink>
        <Typography
          sx={{
            display: 'flex',
            alignItems: 'center',
            color: 'text.primary'
          }}
        >
          <PersonIcon sx={{ mr: 0.5, fontSize: 20 }} />
          Overlord Management
        </Typography>
      </Breadcrumbs>

      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Typography
            variant="h4"
            fontWeight="bold"
            sx={{
              background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 1
            }}
          >
            Overlord Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage users who can access the system without @poornima.org email
          </Typography>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setAddDialog(true)}
            sx={{
              borderRadius: 2,
              px: 3,
              py: 1.5,
              background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              '&:hover': {
                background: `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
              }
            }}
          >
            Add Overlord
          </Button>
        </motion.div>
      </Box>

      {/* Error/Success Messages */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Loading State */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        /* Overlords Table */
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card
            sx={{
              borderRadius: 3,
              background: `linear-gradient(135deg, ${theme.palette.background.paper}, ${theme.palette.primary.light}05)`,
              border: `1px solid ${theme.palette.divider}`,
            }}
          >
            <CardContent>
              {overlords.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                  <PersonIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2, opacity: 0.5 }} />
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    No Overlords Found
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Add your first overlord to get started
                  </Typography>
                  <Button
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={() => setAddDialog(true)}
                  >
                    Add Overlord
                  </Button>
                </Box>
              ) : (
                <TableContainer component={Paper} elevation={0} sx={{ background: 'transparent' }}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Email</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Created At</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {overlords.map((overlord, index) => (
                        <TableRow key={overlord.id}>
                          <TableCell>{overlord.name}</TableCell>
                          <TableCell>{overlord.email}</TableCell>
                          <TableCell>{formatDate(overlord.createdAt)}</TableCell>
                          <TableCell>
                            <Tooltip title="Delete Overlord">
                              <IconButton
                                color="error"
                                onClick={() => setDeleteDialog({ open: true, overlord })}
                                size="small"
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Add Overlord Dialog */}
      <Dialog
        open={addDialog}
        onClose={() => !submitting && setAddDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add New Overlord</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Name"
            fullWidth
            variant="outlined"
            value={newOverlord.name}
            onChange={(e) => setNewOverlord({ ...newOverlord, name: e.target.value })}
            sx={{ mb: 2, mt: 2 }}
          />
          <TextField
            margin="dense"
            label="Email"
            type="email"
            fullWidth
            variant="outlined"
            value={newOverlord.email}
            onChange={(e) => setNewOverlord({ ...newOverlord, email: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddDialog(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button
            onClick={handleAddOverlord}
            variant="contained"
            disabled={submitting}
          >
            {submitting ? 'Adding...' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => !submitting && setDeleteDialog({ open: false, overlord: null })}
      >
        <DialogTitle>Delete Overlord</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete <strong>{deleteDialog.overlord?.name}</strong> ({deleteDialog.overlord?.email})?
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, overlord: null })} disabled={submitting}>
            Cancel
          </Button>
          <Button
            onClick={handleDeleteOverlord}
            color="error"
            variant="contained"
            disabled={submitting}
          >
            {submitting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success Snackbar */}
      <Snackbar
        open={!!success}
        autoHideDuration={6000}
        onClose={() => setSuccess('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={() => setSuccess('')} severity="success" sx={{ width: '100%' }}>
          {success}
        </Alert>
      </Snackbar>
    </Container>
  );
}
