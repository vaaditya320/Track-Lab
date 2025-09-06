"use client";

import { 
  Box, 
  Container, 
  Typography, 
  Button, 
  Card, 
  CardContent,
  TextField,
  useTheme,
  Breadcrumbs,
  Link as MuiLink,
  Alert,
  CircularProgress,
  Snackbar
} from "@mui/material";
import { motion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import CodeIcon from '@mui/icons-material/Code';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import HomeIcon from '@mui/icons-material/Home';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import SaveIcon from '@mui/icons-material/Save';
import GitHubIcon from '@mui/icons-material/GitHub';
import ImageIcon from '@mui/icons-material/Image';

export default function CreateIdealabProjectPage() {
  const theme = useTheme();
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    githubLink: '',
    image: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/admin/idealab/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create project');
      }

      setSuccess(true);
      setFormData({
        name: '',
        description: '',
        githubLink: '',
        image: ''
      });

      // Redirect to projects list after 2 seconds
      setTimeout(() => {
        router.push('/admin/idealab/projects');
      }, 2000);

    } catch (err) {
      console.error('Error creating project:', err);
      setError(err.message || 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box 
      sx={{ 
        minHeight: '100vh',
        backgroundColor: theme.palette.background.default,
        py: 4,
      }}
    >
      <Container maxWidth="md">
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
            <MuiLink
              component={Link}
              href="/admin/idealab/projects"
              color="inherit"
              sx={{ 
                textDecoration: 'none',
                '&:hover': { textDecoration: 'underline' }
              }}
            >
              Idea Lab Projects
            </MuiLink>
            <Typography color="text.primary">Create Project</Typography>
          </Breadcrumbs>

          {/* Back Button */}
          <Button
            component={Link}
            href="/admin/idealab/projects"
            startIcon={<ArrowBackIcon />}
            sx={{ mb: 4 }}
          >
            Back to Projects
          </Button>

          {/* Header Section */}
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <CodeIcon 
                sx={{ 
                  fontSize: 80, 
                  color: theme.palette.primary.main,
                  mb: 2 
                }} 
              />
            </motion.div>
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
              Create Idea Lab Project
            </Typography>
            <Typography 
              variant="h6" 
              color="text.secondary" 
              sx={{ maxWidth: 600, mx: 'auto' }}
            >
              Add a new project to the Idea Lab showcase
            </Typography>
          </Box>

          {/* Form Card */}
          <Card
            sx={{
              background: `linear-gradient(135deg, ${theme.palette.background.paper}, ${theme.palette.primary.light}05)`,
              borderRadius: 3,
              border: `1px solid ${theme.palette.divider}`,
              boxShadow: `0 8px 32px ${theme.palette.primary.main}10`
            }}
          >
            <CardContent sx={{ p: 4 }}>
              <form onSubmit={handleSubmit}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  {/* Project Name */}
                  <TextField
                    name="name"
                    label="Project Name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    fullWidth
                    variant="outlined"
                    placeholder="Enter project name"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                      }
                    }}
                  />

                  {/* Description */}
                  <TextField
                    name="description"
                    label="Project Description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    fullWidth
                    multiline
                    rows={4}
                    variant="outlined"
                    placeholder="Describe the project, its features, and technologies used"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                      }
                    }}
                  />

                  {/* GitHub Link */}
                  <TextField
                    name="githubLink"
                    label="GitHub Repository Link"
                    value={formData.githubLink}
                    onChange={handleInputChange}
                    required
                    fullWidth
                    variant="outlined"
                    placeholder="https://github.com/username/repository"
                    InputProps={{
                      startAdornment: <GitHubIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                      }
                    }}
                  />

                  {/* Project Image */}
                  <TextField
                    name="image"
                    label="Project Image URL (Optional)"
                    value={formData.image}
                    onChange={handleInputChange}
                    fullWidth
                    variant="outlined"
                    placeholder="https://example.com/project-image.jpg"
                    InputProps={{
                      startAdornment: <ImageIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                      }
                    }}
                  />

                  {/* Error Alert */}
                  {error && (
                    <Alert severity="error" sx={{ borderRadius: 2 }}>
                      {error}
                    </Alert>
                  )}

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                    disabled={loading}
                    sx={{
                      background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                      '&:hover': {
                        background: `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
                      },
                      borderRadius: 2,
                      py: 1.5,
                      fontWeight: 600,
                      textTransform: 'none',
                      fontSize: '16px'
                    }}
                  >
                    {loading ? 'Creating Project...' : 'Create Project'}
                  </Button>
                </Box>
              </form>
            </CardContent>
          </Card>

          {/* Success Snackbar */}
          <Snackbar
            open={success}
            autoHideDuration={2000}
            onClose={() => setSuccess(false)}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          >
            <Alert 
              severity="success" 
              onClose={() => setSuccess(false)}
              sx={{ borderRadius: 2 }}
            >
              Project created successfully! Redirecting to projects list...
            </Alert>
          </Snackbar>
        </motion.div>
      </Container>
    </Box>
  );
}
