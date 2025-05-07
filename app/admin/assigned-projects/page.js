"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Chip,
  CircularProgress,
  Button,
  Card,
  CardContent,
  CardActions,
  Divider,
  Avatar,
  Stack,
  Alert,
  IconButton,
  Tooltip,
  useTheme,
  useMediaQuery
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DownloadIcon from "@mui/icons-material/Download";
import VisibilityIcon from "@mui/icons-material/Visibility";
import axios from "axios";
import * as XLSX from 'xlsx';
import { motion } from "framer-motion";

// Skeleton loader component
const ProjectCardSkeleton = () => {
  return (
    <Card 
      sx={{ 
        borderRadius: 2,
        height: '100%',
        background: 'white'
      }}
    >
      <CardContent>
        <motion.div
          animate={{ opacity: [0.5, 0.8, 0.5] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        >
          <Box sx={{ height: 32, bgcolor: 'action.hover', borderRadius: 1, mb: 3, width: '80%' }} />
          
          <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
            <Box sx={{ width: 40, height: 40, borderRadius: '50%', bgcolor: 'action.hover' }} />
            <Box sx={{ width: '60%' }}>
              <Box sx={{ height: 20, bgcolor: 'action.hover', borderRadius: 1, mb: 1, width: '80%' }} />
              <Box sx={{ height: 16, bgcolor: 'action.hover', borderRadius: 1, width: '60%' }} />
            </Box>
          </Stack>

          <Box sx={{ mb: 3 }}>
            <Box sx={{ height: 20, bgcolor: 'action.hover', borderRadius: 1, mb: 1, width: '40%' }} />
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {[1, 2, 3].map((i) => (
                <Box 
                  key={i}
                  sx={{ 
                    height: 24, 
                    bgcolor: 'action.hover', 
                    borderRadius: 1, 
                    width: '30%' 
                  }} 
                />
              ))}
            </Box>
          </Box>

          <Box sx={{ mb: 3 }}>
            <Box sx={{ height: 20, bgcolor: 'action.hover', borderRadius: 1, mb: 1, width: '40%' }} />
            <Box sx={{ height: 40, bgcolor: 'action.hover', borderRadius: 1, width: '100%' }} />
          </Box>

          <Divider sx={{ my: 2 }} />

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ height: 24, bgcolor: 'action.hover', borderRadius: 1, width: '30%' }} />
            <Box sx={{ width: 40, height: 40, borderRadius: '50%', bgcolor: 'action.hover' }} />
          </Box>
        </motion.div>
      </CardContent>
    </Card>
  );
};

