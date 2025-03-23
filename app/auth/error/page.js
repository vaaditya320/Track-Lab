"use client";

import { useState, useEffect } from 'react';
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  Box, 
  Typography, 
  Button, 
  Paper, 
  Container,
  Skeleton,
  useTheme,
  useMediaQuery,
  Alert
} from '@mui/material';
import LockPersonIcon from '@mui/icons-material/LockPerson';
import SecurityIcon from '@mui/icons-material/Security';
import EmailIcon from '@mui/icons-material/Email';

export default function AuthErrorPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  // Determine error message based on error code
  let errorTitle = "Authentication Error";
  let errorMessage = "Hmm, that doesn't look right. Something unexpected happened.";
  let errorDetails = "Please try again or contact support if the issue persists.";
  
  if (error === "AccessDenied") {
    errorTitle = "VIP Zone Detected!";
    errorMessage = "Whoa there! This app is exclusively for Poornima members.";
    errorDetails = "Looks like you're trying to sneak in with a non-Poornima email. Nice try though! 😉";
  } else if (error === "Verification") {
    errorTitle = "Check Your Inbox";
    errorMessage = "Email verification required.";
    errorDetails = "Please check your inbox and verify your email before continuing.";
  } else if (error === "OAuthSignin" || error === "OAuthCallback") {
    errorTitle = "Connection Issue";
    errorMessage = "There was a problem with the sign-in process.";
    errorDetails = "The authentication provider might be unavailable. Please try again later.";
  } else if (error === "OAuthAccountNotLinked") {
    errorTitle = "Account Mismatch";
    errorMessage = "Account not linked.";
    errorDetails = "You've already signed up with a different provider. Please use your original sign-in method.";
  }

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        when: "beforeChildren",
        staggerChildren: 0.2,
        duration: 0.5 
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };

  const iconVariants = {
    hidden: { scale: 0, rotate: -180 },
    visible: { 
      scale: 1, 
      rotate: 0,
      transition: { 
        type: "spring", 
        stiffness: 200, 
        damping: 20,
        duration: 0.8 
      }
    }
  };
  
  if (loading) {
    return (
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Paper 
          elevation={3} 
          sx={{ 
            p: 4, 
            borderRadius: 4,
            bgcolor: theme.palette.background.paper,
            background: theme.palette.mode === 'dark'
              ? `linear-gradient(145deg, ${theme.palette.background.paper}, ${theme.palette.background.default})`
              : `linear-gradient(145deg, ${theme.palette.background.paper}, ${theme.palette.primary.light}10)`,
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
            <Skeleton variant="circular" width={80} height={80} />
          </Box>
          <Skeleton variant="text" sx={{ fontSize: '2rem', mb: 2, width: '80%', mx: 'auto' }} />
          <Skeleton variant="text" sx={{ fontSize: '1rem', mb: 3, width: '90%', mx: 'auto' }} />
          <Skeleton variant="text" sx={{ fontSize: '1rem', mb: 4, width: '70%', mx: 'auto' }} />
          <Skeleton variant="rectangular" width="50%" height={40} sx={{ mx: 'auto', borderRadius: 2 }} />
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ py: { xs: 4, md: 8 } }}>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <Paper 
          elevation={3} 
          sx={{ 
            p: { xs: 3, md: 5 }, 
            borderRadius: 4,
            background: theme.palette.mode === 'dark'
              ? `linear-gradient(145deg, ${theme.palette.background.paper}, ${theme.palette.background.default})`
              : `linear-gradient(145deg, ${theme.palette.background.paper}, ${theme.palette.primary.light}10)`,
            border: `1px solid ${theme.palette.mode === 'dark' 
              ? `${theme.palette.primary.main}30` 
              : `${theme.palette.primary.main}20`}`,
            overflow: 'hidden',
            position: 'relative',
            backdropFilter: 'blur(10px)',
            boxShadow: theme.palette.mode === 'dark'
              ? '0 8px 32px rgba(0, 0, 0, 0.3)'
              : '0 8px 32px rgba(67, 97, 238, 0.1)'
          }}
        >
          {/* Background decorative elements */}
          <Box
            sx={{
              position: 'absolute',
              top: -40,
              right: -40,
              width: 200,
              height: 200,
              borderRadius: '50%',
              background: `${theme.palette.primary.main}${theme.palette.mode === 'dark' ? '15' : '10'}`,
              zIndex: 0
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              bottom: -30,
              left: -30,
              width: 150,
              height: 150,
              borderRadius: '50%',
              background: `${theme.palette.secondary.main}${theme.palette.mode === 'dark' ? '15' : '10'}`,
              zIndex: 0
            }}
          />
          
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
              <motion.div variants={iconVariants}>
                <Box 
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 90,
                    height: 90,
                    borderRadius: '50%',
                    background: theme.palette.mode === 'dark'
                      ? `${theme.palette.primary.main}30`
                      : `${theme.palette.primary.main}20`,
                    mb: 2,
                    boxShadow: theme.palette.mode === 'dark'
                      ? '0 4px 20px rgba(67, 97, 238, 0.2)'
                      : '0 4px 20px rgba(67, 97, 238, 0.1)'
                  }}
                >
                  <SecurityIcon 
                    color="primary" 
                    sx={{ 
                      fontSize: isMobile ? 40 : 50,
                      color: theme.palette.primary.main
                    }} 
                  />
                </Box>
              </motion.div>
            </Box>
            
            <motion.div variants={itemVariants}>
              <Typography 
                variant="h4" 
                component="h1" 
                align="center" 
                gutterBottom
                sx={{ 
                  fontWeight: 800,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  color: 'transparent',
                  mb: 2
                }}
              >
                {errorTitle}
              </Typography>
            </motion.div>
            
            <motion.div variants={itemVariants}>
              <Typography 
                variant="h6" 
                align="center" 
                gutterBottom
                sx={{ 
                  mb: 1,
                  color: theme.palette.text.primary,
                  fontWeight: 600
                }}
              >
                {errorMessage}
              </Typography>
            </motion.div>
            
            <motion.div variants={itemVariants}>
              <Typography 
                variant="body1" 
                align="center" 
                color="text.secondary"
                sx={{ 
                  mb: 4,
                  lineHeight: 1.6
                }}
              >
                {errorDetails}
              </Typography>
            </motion.div>
            
            {error === "AccessDenied" && (
              <motion.div 
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
              >
                <Alert 
                  severity="info" 
                  icon={<EmailIcon />}
                  sx={{ 
                    mb: 4, 
                    borderRadius: 2,
                    background: theme.palette.mode === 'dark'
                      ? `${theme.palette.primary.main}15`
                      : `${theme.palette.primary.main}10`,
                    border: `1px solid ${theme.palette.primary.main}30`,
                    '& .MuiAlert-message': {
                      width: '100%'
                    },
                    '& .MuiAlert-icon': {
                      color: theme.palette.primary.main
                    }
                  }}
                >
                  <Typography variant="body2" sx={{ 
                    fontWeight: 500,
                    color: theme.palette.text.primary
                  }}>
                    Only <strong style={{ color: theme.palette.primary.main }}>@poornima.org</strong> email addresses can enter this exclusive club!
                  </Typography>
                </Alert>
              </motion.div>
            )}
            
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
              <motion.div 
                variants={itemVariants}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link href="/auth/signin" style={{ textDecoration: 'none' }}>
                  <Button 
                    variant="contained" 
                    color="primary"
                    size="large"
                    startIcon={<LockPersonIcon />}
                    sx={{ 
                      px: 4, 
                      py: 1.2,
                      fontWeight: 600,
                      boxShadow: theme.palette.mode === 'dark'
                        ? '0 4px 20px rgba(67, 97, 238, 0.3)'
                        : '0 4px 20px rgba(67, 97, 238, 0.2)',
                      background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                      '&:hover': {
                        background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
                        boxShadow: theme.palette.mode === 'dark'
                          ? '0 6px 24px rgba(67, 97, 238, 0.4)'
                          : '0 6px 24px rgba(67, 97, 238, 0.3)'
                      }
                    }}
                  >
                    Try Again
                  </Button>
                </Link>
              </motion.div>
              
              <motion.div 
                variants={itemVariants}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link href="/" style={{ textDecoration: 'none' }}>
                  <Button 
                    variant="outlined" 
                    color="primary"
                    size="large"
                    sx={{ 
                      px: 3, 
                      py: 1.2,
                      borderColor: theme.palette.mode === 'dark'
                        ? `${theme.palette.primary.main}50`
                        : `${theme.palette.primary.main}30`,
                      color: theme.palette.primary.main,
                      '&:hover': {
                        borderColor: theme.palette.primary.main,
                        background: `${theme.palette.primary.main}10`
                      }
                    }}
                  >
                    Go Home
                  </Button>
                </Link>
              </motion.div>
            </Box>
          </Box>
        </Paper>
      </motion.div>
    </Container>
  );
}