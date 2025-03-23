'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Container, 
  Box, 
  Typography, 
  Button, 
  Paper, 
  useTheme, 
  useMediaQuery, 
  Stack,
  IconButton
} from '@mui/material';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { signOut } from 'next-auth/react';
import { 
  SentimentVeryDissatisfied, 
  SentimentDissatisfied, 
  SentimentNeutral, 
  SentimentSatisfied, 
  SentimentVerySatisfied 
} from '@mui/icons-material';

const stayMessages = [
  {
    text: "Don't go! The code will miss you!",
    emoji: "💻",
    mood: "very_sad"
  },
  {
    text: "But... but... who will debug the bugs?",
    emoji: "🐛",
    mood: "sad"
  },
  {
    text: "The server is crying!",
    emoji: "😢",
    mood: "very_sad"
  },
  {
    text: "Your data will be lonely!",
    emoji: "📊",
    mood: "sad"
  },
  {
    text: "The database will miss your queries!",
    emoji: "🗄️",
    mood: "neutral"
  },
  {
    text: "The cache will be empty without you!",
    emoji: "🧠",
    mood: "sad"
  },
  {
    text: "The API endpoints will be so bored!",
    emoji: "🔌",
    mood: "neutral"
  },
  {
    text: "The logs will be so quiet!",
    emoji: "📝",
    mood: "sad"
  },
  {
    text: "The database indexes will be sad!",
    emoji: "📑",
    mood: "sad"
  },
  {
    text: "The cookies will go stale!",
    emoji: "🍪",
    mood: "very_sad"
  },
  {
    text: "The session will be so empty!",
    emoji: "🪑",
    mood: "sad"
  },
  {
    text: "The authentication will be lonely!",
    emoji: "🔐",
    mood: "neutral"
  },
  {
    text: "The middleware will miss you!",
    emoji: "⚙️",
    mood: "sad"
  },
  {
    text: "The routes will be so quiet!",
    emoji: "🛣️",
    mood: "neutral"
  },
  {
    text: "The components will be incomplete!",
    emoji: "🧩",
    mood: "sad"
  }
];

const moodIcons = {
  very_sad: SentimentVeryDissatisfied,
  sad: SentimentDissatisfied,
  neutral: SentimentNeutral,
  satisfied: SentimentSatisfied,
  very_satisfied: SentimentVerySatisfied
};

export default function SignOutPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [messageIndex, setMessageIndex] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % stayMessages.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const handleSignOut = async () => {
    setIsLoading(true);
    setShowConfetti(true);
    try {
      await signOut({ redirect: false });
      setTimeout(() => {
        router.push('/');
      }, 2000);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: -50 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.6,
        when: "beforeChildren",
        staggerChildren: 0.2
      }
    }
  };

  const childVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.4 }
    }
  };

  const messageVariants = {
    enter: { opacity: 0, y: 20 },
    center: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  };

  const buttonVariants = {
    hover: { 
      scale: 1.05,
      transition: { 
        duration: 0.2,
        yoyo: Infinity,
        yoyoEase: "easeInOut"
      }
    },
    tap: { scale: 0.95 }
  };

  const MoodIcon = moodIcons[stayMessages[messageIndex].mood];

  return (
    <Container maxWidth="md">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          py: 8,
        }}
      >
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          style={{ width: '100%' }}
        >
          <Paper 
            elevation={4}
            sx={{ 
              p: isMobile ? 3 : 5, 
              maxWidth: 600, 
              width: '100%',
              mx: 'auto',
              position: 'relative',
              overflow: 'hidden',
              borderRadius: 4,
              background: theme.palette.mode === 'dark' 
                ? 'linear-gradient(145deg, #1e1e1e 0%, #121212 100%)' 
                : 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
              border: `1px solid ${theme.palette.mode === 'dark' ? '#2b3fbb22' : '#6588ff22'}`,
            }}
          >
            {/* Decorative elements */}
            <Box
              component={motion.div}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.1 }}
              sx={{
                position: 'absolute',
                top: -100,
                right: -100,
                width: 300,
                height: 300,
                borderRadius: '50%',
                background: `radial-gradient(circle, ${theme.palette.primary.main} 0%, transparent 70%)`,
              }}
            />
            
            <Box
              component={motion.div}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.1 }}
              sx={{
                position: 'absolute',
                bottom: -80,
                left: -80,
                width: 250,
                height: 250,
                borderRadius: '50%',
                background: `radial-gradient(circle, ${theme.palette.secondary.main} 0%, transparent 70%)`,
              }}
            />

            <motion.div variants={childVariants}>
              <Typography 
                variant="h4" 
                component="h1" 
                color="primary" 
                gutterBottom
                sx={{ 
                  textAlign: 'center',
                  position: 'relative',
                  fontWeight: 800,
                  mb: 3
                }}
              >
                Wait! Don't Leave Us! 🥺
              </Typography>
            </motion.div>

            <motion.div variants={childVariants}>
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center',
                mb: 2
              }}>
                <MoodIcon 
                  sx={{ 
                    fontSize: 48, 
                    color: theme.palette.primary.main,
                    animation: 'bounce 1s infinite'
                  }} 
                />
              </Box>
              <AnimatePresence mode="wait">
                <motion.div
                  key={messageIndex}
                  variants={messageVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.5 }}
                >
                  <Typography 
                    variant="h6" 
                    component="p" 
                    color="text.secondary" 
                    sx={{ 
                      textAlign: 'center',
                      mb: 4,
                      maxWidth: 450,
                      mx: 'auto',
                      lineHeight: 1.6
                    }}
                  >
                    {stayMessages[messageIndex].emoji} {stayMessages[messageIndex].text}
                  </Typography>
                </motion.div>
              </AnimatePresence>
            </motion.div>

            <motion.div 
              variants={childVariants}
              style={{ 
                display: 'flex', 
                flexDirection: 'column',
                gap: 2,
                alignItems: 'center',
                marginTop: 24
              }}
            >
              <motion.div
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
              >
                <Button
                  onClick={handleSignOut}
                  variant="contained" 
                  color="primary"
                  size="large"
                  disabled={isLoading}
                  sx={{ 
                    px: 4, 
                    py: 1.5,
                    fontSize: '1rem',
                    boxShadow: '0 8px 16px rgba(67, 97, 238, 0.15)',
                    background: showConfetti ? 'linear-gradient(45deg, #FF6B6B 30%, #FF8E53 90%)' : undefined,
                    transition: 'all 0.3s ease-in-out',
                    '&:hover': {
                      background: showConfetti ? 'linear-gradient(45deg, #FF8E53 30%, #FF6B6B 90%)' : undefined,
                    }
                  }}
                >
                  {isLoading ? "Signing Out..." : "I'm Leaving Anyway"}
                </Button>
              </motion.div>
            </motion.div>
          </Paper>
        </motion.div>
      </Box>

      <style jsx global>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
    </Container>
  );
}