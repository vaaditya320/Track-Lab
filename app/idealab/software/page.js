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
  IconButton,
  Snackbar,
  Alert,
  Chip
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useState, useEffect } from "react";
import CodeIcon from '@mui/icons-material/Code';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import HomeIcon from '@mui/icons-material/Home';
import DownloadIcon from '@mui/icons-material/Download';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import LightBurnIcon from '@mui/icons-material/FlashOn';
import CuraIcon from '@mui/icons-material/Print';
import EagleIcon from '@mui/icons-material/AccountTree';
import KiCadIcon from '@mui/icons-material/DeveloperBoard';
import ArduinoIcon from '@mui/icons-material/Memory';
import DriverIcon from '@mui/icons-material/Usb';
import EspIcon from '@mui/icons-material/Wifi';

// Software data
const softwareList = [
  {
    id: 'lightburn',
    name: 'LightBurn',
    version: 'v1.7.03',
    description: 'LightBurn is a layout, editing, and control software for laser cutters and engravers.',
    downloadUrl: 'https://release.lightburnsoftware.com/LightBurn/Release/LightBurn-v1.7.03/LightBurn-v1.7.03.exe',
    icon: <LightBurnIcon />,
    color: '#ff652f',
    category: 'Laser Cutting'
  },
  {
    id: 'cura',
    name: 'Ultimaker CURA',
    version: 'v5.8.1',
    description: 'Cura is an open-source 3D printing software used for slicing and preparing models.',
    downloadUrl: 'https://github.com/Ultimaker/Cura/releases/download/5.8.1/UltiMaker-Cura-5.8.1-win64-X64.exe',
    icon: <CuraIcon />,
    color: '#00a0d2',
    category: '3D Printing'
  },
  {
    id: 'eagle',
    name: 'EAGLE CAD',
    version: 'Latest',
    description: 'A powerful schematic capture and PCB design tool.',
    downloadUrl: 'https://drive.google.com/file/d/1vV2OtcTZP7N_WsHSux68uHPBF5lPUW8U/view?usp=sharing',
    icon: <EagleIcon />,
    color: '#f5a623',
    category: 'PCB Design'
  },
  {
    id: 'kicad',
    name: 'KiCAD',
    version: 'v8.0.6',
    description: 'KiCad is an open-source EDA software suite for designing electronic circuit schematics and PCB layouts.',
    downloadUrl: 'https://github.com/KiCad/kicad-source-mirror/releases/download/8.0.6/kicad-8.0.6-x86_64.exe',
    icon: <KiCadIcon />,
    color: '#42b883',
    category: 'PCB Design'
  },
  {
    id: 'arduino',
    name: 'Arduino IDE',
    version: 'Latest',
    description: 'The official integrated development environment for the Arduino platform.',
    downloadUrl: 'https://downloads.arduino.cc/arduino-ide/arduino-ide_latest_Windows_64bit.exe',
    icon: <ArduinoIcon />,
    color: '#00979d',
    category: 'Development'
  },
  {
    id: 'cp210x',
    name: 'CP210x Driver',
    version: 'Latest',
    description: 'USB to UART Bridge VCP Drivers for Windows, macOS, and Linux.',
    downloadUrl: 'https://drive.google.com/file/d/1AqWbpeeSuQ8GS1BfOilbvOyYgZnr0brp/view?usp=drivesdk',
    icon: <DriverIcon />,
    color: '#9c27b0',
    category: 'Drivers'
  },
  {
    id: 'ch340',
    name: 'CH340 Driver',
    version: 'Latest',
    description: 'USB to Serial Drivers for Windows.',
    downloadUrl: 'https://drive.google.com/file/d/16IlGxkzA23RBhG8p1Dc5BjLYNhiKh7oM/view?usp=sharing',
    icon: <DriverIcon />,
    color: '#9c27b0',
    category: 'Drivers'
  },
  {
    id: 'esp32',
    name: 'ESP32 JSON Config',
    version: 'Config',
    description: 'ESP32 JSON configuration file for the Arduino IDE.',
    configUrl: 'https://dl.espressif.com/dl/package_esp32_index.json',
    icon: <EspIcon />,
    color: '#e91e63',
    category: 'Configuration',
    isConfig: true
  },
  {
    id: 'esp8266',
    name: 'ESP8266 JSON Config',
    version: 'Config',
    description: 'ESP8266 JSON configuration file for the Arduino IDE.',
    configUrl: 'http://arduino.esp8266.com/stable/package_esp8266com_index.json',
    icon: <EspIcon />,
    color: '#e91e63',
    category: 'Configuration',
    isConfig: true
  }
];

