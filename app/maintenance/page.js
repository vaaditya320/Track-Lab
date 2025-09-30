"use client";

import { Box, Container, Paper, Stack, Typography, Divider } from '@mui/material';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import { motion } from 'framer-motion';

export default function MaintenancePage() {
  // Using MUI and Framer Motion directly in this file per request
  // No separate JSX component is created

  const MotionBox = motion(Box);

  return (
    <Box
      component="main"
      sx={{
        minHeight: '100dvh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        px: { xs: 2, sm: 3 },
        py: { xs: 6, sm: 8 },
        background: (theme) =>
          `radial-gradient(1200px 600px at -10% -10%, ${theme.palette.primary.main}14, transparent 60%),
           radial-gradient(900px 500px at 110% 10%, ${theme.palette.secondary.main}12, transparent 60%),
           linear-gradient(180deg, ${theme.palette.background.default}, ${theme.palette.background.paper})`,
      }}
    >
      {/* Subtle animated background orbs */}
      <MotionBox
        aria-hidden
        sx={{
          position: 'absolute',
          width: 320,
          height: 320,
          borderRadius: '50%',
          filter: 'blur(40px)',
          background: (theme) => theme.palette.primary.main,
          opacity: 0.08,
          top: -80,
          left: -80,
        }}
        animate={{ y: [0, 15, 0], x: [0, 10, 0] }}
        transition={{ duration: 8, ease: 'easeInOut', repeat: Infinity }}
      />
      <MotionBox
        aria-hidden
        sx={{
          position: 'absolute',
          width: 260,
          height: 260,
          borderRadius: '50%',
          filter: 'blur(36px)',
          background: (theme) => theme.palette.secondary.main,
          opacity: 0.08,
          bottom: -60,
          right: -60,
        }}
        animate={{ y: [0, -12, 0], x: [0, -8, 0] }}
        transition={{ duration: 7, ease: 'easeInOut', repeat: Infinity, delay: 0.8 }}
      />

      <Container maxWidth="sm" sx={{ position: 'relative' }}>
        <MotionBox
          initial={{ opacity: 0, y: 16, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <Paper
            elevation={6}
            sx={{
              borderRadius: 3,
              overflow: 'hidden',
              background: (theme) =>
                `linear-gradient(180deg, ${theme.vars ? theme.vars.palette.background.paperChannel : theme.palette.background.paper} 0%, rgba(0,0,0,0) 100%)`,
              backdropFilter: 'saturate(120%) blur(8px)',
            }}
          >
            <Stack spacing={3} sx={{ p: { xs: 3, sm: 4 } }} alignItems="center" textAlign="center">
              <MotionBox
                initial={{ rotate: -8, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 150, damping: 12 }}
                sx={{
                  width: 72,
                  height: 72,
                  borderRadius: '20px',
                  display: 'grid',
                  placeItems: 'center',
                  background: (theme) => theme.palette.primary.main,
                  color: (theme) => theme.palette.primary.contrastText,
                  boxShadow: (theme) => `0 10px 30px ${theme.palette.primary.main}55`,
                }}
              >
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
                >
                  <SettingsRoundedIcon fontSize="large" />
                </motion.div>
              </MotionBox>

              <Stack spacing={1} sx={{ width: '100%' }}>
                <Typography component="h1" variant="h4" fontWeight={700}>
                  Under Maintenance
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  This site is down until further notice. Please check back soon.
                </Typography>
              </Stack>

              <Divider flexItem sx={{ opacity: 0.6 }} />

              <Typography variant="caption" color="text.secondary">
                We appreciate your patience while we improve your experience.
              </Typography>
            </Stack>
          </Paper>
        </MotionBox>
      </Container>
    </Box>
  );
}