export default function AssignedProjects() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (status === "authenticated") {
      fetchAssignedProjects();
    }
  }, [status]);

  const fetchAssignedProjects = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await axios.get("/api/projects/assigned");
      const projectsWithParsedMembers = response.data.map(project => ({
        ...project,
        teamMembers: typeof project.teamMembers === 'string' 
          ? project.teamMembers.split(',').map(member => member.trim())
          : project.teamMembers
      }));
      setProjects(projectsWithParsedMembers);
    } catch (error) {
      console.error("Error fetching assigned projects:", error);
      if (error.response?.status === 403) {
        setError("You don't have permission to view assigned projects. Admin access required.");
        router.push("/");
      } else if (error.response?.status === 401) {
        setError("Please sign in to view assigned projects.");
        router.push("/auth/signin");
      } else {
        setError("Failed to fetch assigned projects. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadExcel = async () => {
    try {
      setDownloading(true);
      const data = projects.map(project => ({
        'Project Title': project.title,
        'Project Leader': project.leader.name,
        'Leader Registration ID': project.leader.regId,
        'Team Members': Array.isArray(project.teamMembers) ? project.teamMembers.join(', ') : '',
        'Components': project.components,
        'Status': project.status || 'PENDING'
      }));

      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Assigned Projects");
      XLSX.writeFile(wb, "assigned_projects.xlsx");
    } catch (error) {
      console.error("Error downloading Excel:", error);
      setError("Failed to download Excel file. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <Box sx={{ p: 3, maxWidth: 1200, mx: "auto" }}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          mb: 3,
          flexDirection: isMobile ? 'column' : 'row',
          gap: 2
        }}>
          <Box sx={{ height: 36, bgcolor: 'action.hover', borderRadius: 2, width: 200 }} />
          <Box sx={{ height: 36, bgcolor: 'action.hover', borderRadius: 2, width: 150 }} />
        </Box>

        <Box sx={{ 
          height: 40, 
          bgcolor: 'action.hover', 
          borderRadius: 1, 
          mb: 4, 
          width: '40%' 
        }} />

        <Grid container spacing={3}>
          {[1, 2, 3, 4].map((i) => (
            <Grid item xs={12} md={6} key={i}>
              <ProjectCardSkeleton />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  if (status === "unauthenticated") {
    router.push("/auth/signin");
    return null;
  }

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: "auto" }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mb: 3,
        flexDirection: isMobile ? 'column' : 'row',
        gap: 2
      }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => router.push("/admin")}
          variant="outlined"
          sx={{ 
            borderRadius: 2,
            textTransform: 'none',
            '&:hover': {
              backgroundColor: theme.palette.primary.main,
              color: 'white'
            }
          }}
        >
          Back to Admin Dashboard
        </Button>

        <Button
          startIcon={<DownloadIcon />}
          onClick={handleDownloadExcel}
          variant="contained"
          disabled={downloading || projects.length === 0}
          sx={{ 
            borderRadius: 2,
            textTransform: 'none',
            background: "linear-gradient(45deg, #1976D2 0%, #1565C0 100%)",
            boxShadow: "0 4px 20px rgba(25, 118, 210, 0.3)",
            '&:hover': {
              background: "linear-gradient(45deg, #1565C0 0%, #0D47A1 100%)",
              boxShadow: "0 6px 25px rgba(25, 118, 210, 0.4)",
            }
          }}
        >
          {downloading ? "Downloading..." : "Download Excel"}
        </Button>
      </Box>

      <Typography 
        variant="h4" 
        gutterBottom 
        sx={{ 
          fontWeight: 'bold',
          background: "linear-gradient(45deg, #1976D2 0%, #1565C0 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          mb: 4
        }}
      >
        My Assigned Projects
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {!error && projects.length === 0 ? (
        <Paper 
          sx={{ 
            p: 4, 
            textAlign: "center",
            borderRadius: 2,
            background: theme.palette.background.paper,
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)"
          }}
        >
          <Typography color="text.secondary" variant="h6">
            No projects have been assigned to you yet.
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {projects.map((project) => (
            <Grid item xs={12} md={6} key={project.id}>
              <Card 
                sx={{ 
                  borderRadius: 2,
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 24px rgba(25, 118, 210, 0.15)'
                  }
                }}
              >
                <CardContent>
                  <Typography 
                    variant="h6" 
                    gutterBottom
                    sx={{ 
                      fontWeight: 'bold',
                      color: '#1976D2'
                    }}
                  >
                    {project.title}
                  </Typography>
                  
                  <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                    <Avatar 
                      sx={{ 
                        bgcolor: '#1976D2',
                        boxShadow: '0 2px 8px rgba(25, 118, 210, 0.15)'
                      }}
                    >
                      {project.leader.name.split(' ').map(n => n[0]).join('')}
                    </Avatar>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                        Project Leader: {project.leader.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {project.leader.regId}
                      </Typography>
                    </Box>
                  </Stack>

                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Team Members:
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    {Array.isArray(project.teamMembers) && project.teamMembers.map((member, index) => (
                      <Chip
                        key={index}
                        label={member}
                        size="small"
                        sx={{ 
                          mr: 1, 
                          mb: 1,
                          background: '#E3F2FD',
                          color: '#1976D2',
                          fontWeight: 500
                        }}
                      />
                    ))}
                  </Box>

                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Components:
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    {project.components}
                  </Typography>

                  <Divider sx={{ my: 2 }} />

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Chip
                      label={project.status || "PENDING"}
                      color={project.status === "APPROVED" ? "success" : "default"}
                      size="small"
                      sx={{ 
                        borderRadius: 1,
                        fontWeight: 'medium'
                      }}
                    />
                    <Tooltip title="View Project Details">
                      <IconButton 
                        onClick={() => router.push(`/admin/projects/${project.id}`)}
                        sx={{ 
                          color: '#1976D2',
                          '&:hover': {
                            backgroundColor: '#E3F2FD',
                            color: '#1565C0'
                          }
                        }}
                      >
                        <VisibilityIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
} 