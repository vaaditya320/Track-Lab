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
  CardActions
} from "@mui/material";
import { motion } from "framer-motion";
import Link from "next/link";
import { useState, useEffect } from "react";
import CodeIcon from '@mui/icons-material/Code';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import HomeIcon from '@mui/icons-material/Home';
import GitHubIcon from '@mui/icons-material/GitHub';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import FolderIcon from '@mui/icons-material/Folder';

// Project Card Component
const ProjectCard = ({ project, index, theme }) => {
  return (
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

          <Chip
            label="Open Source"
            size="small"
            sx={{
              backgroundColor: `${theme.palette.success.main}20`,
              color: theme.palette.success.main,
              fontWeight: 600,
              mb: 2
            }}
          />
        </CardContent>

        <CardActions sx={{ p: 3, pt: 0 }}>
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
              px: 3,
              py: 1,
              fontWeight: 600,
              textTransform: 'none',
              flex: 1
            }}
          >
            View on GitHub
          </Button>
        </CardActions>
      </Card>
    </motion.div>
  );
};

// Loading Skeleton Component
const ProjectSkeleton = () => {
  const theme = useTheme();
  
  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: theme.palette.background.paper,
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 3,
      }}
    >
      <Box
        sx={{
          height: 200,
          background: theme.palette.grey[200],
          borderRadius: '12px 12px 0 0'
        }}
      />
      <CardContent sx={{ flexGrow: 1, p: 3 }}>
        <Box sx={{ mb: 2 }}>
          <Box
            sx={{
              height: 24,
              background: theme.palette.grey[300],
              borderRadius: 1,
              mb: 1
            }}
          />
          <Box
            sx={{
              height: 20,
              background: theme.palette.grey[300],
              borderRadius: 1,
              width: '60%'
            }}
          />
        </Box>
        <Box sx={{ mb: 2 }}>
          <Box
            sx={{
              height: 16,
              background: theme.palette.grey[300],
              borderRadius: 1,
              mb: 1
            }}
          />
          <Box
            sx={{
              height: 16,
              background: theme.palette.grey[300],
              borderRadius: 1,
              mb: 1
            }}
          />
          <Box
            sx={{
              height: 16,
              background: theme.palette.grey[300],
              borderRadius: 1,
              width: '70%'
            }}
          />
        </Box>
        <Box
          sx={{
            height: 24,
            background: theme.palette.grey[300],
            borderRadius: 1,
            width: '40%'
          }}
        />
      </CardContent>
      <CardActions sx={{ p: 3, pt: 0 }}>
        <Box
          sx={{
            height: 40,
            background: theme.palette.grey[300],
            borderRadius: 2,
            flex: 1
          }}
        />
      </CardActions>
    </Card>
  );
};

export default function ProjectsPage() {
  const theme = useTheme();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch('/api/idealab/projects');
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

    fetchProjects();
  }, []);

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
              href="/idealab"
              color="inherit"
              sx={{ 
                textDecoration: 'none',
                '&:hover': { textDecoration: 'underline' }
              }}
            >
              Idea Lab
            </MuiLink>
            <Typography color="text.primary">Projects</Typography>
          </Breadcrumbs>

          {/* Back Button */}
          <Button
            component={Link}
            href="/idealab"
            startIcon={<ArrowBackIcon />}
            sx={{ mb: 4 }}
          >
            Back to Idea Lab
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
              Idea Lab Projects
            </Typography>
            <Typography 
              variant="h6" 
              color="text.secondary" 
              sx={{ maxWidth: 600, mx: 'auto' }}
            >
              Discover innovative projects and open-source contributions
            </Typography>
          </Box>

          {/* Error State */}
          {error && (
            <Alert severity="error" sx={{ mb: 4 }}>
              {error}
            </Alert>
          )}

          {/* Projects Grid */}
          {loading ? (
            <Grid container spacing={3}>
              {[...Array(6)].map((_, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <ProjectSkeleton />
                </Grid>
              ))}
            </Grid>
          ) : projects.length > 0 ? (
            <Grid container spacing={3}>
              {projects.map((project, index) => (
                <Grid item xs={12} sm={6} md={4} key={project.id}>
                  <ProjectCard 
                    project={project} 
                    index={index} 
                    theme={theme} 
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
                Check back later for exciting new projects and open-source contributions.
              </Typography>
            </Box>
          )}

          {/* Footer Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <Card 
              sx={{ 
                mt: 6,
                background: `linear-gradient(135deg, ${theme.palette.background.paper}, ${theme.palette.primary.light}10)`,
                borderRadius: 3,
                border: `1px solid ${theme.palette.divider}`
              }}
            >
              <CardContent sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Open Source Innovation
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: 800, mx: 'auto' }}>
                  All projects are open-source and available on GitHub. Feel free to contribute, 
                  fork, or use these projects for your own development needs.
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                  <Button
                    component={Link}
                    href="/idealab"
                    variant="outlined"
                    color="primary"
                    size="large"
                    sx={{ borderRadius: 2, px: 4 }}
                  >
                    Back to Idea Lab
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </Container>
    </Box>
  );
}
