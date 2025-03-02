"use client"; // Ensure this is a client component

import { useSession, SessionProvider } from "next-auth/react";
import Link from "next/link";
import { Fragment, useState, useEffect } from "react";
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Container, 
  Box,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  useMediaQuery,
  Tooltip,
  Fade
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/react";
import DashboardIcon from '@mui/icons-material/Dashboard';
import PersonIcon from '@mui/icons-material/Person';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import AssignmentIcon from '@mui/icons-material/Assignment';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { ThemeProvider } from "@mui/material/styles";
import { theme } from "./theme/trackLabTheme";
import "./globals.css";

// Navigation links
const navLinks = [
  { title: "Dashboard", path: "/", icon: <DashboardIcon /> },
  { title: "Projects", path: "/projects", icon: <AssignmentIcon /> },
  { title: "Create New", path: "/projects/create", icon: <AddCircleOutlineIcon /> },
];

export default function Layout({ children }) {
  return (
    <SessionProvider>
      <ThemeProvider theme={theme}>
        <html lang="en">
          <body>
            <SpeedInsights />
            <Analytics/>
            <Fragment>
              <NavigationHeader />
              
              {/* Main content with animation */}
              <motion.main
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                style={{
                  minHeight: 'calc(100vh - 160px)', // Account for header and footer
                  background: theme.palette.background.default,
                  paddingTop: '1rem',
                  paddingBottom: '2rem'
                }}
              >
                {children}
              </motion.main>
              
              <EnhancedFooter />
            </Fragment>
          </body>
        </html>
      </ThemeProvider>
    </SessionProvider>
  );
}

