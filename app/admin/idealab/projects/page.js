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
  Chip,
  CardMedia,
  CardActions,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar
} from "@mui/material";
import { motion } from "framer-motion";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import CodeIcon from '@mui/icons-material/Code';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import HomeIcon from '@mui/icons-material/Home';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import AddIcon from '@mui/icons-material/Add';
import GitHubIcon from '@mui/icons-material/GitHub';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import FolderIcon from '@mui/icons-material/Folder';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

// Project Card Component
const ProjectCard = ({ project, index, theme, onDelete }) => {
  const [deleteDialog, setDeleteDialog] = useState(false);

  const handleDelete = () => {
    setDeleteDialog(true);
  };

  const confirmDelete = async () => {
    try {
      const response = await fetch(`/api/admin/idealab/projects/${project.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        onDelete(project.id);
      } else {
        console.error('Failed to delete project');
      }
    } catch (error) {
      console.error('Error deleting project:', error);
    } finally {
      setDeleteDialog(false);
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: index * 0.1 }}
      >
        <Card
          sx={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            background: `linear-gradient(135deg, ${theme.palette.background.paper}, ${theme.palette.primary.light}05)`,
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 3,
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-8px)',
              boxShadow: `0 12px 30px ${theme.palette.primary.main}20`,
              border: `1px solid ${theme.palette.primary.light}`,
            }
          }}
        >
          {/* Project Image */}
          {project.image ? (
            <CardMedia
              component="img"
              height="200"
              image={project.image}
              alt={project.name}
              sx={{
                objectFit: 'cover',
                borderRadius: '12px 12px 0 0'
              }}
            />
          ) : (
            <Box
              sx={{
                height: 200,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: `linear-gradient(135deg, ${theme.palette.primary.light}20, ${theme.palette.secondary.light}20)`,
                borderRadius: '12px 12px 0 0'
              }}
            >
              <FolderIcon sx={{ fontSize: 64, color: theme.palette.primary.main, opacity: 0.7 }} />
            </Box>
          )}

          <CardContent sx={{ flexGrow: 1, p: 3 }}>
            <Typography
              variant="h5"
              fontWeight="bold"
              gutterBottom
              sx={{
                background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 2,
                wordBreak: 'break-word'
              }}
            >
              {project.name}
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mb: 3,
                lineHeight: 1.6,
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden'
              }}
            >
              {project.description}
            </Typography>

            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <Chip
                label="Open Source"
                size="small"
                sx={{
                  backgroundColor: `${theme.palette.success.main}20`,
                  color: theme.palette.success.main,
                  fontWeight: 600
                }}
              />
              <Chip
                label={new Date(project.createdAt).toLocaleDateString()}
                size="small"
                variant="outlined"
                sx={{
                  color: theme.palette.text.secondary
                }}
              />
            </Box>
          </CardContent>

          <CardActions sx={{ p: 3, pt: 0, justifyContent: 'space-between' }}>
            <Button
              variant="contained"
              startIcon={<GitHubIcon />}
              endIcon={<OpenInNewIcon />}
              onClick={() => window.open(project.githubLink, '_blank')}
              sx={{
                background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                '&:hover': {
                  background: `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
                },
                borderRadius: 2,
                px: 2,
                py: 1,
                fontWeight: 600,
                textTransform: 'none',
                flex: 1,
                mr: 1
              }}
            >
              GitHub
            </Button>
            
            <IconButton
              onClick={handleDelete}
              color="error"
              sx={{
                '&:hover': {
                  backgroundColor: `${theme.palette.error.main}20`
                }
              }}
            >
              <DeleteIcon />
            </IconButton>
          </CardActions>
        </Card>
      </motion.div>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog}
        onClose={() => setDeleteDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Delete Project</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{project.name}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog(false)}>
            Cancel
          </Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default function AdminProjectsPage() {
  const theme = useTheme();
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch('/api/admin/idealab/projects');
        if (!response.ok) {
          throw new Error('Failed to fetch projects');
        }
        const data = await response.json();
        setProjects(data);
      } catch (err) {
        console.error('Error fetching projects:', err);
        setError('Failed to load projects. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    // Only fetch if user is authenticated and has admin role
    if (status === "authenticated" && (session?.user?.role === "ADMIN" || session?.user?.role === "SUPER_ADMIN")) {
      fetchProjects();
    } else if (status === "unauthenticated") {
      setLoading(false);
    }
  }, [status, session?.user?.role]);

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

  if (session?.user?.role !== "ADMIN" && session?.user?.role !== "SUPER_ADMIN") {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">
          You don't have permission to access this page.
        </Alert>
      </Container>
    );
  }

  const handleDeleteProject = (projectId) => {
    setProjects(projects.filter(p => p.id !== projectId));
    setSuccess('Project deleted successfully');
  };

  return (
    <Box 
      sx={{ 
        minHeight: '100vh',
        backgroundColor: theme.palette.background.default,
        py: 4,
      }}
    >
      <Container maxWidth="lg">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Breadcrumbs */}
          <Breadcrumbs sx={{ mb: 4 }}>
            <MuiLink
              component={Link}
              href="/"
              color="inherit"
              sx={{ 
                display: 'flex', 
                alignItems: 'center',
                textDecoration: 'none',
                '&:hover': { textDecoration: 'underline' }
              }}
            >
              <HomeIcon sx={{ mr: 0.5, fontSize: 20 }} />
              Home
            </MuiLink>
            <MuiLink
              component={Link}
              href="/admin"
              color="inherit"
              sx={{ 
                textDecoration: 'none',
                '&:hover': { textDecoration: 'underline' }
              }}
            >
              Admin Panel
            </MuiLink>
            <Typography color="text.primary">Idea Lab Projects</Typography>
          </Breadcrumbs>

          {/* Back Button */}
          <Button
            component={Link}
            href="/admin"
            startIcon={<ArrowBackIcon />}
            sx={{ mb: 4 }}
          >
            Back to Admin Panel
          </Button>

          {/* Header Section */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 6 }}>
            <Box>
              <Typography 
                variant="h3" 
                fontWeight="bold" 
                gutterBottom
                sx={{ 
                  background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 2
                }}
              >
                Idea Lab Projects
              </Typography>
              <Typography 
                variant="h6" 
                color="text.secondary"
              >
                Manage Idea Lab projects and showcase
              </Typography>
            </Box>
            
            <Button
              component={Link}
              href="/admin/idealab/projects/create"
              variant="contained"
              startIcon={<AddIcon />}
              sx={{
                background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                '&:hover': {
                  background: `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
                },
                borderRadius: 2,
                px: 3,
                py: 1.5,
                fontWeight: 600,
                textTransform: 'none'
              }}
            >
              Add Project
            </Button>
          </Box>

          {/* Error State */}
          {error && (
            <Alert severity="error" sx={{ mb: 4 }}>
              {error}
            </Alert>
          )}

          {/* Projects Grid */}
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress size={60} />
            </Box>
          ) : projects.length > 0 ? (
            <Grid container spacing={3}>
              {projects.map((project, index) => (
                <Grid item xs={12} sm={6} md={4} key={project.id}>
                  <ProjectCard 
                    project={project} 
                    index={index} 
                    theme={theme}
                    onDelete={handleDeleteProject}
                  />
                </Grid>
              ))}
            </Grid>
          ) : (
            <Box
              sx={{
                textAlign: 'center',
                py: 8,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 2,
                bgcolor: 'background.paper',
                borderRadius: 2,
                boxShadow: 1,
                my: 4,
              }}
            >
              <FolderIcon sx={{ fontSize: 64, color: 'text.disabled' }} />
              <Typography variant="h6" color="text.secondary">
                No projects yet
              </Typography>
              <Typography variant="body2" color="text.disabled" sx={{ maxWidth: 400, mb: 2, px: 2 }}>
                Create your first Idea Lab project to get started.
              </Typography>
              <Button
                component={Link}
                href="/admin/idealab/projects/create"
                variant="contained"
                startIcon={<AddIcon />}
                sx={{ borderRadius: 2 }}
              >
                Create First Project
              </Button>
            </Box>
          )}

          {/* Success Snackbar */}
          <Snackbar
            open={!!success}
            autoHideDuration={3000}
            onClose={() => setSuccess('')}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          >
            <Alert 
              severity="success" 
              onClose={() => setSuccess('')}
              sx={{ borderRadius: 2 }}
            >
              {success}
            </Alert>
          </Snackbar>
        </motion.div>
      </Container>
    </Box>
  );
}
