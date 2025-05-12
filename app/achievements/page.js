"use client";

import { useState, useEffect, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  CircularProgress,
  useTheme,
  useMediaQuery,
  IconButton,
  Dialog,
  DialogContent,
  TextField,
  InputAdornment,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import SchoolIcon from "@mui/icons-material/School";
import PersonIcon from "@mui/icons-material/Person";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import Skeleton from "@mui/material/Skeleton";

export default function AchievementsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedAchievement, setSelectedAchievement] = useState(null);
  const [dialogImage, setDialogImage] = useState(null);
  const [dialogLoading, setDialogLoading] = useState(false);
  const [dialogError, setDialogError] = useState("");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
      return;
    }
    if (status === "authenticated") {
      fetchAchievements();
    }
  }, [status]);

  const fetchAchievements = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await axios.get("/api/achievements");
      setAchievements(response.data);
    } catch (error) {
      setError("Failed to fetch achievements. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleAchievementClick = async (achievement) => {
    setSelectedAchievement(achievement);
    setDialogImage(null);
    setDialogError("");
    if (achievement.imageUrl) {
      setDialogLoading(true);
      try {
        const res = await axios.get(`/api/achievements/get-image?key=${encodeURIComponent(achievement.imageUrl)}`);
        setDialogImage(res.data.base64);
      } catch (err) {
        setDialogError("Could not load image.");
      } finally {
        setDialogLoading(false);
      }
    }
  };

  const handleCloseDialog = () => {
    setSelectedAchievement(null);
    setDialogImage(null);
    setDialogError("");
    setDialogLoading(false);
  };

  const handleTypeFilter = (event, newType) => {
    if (newType) setTypeFilter(newType);
  };

  // Filtered achievements (memoized)
  const filteredAchievements = useMemo(() => {
    return achievements.filter((ach) => {
      const matchesType =
        typeFilter === "ALL" || ach.type === typeFilter;
      const matchesSearch =
        ach.title.toLowerCase().includes(search.toLowerCase()) ||
        ach.user.name.toLowerCase().includes(search.toLowerCase());
      return matchesType && matchesSearch;
    });
  }, [achievements, search, typeFilter]);

  // Skeleton loader for cards
  const AchievementCardSkeleton = () => (
    <Card
      sx={{
        height: 240,
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 4,
        overflow: 'hidden',
        boxShadow: theme.palette.mode === 'dark' ? 8 : 2,
        p: 2,
      }}
    >
      <Skeleton variant="text" width="60%" height={32} sx={{ mb: 1 }} />
      <Skeleton variant="rectangular" width="100%" height={40} sx={{ mb: 2, borderRadius: 2 }} />
      <Skeleton variant="text" width="40%" height={24} sx={{ mt: 'auto' }} />
    </Card>
  );

  if (status === "loading" || loading) {
    return (
      <Box sx={{ p: 3, maxWidth: 1200, mx: "auto", textAlign: "center" }}>
        <Grid container spacing={3}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Grid item xs={12} sm={6} md={4} key={i}>
              <AchievementCardSkeleton />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  if (status === "unauthenticated") {
    return null;
  }

  return (
    <Box sx={{ p: { xs: 0.5, md: 3 }, maxWidth: 1200, mx: "auto", bgcolor: theme.palette.background.default }}>
      {/* Header Section */}
      <Box
        sx={{
          mb: { xs: 2, md: 4 },
          p: { xs: 1, md: 4 },
          borderRadius: 4,
          background: theme.palette.background.paper,
          boxShadow: theme.palette.mode === "dark"
            ? "0 4px 32px rgba(30, 41, 59, 0.4)"
            : "0 4px 32px rgba(30, 41, 59, 0.08)",
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: { xs: 'flex-start', md: 'center' },
          justifyContent: 'space-between',
          gap: { xs: 2, md: 4 },
        }}
      >
        <Box sx={{ width: { xs: '100%', md: 'auto' } }}>
          <Typography
            variant={isMobile ? "h4" : "h3"}
            sx={{
              fontWeight: 900,
              letterSpacing: -1,
              color: theme.palette.primary.main,
              mb: 1,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              fontSize: { xs: 28, md: 36 },
            }}
          >
            <EmojiEventsIcon fontSize={isMobile ? "medium" : "large"} sx={{ color: theme.palette.secondary.main }} />
            Achievements
          </Typography>
          <Typography
            variant={isMobile ? "body1" : "h6"}
            sx={{
              color: theme.palette.text.secondary,
              fontWeight: 400,
              maxWidth: 600,
              fontSize: { xs: 15, md: 18 },
            }}
          >
            Showcasing <b>Idea Labs</b> student and faculty outside participations and achievements. Discover the inspiring stories and successes of our vibrant community!
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => router.push("/achievements/create")}
          sx={{
            borderRadius: 3,
            textTransform: 'none',
            fontWeight: 700,
            fontSize: { xs: 15, md: 18 },
            px: { xs: 2, md: 4 },
            py: { xs: 1, md: 1.5 },
            mt: { xs: 2, md: 0 },
            width: { xs: '100%', md: 'auto' },
            background: theme.palette.mode === 'dark'
              ? "linear-gradient(45deg, #1565C0 0%, #0D47A1 100%)"
              : "linear-gradient(45deg, #1976D2 0%, #1565C0 100%)",
            boxShadow: theme.palette.mode === 'dark'
              ? "0 4px 20px rgba(13, 71, 161, 0.3)"
              : "0 4px 20px rgba(25, 118, 210, 0.3)",
            '&:hover': {
              background: theme.palette.mode === 'dark'
                ? "linear-gradient(45deg, #0D47A1 0%, #01579B 100%)"
                : "linear-gradient(45deg, #1565C0 0%, #0D47A1 100%)",
              boxShadow: theme.palette.mode === 'dark'
                ? "0 6px 25px rgba(13, 71, 161, 0.4)"
                : "0 6px 25px rgba(25, 118, 210, 0.4)",
            },
          }}
        >
          Add Achievement
        </Button>
      </Box>

      {/* Filters Section */}
      <Box
        sx={{
          mb: { xs: 2, md: 4 },
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: { xs: 'stretch', md: 'center' },
          gap: 2,
          px: { xs: 0, md: 2 },
        }}
      >
        <TextField
          variant="outlined"
          placeholder="Search by name or title..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            sx: { borderRadius: 3, bgcolor: theme.palette.background.paper },
          }}
          sx={{ flex: 1, minWidth: 180, fontSize: { xs: 14, md: 16 } }}
        />
        <ToggleButtonGroup
          value={typeFilter}
          exclusive
          onChange={handleTypeFilter}
          sx={{
            bgcolor: 'transparent',
            borderRadius: '999px',
            boxShadow: theme.palette.mode === 'dark' ? 4 : 2,
            overflow: 'hidden',
            border: 'none',
            width: { xs: '100%', md: 'auto' },
            '.MuiToggleButton-root': {
              border: 'none',
              borderRadius: '999px !important',
              px: { xs: 2, md: 4 },
              py: { xs: 1, md: 1.5 },
              fontWeight: 700,
              fontSize: { xs: 15, md: 18 },
              color: theme.palette.text.secondary,
              background: 'transparent',
              transition: 'background 0.2s, color 0.2s',
              '&.Mui-selected': {
                background: theme.palette.primary.main,
                color: '#fff',
                boxShadow: theme.shadows[2],
              },
              '&:not(.Mui-selected):hover': {
                background: theme.palette.action.hover,
              },
            },
          }}
        >
          <ToggleButton value="ALL">
            All
          </ToggleButton>
          <ToggleButton value="STUDENT">
            <SchoolIcon sx={{ mr: 1 }} /> Student
          </ToggleButton>
          <ToggleButton value="FACULTY">
            <PersonIcon sx={{ mr: 1 }} /> Faculty
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* Achievements List */}
      <AnimatePresence mode="wait">
        {filteredAchievements.length === 0 ? (
          <motion.div
            key="empty-state"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Box sx={{ textAlign: 'center', py: { xs: 4, md: 8 } }}>
              <Typography variant="h6" color="text.secondary" fontWeight={600}>
                No achievements yet.
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Try adjusting your filters or check back later!
              </Typography>
            </Box>
          </motion.div>
        ) : (
          <Grid container spacing={{ xs: 2, md: 3 }}>
            {filteredAchievements.map((achievement) => (
              <Grid item xs={12} sm={6} md={4} key={achievement.id}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4 }}
                >
                  <Card
                    sx={{
                      height: { xs: 200, sm: 220, md: 240 },
                      display: 'flex',
                      flexDirection: 'column',
                      borderRadius: 4,
                      overflow: 'hidden',
                      boxShadow: theme.palette.mode === 'dark' ? 8 : 2,
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      '&:hover': {
                        transform: 'translateY(-6px) scale(1.03)',
                        boxShadow: theme.shadows[12],
                        borderColor: theme.palette.primary.main,
                      },
                      cursor: 'pointer',
                      background: theme.palette.background.paper,
                    }}
                    onClick={() => handleAchievementClick(achievement)}
                  >
                    <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', height: '100%', pb: '8px !important', px: { xs: 2, md: 3 } }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                        <Typography variant="h6" component="h2" fontWeight={800} gutterBottom sx={{ fontSize: { xs: 16, md: 20 } }}>
                          {achievement.title}
                        </Typography>
                        <Chip
                          label={achievement.type}
                          size="small"
                          color={achievement.type === "STUDENT" ? "primary" : "secondary"}
                          sx={{ ml: 1, fontWeight: 700, letterSpacing: 1, fontSize: { xs: 12, md: 14 } }}
                        />
                      </Box>
                      <Typography variant="body2" color="text.secondary" paragraph sx={{ fontWeight: 500, flexGrow: 1, fontSize: { xs: 13, md: 15 } }}>
                        {achievement.description && achievement.description.length > 80
                          ? `${achievement.description.slice(0, 80)}...`
                          : achievement.description}
                      </Typography>
                      <Box sx={{ mt: 'auto', display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                        <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ fontSize: { xs: 11, md: 13 } }}>
                          By {achievement.user.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: 11, md: 13 } }}>
                          • {new Date(achievement.createdAt).toLocaleDateString()}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        )}
      </AnimatePresence>

      {/* Dialog for Achievement Details */}
      <Dialog
        open={!!selectedAchievement}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            p: 0,
            background: theme.palette.background.paper,
          },
        }}
      >
        <DialogContent sx={{ p: { xs: 1, md: 4 }, position: 'relative' }}>
          <IconButton
            onClick={handleCloseDialog}
            sx={{
              position: 'absolute',
              right: 16,
              top: 16,
              color: theme.palette.mode === 'dark' ? '#fff' : '#333',
              bgcolor: 'rgba(0,0,0,0.08)',
              '&:hover': {
                bgcolor: 'rgba(0,0,0,0.18)',
              },
              zIndex: 2,
            }}
          >
            <CloseIcon />
          </IconButton>
          {selectedAchievement && (
            <>
              <Typography variant="h4" fontWeight={900} gutterBottom sx={{ letterSpacing: -1, color: theme.palette.primary.main, fontSize: { xs: 20, md: 28 } }}>
                {selectedAchievement.title}
              </Typography>
              <Chip
                label={selectedAchievement.type}
                size="medium"
                color={selectedAchievement.type === "STUDENT" ? "primary" : "secondary"}
                sx={{ mb: 2, fontWeight: 700, fontSize: { xs: 13, md: 16 }, px: 2, py: 1 }}
              />
              <Typography variant="body1" paragraph sx={{ fontSize: { xs: 15, md: 18 }, fontWeight: 500, color: theme.palette.text.primary }}>
                {selectedAchievement.description}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontWeight: 600, fontSize: { xs: 12, md: 15 } }}>
                By {selectedAchievement.user.name} • {new Date(selectedAchievement.createdAt).toLocaleDateString()}
              </Typography>
              {dialogLoading && <CircularProgress sx={{ display: 'block', mx: 'auto', my: 2 }} />}
              {dialogError && <Typography color="error">{dialogError}</Typography>}
              {dialogImage && (
                <Box sx={{ textAlign: 'center', mt: 2 }}>
                  <img
                    src={dialogImage}
                    alt={selectedAchievement.title}
                    style={{
                      maxWidth: '100%',
                      maxHeight: 350,
                      borderRadius: 12,
                      boxShadow: theme.shadows[6],
                    }}
                  />
                </Box>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
} 