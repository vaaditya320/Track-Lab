"use client";

import { useState, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import ParticleBackground from '@/app/components/ParticleBackground';
import { 
  Box, 
  Typography, 
  Button, 
  Card, 
  CardContent, 
  Container, 
  useTheme, 
  Skeleton,
  Stack,
  Paper
} from '@mui/material';
import { Google } from '@mui/icons-material';

export default function SignIn() {
  const [loading, setLoading] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';
  const theme = useTheme();

  useEffect(() => {
    // Simulate loading state for a smoother experience
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  const handleGoogleSignIn = () => {
    setLoading(true);
    signIn('google', { callbackUrl });
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring', stiffness: 100 }
    }
  };

  const logoVariants = {
    hidden: { scale: 0.8, opacity: 0, rotate: -10 },
    visible: { 
      scale: 1, 
      opacity: 1,
      rotate: 0,
      transition: { 
        type: 'spring', 
        stiffness: 200, 
        damping: 15 
      }
    }
  };

  const backgroundPattern = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 0.05,
      transition: { duration: 1.5 }
    }
  };

  // Floating animation for the card
  const floatAnimation = {
    y: [0, -10, 0],
    transition: {
      duration: 6,
      repeat: Infinity,
      repeatType: "reverse",
      ease: "easeInOut"
    }
  };

  return (
    <>
      {/* Full page particle background */}
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          zIndex: 0,
          opacity: 0.6,
          pointerEvents: 'none'
        }}
      >
        <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
          <ambientLight intensity={0.5} />
          <ParticleBackground />
          <OrbitControls 
            enableZoom={false}
            enablePan={false}
            minPolarAngle={Math.PI / 2}
            maxPolarAngle={Math.PI / 2}
            enableDamping
            dampingFactor={0.05}
          />
        </Canvas>
      </Box>

      {/* Main content container */}
      <Container 
        maxWidth="sm" 
        sx={{ 
          minHeight: '100vh', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          py: 4,
          position: 'relative',
          zIndex: 1
        }}
      >
        {!isLoaded ? (
          <Card sx={{ width: '100%', overflow: 'hidden', borderRadius: 4 }}>
            <CardContent sx={{ p: 5 }}>
              <Stack spacing={4} sx={{ width: '100%' }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                  <Skeleton variant="circular" width={100} height={100} />
                </Box>
                <Skeleton variant="text" height={60} width="80%" sx={{ mx: 'auto' }} />
                <Skeleton variant="text" height={30} width="60%" sx={{ mx: 'auto' }} />
                <Skeleton variant="rectangular" height={60} width="80%" sx={{ mx: 'auto', borderRadius: 3 }} />
              </Stack>
            </CardContent>
          </Card>
        ) : (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            style={{ width: '100%' }}
          >
            <motion.div
              animate={floatAnimation}
            >
              <Card 
                sx={{ 
                  width: '100%',
                  overflow: 'hidden',
                  borderRadius: 4,
                  boxShadow: '0 20px 60px rgba(0, 0, 0, 0.12), 0 5px 20px rgba(0, 0, 0, 0.08)',
                  background: theme.palette.mode === 'dark' 
                    ? 'linear-gradient(145deg, #1e1e1e 0%, #121212 100%)' 
                    : 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
                  position: 'relative',
                  backdropFilter: 'blur(20px)',
                  border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)'}`,
                }}
              >
                <Box 
                  sx={{ 
                    position: 'absolute', 
                    top: 0, 
                    left: 0, 
                    right: 0, 
                    height: '5px', 
                    background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)` 
                  }} 
                />
                
                <CardContent sx={{ p: 5, textAlign: 'center' }}>
                  <Stack spacing={4} alignItems="center">
                    <motion.div variants={logoVariants}>
                      <Paper
                        elevation={4}
                        sx={{ 
                          width: 100,
                          height: 100,
                          borderRadius: '50%',
                          background: `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.dark} 100%)`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mb: 2,
                          position: 'relative',
                          overflow: 'hidden'
                        }}
                      >
                        {/* Replace the Typography 'A' with your app logo */}
                        <Box sx={{ 
                          position: 'relative', 
                          width: 70, 
                          height: 70, 
                          zIndex: 2 
                        }}>
                          <Image
                            src="/android-chrome-512x512.png"
                            alt="App Logo"
                            layout="fill"
                            objectFit="contain"
                            priority
                          />
                        </Box>
                        
                        {/* Animated circles in the background */}
                        {[...Array(3)].map((_, i) => (
                          <Box
                            key={i}
                            component={motion.div}
                            animate={{
                              scale: [1, 1.2, 1],
                              opacity: [0.3, 0.6, 0.3],
                            }}
                            transition={{
                              duration: 3 + i,
                              repeat: Infinity,
                              ease: "easeInOut"
                            }}
                            sx={{
                              position: 'absolute',
                              width: `${(i + 1) * 30}%`,
                              height: `${(i + 1) * 30}%`,
                              borderRadius: '50%',
                              background: `rgba(255, 255, 255, 0.${3 - i})`,
                              zIndex: 1
                            }}
                          />
                        ))}
                      </Paper>
                    </motion.div>
                    
                    <Box>
                      <motion.div variants={itemVariants}>
                        <Typography 
                          variant="h4" 
                          gutterBottom 
                          sx={{ 
                            fontWeight: 700, 
                            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            mb: 1
                          }}
                        >
                          Welcome to TrackLab
                        </Typography>
                      </motion.div>
                      
                      <motion.div variants={itemVariants}>
                        <Typography 
                          variant="body1" 
                          color="text.secondary"
                          sx={{ mb: 3, maxWidth: '80%', mx: 'auto' }}
                        >
                          Sign in with your Google account to continue your journey
                        </Typography>
                      </motion.div>
                    </Box>
                    
                    <motion.div 
                      variants={itemVariants}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      <Button
                        fullWidth
                        variant="contained"
                        size="large"
                        startIcon={<Google />}
                        onClick={handleGoogleSignIn}
                        disabled={loading}
                        sx={{ 
                          py: 2,
                          px: 6,
                          borderRadius: 3,
                          background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                          '&:hover': {
                            background: `linear-gradient(90deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
                            boxShadow: `0 8px 25px rgba(${parseInt(theme.palette.primary.main.slice(1, 3), 16)}, ${parseInt(theme.palette.primary.main.slice(3, 5), 16)}, ${parseInt(theme.palette.primary.main.slice(5, 7), 16)}, 0.25)`,
                          },
                          position: 'relative',
                          overflow: 'hidden',
                          fontSize: '1.1rem',
                          fontWeight: 600,
                          textTransform: 'none',
                          boxShadow: `0 10px 20px rgba(${parseInt(theme.palette.primary.main.slice(1, 3), 16)}, ${parseInt(theme.palette.primary.main.slice(3, 5), 16)}, ${parseInt(theme.palette.primary.main.slice(5, 7), 16)}, 0.15)`,
                          maxWidth: '80%'
                        }}
                      >
                        {loading ? 'Connecting...' : 'Sign in with Google'}
                        {loading && (
                          <Box
                            component={motion.div}
                            sx={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              right: 0,
                              height: '4px',
                              background: theme.palette.secondary.main,
                            }}
                            animate={{
                              left: ['0%', '100%'],
                              width: ['30%', '30%'],
                            }}
                            transition={{
                              duration: 1.2,
                              repeat: Infinity,
                              ease: 'linear',
                            }}
                          />
                        )}
                      </Button>
                    </motion.div>
                  </Stack>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </Container>
    </>
  );
}