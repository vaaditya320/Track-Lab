"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  useTheme,
  useMediaQuery,
  IconButton,
  TextField,
  InputAdornment,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import CloseIcon from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search";
import Skeleton from "@mui/material/Skeleton";

export default function AdminAchievementsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [achievements, setAchievements] = useState([]);
  const [filteredAchievements, setFilteredAchievements] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteId, setDeleteId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  useEffect(() => {
    if (status === "loading") return;
    if (status !== "authenticated" || session?.user?.role !== "ADMIN") {
      router.replace("/");
      return;
    }
    fetchAchievements();
    // eslint-disable-next-line
  }, [status]);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredAchievements(achievements);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = achievements.filter(ach => 
      ach.title.toLowerCase().includes(query) || 
      ach.user.name.toLowerCase().includes(query)
    );
    setFilteredAchievements(filtered);
  }, [searchQuery, achievements]);

  const fetchAchievements = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/achievements");
      if (!res.ok) throw new Error("Failed to fetch achievements");
      const data = await res.json();
      setAchievements(data);
      setFilteredAchievements(data);
    } catch (e) {
      setError("Could not load achievements.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/admin/achievements/${deleteId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      setSnackbar({ open: true, message: "Achievement deleted.", severity: "success" });
      setAchievements(achievements.filter(a => a.id !== deleteId));
      setFilteredAchievements(filteredAchievements.filter(a => a.id !== deleteId));
      setDeleteId(null);
    } catch (e) {
      setSnackbar({ open: true, message: "Failed to delete achievement.", severity: "error" });
    } finally {
      setDeleteLoading(false);
    }
  };

  // Skeleton loader for cards
  const AchievementCardSkeleton = () => (
    <Card sx={{ borderRadius: 3, boxShadow: theme.shadows[2], bgcolor: theme.palette.background.paper, minHeight: 180 }}>
      <CardContent>
        <Skeleton variant="text" width="60%" height={32} sx={{ mb: 1 }} />
        <Skeleton variant="rectangular" width="100%" height={40} sx={{ mb: 2, borderRadius: 2 }} />
        <Skeleton variant="text" width="40%" height={24} sx={{ mt: 'auto' }} />
        <Skeleton variant="rectangular" width={80} height={36} sx={{ mt: 2, borderRadius: 2 }} />
      </CardContent>
    </Card>
  );

  if (status === "loading" || loading) {
    return (
      <Box sx={{ p: 4, textAlign: "center" }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }, gap: 3 }}>
          {[1,2,3,4,5,6].map(i => <AchievementCardSkeleton key={i} />)}
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 1, md: 3 }, maxWidth: 1200, mx: "auto" }}>
      <Box sx={{ mb: 4, display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <EmojiEventsIcon color="primary" sx={{ fontSize: 36 }} />
          <Typography variant="h4" fontWeight={900} color="primary.main">
            Manage Achievements
          </Typography>
        </Box>
        
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search by title or uploader name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          }}
          sx={{
            maxWidth: 600,
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              backgroundColor: theme.palette.background.paper,
              boxShadow: theme.shadows[1],
              '&:hover': {
                boxShadow: theme.shadows[2],
              },
            },
          }}
        />
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
      
      {!loading && filteredAchievements.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6" color="text.secondary">
            No achievements found matching your search.
          </Typography>
        </Box>
      )}

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }, gap: 3 }}>
        {filteredAchievements.map(ach => (
          <Card key={ach.id} sx={{ borderRadius: 3, boxShadow: theme.shadows[2], bgcolor: theme.palette.background.paper, transition: 'transform 0.2s, box-shadow 0.2s', '&:hover': { transform: 'translateY(-4px) scale(1.02)', boxShadow: theme.shadows[6] } }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                <Typography variant="h6" fontWeight={800} gutterBottom>{ach.title}</Typography>
                <Chip label={ach.type} size="small" color={ach.type === "STUDENT" ? "primary" : "secondary"} sx={{ fontWeight: 700 }} />
              </Box>
              <Typography variant="body2" color="text.secondary" paragraph>
                {ach.description}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                By {ach.user.name} • {new Date(ach.createdAt).toLocaleDateString()}
              </Typography>
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={() => setDeleteId(ach.id)}
                  disabled={deleteLoading}
                >
                  Delete
                </Button>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>
      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteId} onClose={() => setDeleteId(null)}>
        <DialogTitle>Delete Achievement?</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this achievement? This action cannot be undone.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteId(null)} disabled={deleteLoading}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained" disabled={deleteLoading}>
            {deleteLoading ? <CircularProgress size={20} /> : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
      {/* Snackbar for feedback */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
} 