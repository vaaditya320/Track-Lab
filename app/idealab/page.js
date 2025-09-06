"use client";

import { 
  Box, 
  Container, 
  Typography, 
  Button, 
  Card, 
  CardContent,
  Grid,
  useTheme
} from "@mui/material";
import { motion } from "framer-motion";
import Link from "next/link";
import CodeIcon from '@mui/icons-material/Code';
import ComputerIcon from '@mui/icons-material/Computer';

export default function IdeaLabPage() {
  const theme = useTheme();

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
          {/* Header Section */}
          <Box sx={{ textAlign: 'center', mb: 6 }}>
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
              IDEA Lab
            </Typography>
            <Typography 
              variant="h6" 
              color="text.secondary" 
              sx={{ maxWidth: 800, mx: 'auto', mb: 4 }}
            >
              Innovation, Development, Entrepreneurship and Advancement
            </Typography>
          </Box>

          {/* IDEA Lab Description */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card 
              sx={{ 
                mb: 6,
                background: `linear-gradient(135deg, ${theme.palette.background.paper}, ${theme.palette.primary.light}05)`,
                borderRadius: 3,
                border: `1px solid ${theme.palette.divider}`,
                boxShadow: `0 8px 32px ${theme.palette.primary.main}10`
              }}
            >
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ mb: 3, textAlign: 'center' }}>
                  About IDEA Lab
                </Typography>
                
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3, lineHeight: 1.7 }}>
                  The All India Council for Technical Education (AICTE) has launched the <strong>IDEA (Innovation, Development, Entrepreneurship and Advancement) Lab</strong> to promote innovation and entrepreneurship among students in technical education institutions. The IDEA Lab is designed to provide a platform for students to conceptualize and develop their ideas into sustainable projects and startups.
                </Typography>

                <Grid container spacing={3} sx={{ mb: 3 }}>
                  <Grid item xs={12} md={4}>
                    <Box sx={{ textAlign: 'center', p: 2 }}>
                      <Typography variant="h6" fontWeight="bold" color="primary" gutterBottom>
                        🎯 Objective
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                        Foster a culture of innovation and entrepreneurship among students, creating an environment conducive to developing new ideas and ventures.
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Box sx={{ textAlign: 'center', p: 2 }}>
                      <Typography variant="h6" fontWeight="bold" color="secondary" gutterBottom>
                        ⚙️ Execution
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                        State-of-the-art facilities with access to mentors, experts, and industry leaders for guidance throughout the development process.
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Box sx={{ textAlign: 'center', p: 2 }}>
                      <Typography variant="h6" fontWeight="bold" color="success.main" gutterBottom>
                        🚀 Innovation
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                        A place for experimentation, collaboration, and co-creation to design, develop, test, and validate new products and business models.
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>

                <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.7, textAlign: 'center', fontStyle: 'italic' }}>
                  The IDEA Lab organizes workshops, hackathons, and incubation programs throughout the year, offering funding and resources for students to turn their ideas into prototypes and test them in the market.
                </Typography>
              </CardContent>
            </Card>
          </motion.div>

          {/* Buttons Section */}
          <Grid container spacing={3} justifyContent="center">
            <Grid item xs={12} sm={6} md={4}>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <Card 
                  sx={{ 
                    height: '100%',
                    background: `linear-gradient(135deg, ${theme.palette.primary.main}15, ${theme.palette.primary.light}30)`,
                    border: `2px solid ${theme.palette.primary.light}`,
                    borderRadius: 3,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      boxShadow: `0 8px 25px ${theme.palette.primary.main}30`,
                      transform: 'translateY(-4px)',
                    }
                  }}
                >
                  <CardContent sx={{ p: 4, textAlign: 'center' }}>
                    <CodeIcon 
                      sx={{ 
                        fontSize: 64, 
                        color: theme.palette.primary.main,
                        mb: 2 
                      }} 
                    />
                    <Typography variant="h5" fontWeight="bold" gutterBottom>
                      Idea Lab Softwares
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                      Download essential software for makers, developers, and innovators
                    </Typography>
                    <Button
                      component={Link}
                      href="/idealab/software"
                      variant="contained"
                      color="primary"
                      size="large"
                      fullWidth
                      sx={{ 
                        py: 1.5,
                        borderRadius: 2,
                        fontWeight: 600,
                        textTransform: 'none',
                        fontSize: '16px'
                      }}
                    >
                      Explore Softwares
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <Card 
                  sx={{ 
                    height: '100%',
                    background: `linear-gradient(135deg, ${theme.palette.secondary.main}15, ${theme.palette.secondary.light}30)`,
                    border: `2px solid ${theme.palette.secondary.light}`,
                    borderRadius: 3,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      boxShadow: `0 8px 25px ${theme.palette.secondary.main}30`,
                      transform: 'translateY(-4px)',
                    }
                  }}
                >
                  <CardContent sx={{ p: 4, textAlign: 'center' }}>
                    <ComputerIcon 
                      sx={{ 
                        fontSize: 64, 
                        color: theme.palette.secondary.main,
                        mb: 2 
                      }} 
                    />
                    <Typography variant="h5" fontWeight="bold" gutterBottom>
                      Idea Lab Projects
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                      Discover innovative projects and open-source contributions
                    </Typography>
                    <Button
                      component={Link}
                      href="/idealab/projects"
                      variant="contained"
                      color="secondary"
                      size="large"
                      fullWidth
                      sx={{ 
                        py: 1.5,
                        borderRadius: 2,
                        fontWeight: 600,
                        textTransform: 'none',
                        fontSize: '16px'
                      }}
                    >
                      Explore Projects
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          </Grid>

          {/* Call to Action Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
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
                  Ready to Explore?
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 800, mx: 'auto', mb: 3 }}>
                  Discover essential software tools for makers and developers, or explore innovative projects 
                  and open-source contributions from our community. Choose your path to innovation and entrepreneurship.
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                  "The best way to predict the future is to create it." - Peter Drucker
                </Typography>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </Container>
    </Box>
  );
}