// Enhanced Navigation Header
function NavigationHeader() {
  const { data: session, status } = useSession();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [scrolled]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <>
      <AppBar 
        position="sticky" 
        elevation={scrolled ? 4 : 0}
        color="primary"
        sx={{
          background: scrolled 
            ? theme.palette.primary.main
            : `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
          transition: 'all 0.3s ease-in-out',
        }}
      >
        <Container maxWidth="lg">
          <Toolbar disableGutters sx={{ py: 0.5 }}>
            {/* Mobile menu button */}
            {isMobile && (
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                onClick={handleDrawerToggle}
                sx={{ mr: 2 }}
              >
                <MenuIcon />
              </IconButton>
            )}
            
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Typography 
                variant="h5" 
                component={Link} 
                href="/" 
                sx={{ 
                  flexGrow: 1, 
                  textDecoration: "none", 
                  color: "inherit",
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                TrackLab
              </Typography>
            </motion.div>
            
            <Box sx={{ flexGrow: 1 }} />
            
            {/* Desktop Navigation Links */}
            {!isMobile && (
              <Box sx={{ display: 'flex', mr: 2 }}>
                {status === "authenticated" && navLinks.map((link, index) => (
                  <motion.div
                    key={link.path}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <Button
                      component={Link}
                      href={link.path}
                      color="inherit"
                      sx={{ 
                        mx: 0.5,
                        borderRadius: theme.shape.borderRadius,
                        '&:hover': {
                          backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        }
                      }}
                      startIcon={link.icon}
                    >
                      {link.title}
                    </Button>
                  </motion.div>
                ))}
              </Box>
            )}
            
            {/* User Account */}
            <UserAccount status={status} session={session} />
          </Toolbar>
        </Container>
      </AppBar>
      
      {/* Mobile Navigation Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better mobile performance
        }}
        sx={{
          '& .MuiDrawer-paper': { 
            width: 240,
            background: theme.palette.background.paper,
            boxSizing: 'border-box',
          },
        }}
      >
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6" component="div" fontWeight="bold">
            TrackLab
          </Typography>
          <IconButton onClick={handleDrawerToggle}>
            <CloseIcon />
          </IconButton>
        </Box>
        <Divider />
        {status === "authenticated" && (
          <Box sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar 
                sx={{ 
                  bgcolor: theme.palette.primary.main,
                  width: 40,
                  height: 40,
                  mr: 2
                }}
              >
                {session?.user?.name?.charAt(0) || "U"}
              </Avatar>
              <Box>
                <Typography variant="body1" fontWeight="medium">
                  {session?.user?.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" noWrap>
                  {session?.user?.email}
                </Typography>
              </Box>
            </Box>
            <Divider sx={{ my: 1 }} />
          </Box>
        )}
        <List>
          {navLinks.map((link, index) => (
            <ListItem 
              key={link.path} 
              component={Link} 
              href={link.path}
              onClick={handleDrawerToggle}
              sx={{
                borderRadius: 1,
                mx: 1,
                mb: 0.5,
                '&:hover': {
                  backgroundColor: `${theme.palette.primary.main}15`,
                }
              }}
            >
              <ListItemIcon sx={{ minWidth: 40, color: theme.palette.primary.main }}>
                {link.icon}
              </ListItemIcon>
              <ListItemText primary={link.title} />
            </ListItem>
          ))}
        </List>
        <Divider />
        {status === "authenticated" ? (
          <List>
            <ListItem 
              key="profile"
              component={Link} 
              href="/profile"
              onClick={handleDrawerToggle}
              sx={{
                borderRadius: 1,
                mx: 1,
                mb: 0.5,
                '&:hover': {
                  backgroundColor: `${theme.palette.primary.main}15`,
                }
              }}
            >
              <ListItemIcon sx={{ minWidth: 40, color: theme.palette.primary.main }}>
                <PersonIcon />
              </ListItemIcon>
              <ListItemText primary="Profile" />
            </ListItem>
            <ListItem 
              key="settings"
              component={Link} 
              href="/settings"
              onClick={handleDrawerToggle}
              sx={{
                borderRadius: 1,
                mx: 1,
                mb: 0.5,
                '&:hover': {
                  backgroundColor: `${theme.palette.primary.main}15`,
                }
              }}
            >
              <ListItemIcon sx={{ minWidth: 40, color: theme.palette.primary.main }}>
                <SettingsIcon />
              </ListItemIcon>
              <ListItemText primary="Settings" />
            </ListItem>
            <ListItem 
              key="signout"
              component={Link} 
              href="/api/auth/signout"
              onClick={handleDrawerToggle}
              sx={{
                borderRadius: 1,
                mx: 1,
                mb: 0.5,
                '&:hover': {
                  backgroundColor: `${theme.palette.error.main}15`,
                }
              }}
            >
              <ListItemIcon sx={{ minWidth: 40, color: theme.palette.error.main }}>
                <LogoutIcon />
              </ListItemIcon>
              <ListItemText primary="Sign Out" />
            </ListItem>
          </List>
        ) : (
          <Box sx={{ p: 2 }}>
            <Button
              component={Link}
              href="/api/auth/signin"
              variant="contained"
              color="primary"
              fullWidth
              sx={{ mt: 1 }}
            >
              Sign In
            </Button>
          </Box>
        )}
      </Drawer>
    </>
  );
}

// User Account Component with dropdown menu
function UserAccount({ status, session }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleClose = () => {
    setAnchorEl(null);
  };

  if (status === "authenticated") {
    return (
      <Box sx={{ ml: 1 }}>
        <Tooltip title="Account settings">
          <IconButton
            onClick={handleClick}
            size="small"
            aria-controls={open ? 'account-menu' : undefined}
            aria-haspopup="true"
            aria-expanded={open ? 'true' : undefined}
            sx={{ 
              p: 0.5,
              border: `2px solid ${theme.palette.primary.contrastText}`,
              transition: 'all 0.2s ease',
              '&:hover': { 
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
              }
            }}
          >
            <Avatar 
              sx={{ 
                width: 32, 
                height: 32,
                bgcolor: theme.palette.primary.contrastText,
                color: theme.palette.primary.main,
                fontWeight: 'bold',
              }}
            >
              {session?.user?.name?.charAt(0) || "U"}
            </Avatar>
          </IconButton>
        </Tooltip>
        <Menu
          anchorEl={anchorEl}
          id="account-menu"
          open={open}
          onClose={handleClose}
          onClick={handleClose}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          TransitionComponent={Fade}
          sx={{
            '& .MuiPaper-root': {
              borderRadius: theme.shape.borderRadius,
              mt: 1.5,
              boxShadow: '0px 5px 15px rgba(0, 0, 0, 0.15)',
              minWidth: 180,
            },
          }}
        >
          <Box sx={{ px: 2, py: 1 }}>
            <Typography variant="subtitle2" fontWeight="medium">
              {session?.user?.name}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ wordBreak: 'break-all' }}>
              {session?.user?.email}
            </Typography>
          </Box>
          <Divider />
          <MenuItem component={Link} href="/profile" onClick={handleClose}>
            <ListItemIcon>
              <PersonIcon fontSize="small" />
            </ListItemIcon>
            Profile
          </MenuItem>
          <MenuItem component={Link} href="/settings" onClick={handleClose}>
            <ListItemIcon>
              <SettingsIcon fontSize="small" />
            </ListItemIcon>
            Settings
          </MenuItem>
          <Divider />
          <MenuItem component={Link} href="/api/auth/signout" onClick={handleClose}>
            <ListItemIcon>
              <LogoutIcon fontSize="small" color="error" />
            </ListItemIcon>
            <Typography color="error">Sign out</Typography>
          </MenuItem>
        </Menu>
      </Box>
    );
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Button
        component={Link}
        href="/api/auth/signin"
        variant="contained"
        color="secondary"
        sx={{ 
          fontWeight: 600,
          borderRadius: theme.shape.borderRadius,
          px: 2,
          boxShadow: 2
        }}
      >
        Sign In
      </Button>
    </motion.div>
  );
}

// Enhanced Footer Component
function EnhancedFooter() {
  const currentYear = new Date().getFullYear();
  
  return (
    <motion.footer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <Box
        sx={{
          bgcolor: theme.palette.primary.dark,
          color: "white",
          py: 3,
          borderTopLeftRadius: theme.shape.borderRadius * 2,
          borderTopRightRadius: theme.shape.borderRadius * 2,
          mt: 6,
          boxShadow: '0px -4px 10px rgba(0, 0, 0, 0.1)',
        }}
      >
        <Container maxWidth="lg">
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Box sx={{ mb: { xs: 2, md: 0 } }}>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                TrackLab
              </Typography>
              <Typography variant="body2" color="rgba(255, 255, 255, 0.7)">
                Track, manage, and submit your projects with ease.
              </Typography>
            </Box>
            
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: { xs: "center", md: "flex-end" },
              }}
            >
              <Typography variant="body2" sx={{ mb: 1 }}>
                &copy; {currentYear} TrackLab. All rights reserved.
              </Typography>
              <Link
                href="https://aadityavinayak.in.net"
                target="_blank"
                style={{ 
                  color: theme.palette.secondary.light, 
                  textDecoration: "none", 
                  fontWeight: "bold" 
                }}
              >
                Developed & Maintained by Aaditya Vinayak
              </Link>
            </Box>
          </Box>
        </Container>
      </Box>
    </motion.footer>
  );
}