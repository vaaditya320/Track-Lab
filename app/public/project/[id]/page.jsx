"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Divider,
  Grid,
  Paper,
  Typography,
  Alert,
  useTheme,
} from "@mui/material";
import { motion } from "framer-motion";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import GroupIcon from "@mui/icons-material/Group";
import BuildIcon from "@mui/icons-material/Build";
import PersonIcon from "@mui/icons-material/Person";

export default function PublicProjectPage() {
  const theme = useTheme();
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/public/project/${id}`);
        const data = await res.json().catch(() => ({}));
        if (cancelled) return;
        if (!res.ok) {
          setError(data.error || "Could not load this project.");
          setProject(null);
          return;
        }
        setProject(data);
      } catch {
        if (!cancelled) setError("Could not load this project.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "50vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !project) {
    return (
      <Container maxWidth="sm" sx={{ py: 6 }}>
        <Alert severity="warning" sx={{ mb: 2 }}>
          {error || "Project not found."}
        </Alert>
        <Button component={Link} href="/" variant="contained" startIcon={<ArrowBackIcon />}>
          Back to home
        </Button>
      </Container>
    );
  }

  const componentsList = (project.components || "")
    .split(",")
    .map((c) => c.trim())
    .filter(Boolean);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
    >
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Button
          component={Link}
          href="/"
          variant="text"
          startIcon={<ArrowBackIcon />}
          sx={{ mb: 2 }}
        >
          Home
        </Button>

        <Card elevation={3} sx={{ borderRadius: 3, overflow: "hidden" }}>
          <CardContent sx={{ p: { xs: 2, sm: 4 } }}>
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                justifyContent: "space-between",
                alignItems: { xs: "flex-start", sm: "flex-start" },
                gap: 2,
                mb: 2,
              }}
            >
              <Typography variant="h4" component="h1" fontWeight="bold">
                {project.title}
              </Typography>
              <Chip
                label={project.status}
                color={project.status === "SUBMITTED" ? "success" : "warning"}
                sx={{ fontWeight: "bold" }}
              />
            </Box>

            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Public project view — read only
            </Typography>

            <Divider sx={{ my: 2 }} />

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                {project.leader && (
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                      <PersonIcon sx={{ mr: 1 }} /> Team leader
                    </Typography>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        bgcolor:
                          theme.palette.mode === "dark"
                            ? theme.palette.grey[900]
                            : theme.palette.grey[100],
                      }}
                    >
                      <Typography variant="body1" fontWeight="medium">
                        {project.leader.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {project.leader.regId}
                      </Typography>
                    </Paper>
                  </Box>
                )}

                {project.projectPhoto && project.status === "SUBMITTED" && (
                  <Box
                    sx={{
                      width: "100%",
                      maxWidth: 320,
                      aspectRatio: "1",
                      mx: { xs: 0, md: "auto" },
                      overflow: "hidden",
                      bgcolor:
                        theme.palette.mode === "dark" ? theme.palette.grey[900] : theme.palette.grey[200],
                      borderRadius: 2,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      p: 1,
                    }}
                  >
                    <Box
                      component="img"
                      src={`/api/projects/${id}/image?key=${encodeURIComponent(project.projectPhoto)}`}
                      alt=""
                      sx={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
                    />
                  </Box>
                )}
              </Grid>

              <Grid item xs={12} md={6}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="h6" sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                    <GroupIcon sx={{ mr: 1 }} /> Team members
                  </Typography>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      bgcolor:
                        theme.palette.mode === "dark"
                          ? theme.palette.grey[900]
                          : theme.palette.grey[100],
                    }}
                  >
                    {Array.isArray(project.teamMembers) && project.teamMembers.length > 0 ? (
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                        {project.teamMembers.map((member, index) => (
                          <Chip key={index} label={member} size="small" />
                        ))}
                      </Box>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        —
                      </Typography>
                    )}
                  </Paper>
                </Box>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="h6" sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                  <BuildIcon sx={{ mr: 1 }} /> Components
                </Typography>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    bgcolor:
                      theme.palette.mode === "dark"
                        ? theme.palette.grey[900]
                        : theme.palette.grey[100],
                  }}
                >
                  {componentsList.length > 0 ? (
                    <Grid container spacing={1}>
                      {componentsList.map((component, index) => (
                        <Grid item xs={12} sm={6} md={4} key={index}>
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <Box
                              component="span"
                              sx={{
                                width: 6,
                                height: 6,
                                borderRadius: "50%",
                                bgcolor: "primary.main",
                                mr: 1,
                              }}
                            />
                            <Typography variant="body2">{component}</Typography>
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      —
                    </Typography>
                  )}
                </Paper>
              </Grid>

              {project.summary && (
                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ mb: 1 }}>
                    Summary
                  </Typography>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      bgcolor:
                        theme.palette.mode === "dark"
                          ? theme.palette.grey[900]
                          : theme.palette.grey[100],
                    }}
                  >
                    <Typography variant="body1" sx={{ whiteSpace: "pre-line" }}>
                      {project.summary}
                    </Typography>
                  </Paper>
                </Grid>
              )}
            </Grid>
          </CardContent>
        </Card>
      </Container>
    </motion.div>
  );
}