// Software Card Component
const SoftwareCard = ({ software, index, theme }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [showCopyNotification, setShowCopyNotification] = useState(false);

  const handleCardClick = () => {
    setIsFlipped(!isFlipped);
  };

  const handleDownload = (e) => {
    e.stopPropagation();
    window.open(software.downloadUrl, '_blank');
  };

  const handleCopyConfig = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(software.configUrl).then(() => {
      setShowCopyNotification(true);
      setTimeout(() => setShowCopyNotification(false), 2000);
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      style={{ height: '300px', perspective: '1500px' }}
    >
      <Card
        sx={{
          height: '100%',
          cursor: 'pointer',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          transformStyle: 'preserve-3d',
          transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
          position: 'relative',
          '&:hover': {
            transform: isFlipped ? 'rotateY(180deg) translateY(-5px)' : 'translateY(-5px)',
          }
        }}
        onClick={handleCardClick}
      >
        {/* Front of Card */}
        <CardContent
          sx={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            backfaceVisibility: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'space-between',
            p: 2.5,
            background: `linear-gradient(135deg, ${theme.palette.background.paper}, ${software.color}10)`,
            border: `2px solid ${software.color}30`,
            borderRadius: 2,
            boxSizing: 'border-box',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '4px',
              background: `linear-gradient(90deg, ${software.color}, ${software.color}80)`,
              borderRadius: '8px 8px 0 0',
            }
          }}
        >
          {/* Top Section - Icon, Title, Category */}
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <Box
              sx={{
                width: 60,
                height: 60,
                borderRadius: '50%',
                backgroundColor: software.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '1.5rem',
                mb: 2,
                boxShadow: `0 4px 15px ${software.color}40`
              }}
            >
              {software.icon}
            </Box>
            
            <Typography
              variant="h5"
              fontWeight="bold"
              sx={{
                background: `linear-gradient(45deg, ${software.color}, ${software.color}80)`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textAlign: 'center',
                mb: 1,
                wordBreak: 'break-word'
              }}
            >
              {software.name}
            </Typography>
            
            <Chip
              label={software.category}
              size="small"
              sx={{
                backgroundColor: `${software.color}20`,
                color: software.color,
                fontWeight: 600
              }}
            />
          </Box>
          
          {/* Bottom Section - Download Button */}
          <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
            {software.isConfig ? (
              <Button
                variant="outlined"
                startIcon={<ContentCopyIcon />}
                onClick={(e) => {
                  e.stopPropagation();
                  navigator.clipboard.writeText(software.configUrl).then(() => {
                    setShowCopyNotification(true);
                    setTimeout(() => setShowCopyNotification(false), 2000);
                  });
                }}
                sx={{
                  borderColor: software.color,
                  color: software.color,
                  '&:hover': {
                    borderColor: software.color,
                    backgroundColor: `${software.color}10`,
                  },
                  borderRadius: 2,
                  px: 2,
                  py: 0.5,
                  fontSize: '0.875rem'
                }}
              >
                Copy Link
              </Button>
            ) : (
              <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(software.downloadUrl, '_blank');
                }}
                sx={{
                  borderColor: software.color,
                  color: software.color,
                  '&:hover': {
                    borderColor: software.color,
                    backgroundColor: `${software.color}10`,
                  },
                  borderRadius: 2,
                  px: 2,
                  py: 0.5,
                  fontSize: '0.875rem'
                }}
              >
                Download
              </Button>
            )}
          </Box>
        </CardContent>

        {/* Back of Card */}
        <CardContent
          sx={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            p: 3,
            background: `linear-gradient(135deg, ${theme.palette.background.paper}, ${software.color}05)`,
            border: `2px solid ${software.color}20`,
            borderRadius: 2,
          }}
        >
          <Typography variant="h6" fontWeight="bold" sx={{ mb: 1, textAlign: 'center' }}>
            {software.name} {software.version}
          </Typography>
          
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ textAlign: 'center', mb: 3, lineHeight: 1.5 }}
          >
            {software.description}
          </Typography>
          
          {software.isConfig ? (
            <Button
              variant="contained"
              startIcon={<ContentCopyIcon />}
              onClick={handleCopyConfig}
              sx={{
                backgroundColor: software.color,
                '&:hover': { backgroundColor: software.color },
                borderRadius: 3,
                px: 3,
                py: 1
              }}
            >
              Copy Link
            </Button>
          ) : (
            <Button
              variant="contained"
              startIcon={<DownloadIcon />}
              onClick={handleDownload}
              sx={{
                backgroundColor: software.color,
                '&:hover': { backgroundColor: software.color },
                borderRadius: 3,
                px: 3,
                py: 1
              }}
            >
              Download
            </Button>
          )}
          
          {showCopyNotification && (
            <Snackbar
              open={showCopyNotification}
              autoHideDuration={2000}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
              <Alert severity="success" sx={{ borderRadius: 2 }}>
                Config link copied to clipboard!
              </Alert>
            </Snackbar>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default function SoftwarePage() {
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
            <Typography color="text.primary">Software</Typography>
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
              Idea Lab Softwares
            </Typography>
            <Typography 
              variant="h6" 
              color="text.secondary" 
              sx={{ maxWidth: 600, mx: 'auto' }}
            >
              Download essential software for makers, developers, and innovators
            </Typography>
          </Box>

          {/* Software Grid */}
          <Grid container spacing={3}>
            {softwareList.map((software, index) => (
              <Grid item xs={12} sm={6} md={4} key={software.id}>
                <SoftwareCard 
                  software={software} 
                  index={index} 
                  theme={theme} 
                />
              </Grid>
            ))}
          </Grid>

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
                  Explore, Create & Innovate
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: 800, mx: 'auto' }}>
                  All software downloads are provided for educational and development purposes. 
                  Please ensure you have the appropriate licenses for commercial use.
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
