"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Box,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  CircularProgress,
  useTheme,
  useMediaQuery,
  Card,
  CardContent,
  IconButton,
  InputAdornment,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { motion } from "framer-motion";

export default function CreateAchievementPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("");
  const [photo, setPhoto] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (status === "loading") {
    return (
      <Box sx={{ p: 3, maxWidth: 800, mx: "auto", textAlign: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (status === "unauthenticated") {
    router.push("/auth/signin");
    return null;
  }

  const handlePhotoChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("type", type);
      if (photo) {
        formData.append("image", photo);
      }

      await fetch("/api/achievements/create", {
        method: "POST",
        body: formData,
      });

      router.push("/achievements");
    } catch (error) {
      setError("Failed to create achievement. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: { xs: 1, md: 3 }, maxWidth: 700, mx: "auto", bgcolor: theme.palette.background.default }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Box sx={{ mb: 3 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => router.push("/achievements")}
            sx={{ mb: 2, fontWeight: 700, borderRadius: 2, px: 2, py: 1, bgcolor: theme.palette.background.paper, color: theme.palette.text.primary, boxShadow: 1, '&:hover': { bgcolor: theme.palette.background.paper, boxShadow: 2 } }}
          >
            Back to Achievements
          </Button>
          <Typography
            variant={isMobile ? "h4" : "h3"}
            fontWeight={900}
            sx={{
              color: theme.palette.primary.main,
              mb: 1,
              letterSpacing: -1,
              fontSize: { xs: 28, md: 36 },
            }}
          >
            Add New Achievement
          </Typography>
          <Typography
            variant={isMobile ? "body1" : "h6"}
            sx={{ color: theme.palette.text.secondary, maxWidth: 600, mb: 2, fontWeight: 400, fontSize: { xs: 15, md: 18 } }}
          >
            Share your or your team's proudest moments! Fill in the details below to showcase your achievement to the Idea Labs community.
          </Typography>
        </Box>

        <Card
          elevation={2}
          sx={{
            borderRadius: 2,
            background: theme.palette.background.paper,
            boxShadow: theme.shadows[2],
            p: { xs: 2, md: 4 },
            maxWidth: 700,
            mx: 'auto',
          }}
        >
          <CardContent sx={{ p: 0 }}>
            {error && (
              <Typography color="error" sx={{ mb: 3 }}>
                {error}
              </Typography>
            )}
            <form onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                sx={{ mb: 3 }}
                InputProps={{
                  sx: { fontWeight: 600, fontSize: { xs: 15, md: 17 }, bgcolor: theme.palette.background.default, color: theme.palette.text.primary },
                }}
              />

              <TextField
                fullWidth
                label="Summary / Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                multiline
                rows={4}
                sx={{ mb: 3 }}
                InputProps={{
                  sx: { fontWeight: 500, fontSize: { xs: 14, md: 16 }, bgcolor: theme.palette.background.default, color: theme.palette.text.primary },
                }}
              />

              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel>Type</InputLabel>
                <Select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  required
                  label="Type"
                  sx={{ fontWeight: 600, fontSize: { xs: 15, md: 17 }, bgcolor: theme.palette.background.default, color: theme.palette.text.primary }}
                >
                  <MenuItem value="STUDENT">Student</MenuItem>
                  <MenuItem value="FACULTY">Faculty</MenuItem>
                </Select>
              </FormControl>

              <Box
                sx={{
                  border: `2px dashed ${theme.palette.primary.light}`,
                  borderRadius: 2,
                  p: 3,
                  textAlign: "center",
                  mb: 3,
                  cursor: "pointer",
                  position: "relative",
                  height: { xs: 160, md: 200 },
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  background: theme.palette.background.default,
                  transition: 'border-color 0.2s',
                  '&:hover': {
                    borderColor: theme.palette.primary.main,
                  },
                }}
                component="label"
              >
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  style={{ display: "none" }}
                />
                {previewUrl ? (
                  <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
                    <img
                      src={previewUrl}
                      alt="Preview"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        borderRadius: 8,
                        boxShadow: theme.shadows[2],
                      }}
                    />
                    <Box
                      sx={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        p: 1,
                        background: 'rgba(0,0,0,0.6)',
                        color: 'white',
                        borderBottomLeftRadius: 8,
                        borderBottomRightRadius: 8,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 1,
                      }}
                    >
                      <CheckCircleIcon sx={{ fontSize: 18, color: theme.palette.success.light, mr: 1 }} />
                      <Typography variant="body2">{photo?.name}</Typography>
                    </Box>
                  </Box>
                ) : (
                  <>
                    <AddPhotoAlternateIcon sx={{ fontSize: 48, color: theme.palette.primary.light, mb: 1 }} />
                    <Typography variant="body1" gutterBottom sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
                      Drag and drop your achievement photo here
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      or click to browse files
                    </Typography>
                  </>
                )}
              </Box>

              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={loading}
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 700,
                  fontSize: { xs: 16, md: 18 },
                  py: { xs: 1, md: 1.5 },
                  background: theme.palette.primary.main,
                  color: theme.palette.primary.contrastText,
                  boxShadow: theme.shadows[2],
                  '&:hover': {
                    background: theme.palette.primary.dark,
                    color: theme.palette.primary.contrastText,
                    boxShadow: theme.shadows[3],
                  },
                }}
              >
                {loading ? <CircularProgress size={24} /> : "Create Achievement"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </Box>
  );
} 