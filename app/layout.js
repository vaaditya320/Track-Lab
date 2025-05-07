"use client"; // Ensure this is a client component

import { useSession, SessionProvider } from "next-auth/react";
import Link from "next/link";
import { Fragment, useState, useEffect } from "react";
import { usePathname } from "next/navigation";
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
  Fade,
  Switch,
  FormControlLabel
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
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import AssignmentIcon from '@mui/icons-material/Assignment';
import Brightness4Icon from '@mui/icons-material/Brightness4'; // Moon icon for dark mode
import Brightness7Icon from '@mui/icons-material/Brightness7'; // Sun icon for light mode
import { ThemeProvider } from "@mui/material/styles";
import { createAppTheme } from "./theme/trackLabTheme"; // Import the theme creator function
import "./globals.css";
import GoogleAnalytics from "@/utils/GoogleAnalytics";

// Navigation links
const navLinks = [
  { title: "Dashboard", path: "/", icon: <DashboardIcon /> },
  { title: "Create New", path: "/projects/create", icon: <AddCircleOutlineIcon /> },
];

// Admin panel link - Will only show to admin users
const adminLink = { title: "Admin Panel", path: "/admin", icon: <AdminPanelSettingsIcon /> };
const assignedProjectsLink = { title: "Assigned Projects", path: "/admin/assigned-projects", icon: <AssignmentIcon /> };

export default function Layout({ children }) {
  // Add state for theme mode
  const [mode, setMode] = useState('light');
  // Add state to control UI rendering
  const [themeLoaded, setThemeLoaded] = useState(false);
  
  // Create theme based on current mode
  const theme = createAppTheme(mode);
  
  // Effect to initialize theme from localStorage if available
  useEffect(() => {
    // Add this script to the document head to prevent flash of white
    const themeScript = document.createElement('script');
    themeScript.innerHTML = `
      (function() {
        try {
          const savedMode = localStorage.getItem('themeMode');
          if (savedMode === 'dark' || (!savedMode && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            document.documentElement.style.backgroundColor = '${theme.palette.background.default}';
            document.body.style.backgroundColor = '${theme.palette.background.default}';
          }
        } catch (e) {}
      })();
    `;
    themeScript.id = 'theme-initializer';
    document.head.appendChild(themeScript);
    
    // Get theme from localStorage
    try {
      const savedMode = localStorage.getItem('themeMode');
      if (savedMode) {
        setMode(savedMode);
      } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        setMode('dark');
      }
    } catch (e) {
      console.error('Error accessing localStorage:', e);
    }
    
    // Set theme as loaded
    setThemeLoaded(true);
    
    return () => {
      // Clean up the script on unmount
      const scriptToRemove = document.getElementById('theme-initializer');
      if (scriptToRemove) {
        document.head.removeChild(scriptToRemove);
      }
    };
  }, []);
  
  // Function to toggle theme
  const toggleThemeMode = () => {
    const newMode = mode === 'light' ? 'dark' : 'light';
    setMode(newMode);
    try {
      localStorage.setItem('themeMode', newMode);
    } catch (e) {
      console.error('Error writing to localStorage:', e);
    }
  };

  return (
    <SessionProvider>
      <ThemeProvider theme={theme}>
        <html lang="en">
          <head>
            <title>TrackLab</title>
            <meta name="description" content="TrackLab helps you manage and track projects efficiently with real-time updates, file uploads, and seamless collaboration." />
            <meta property="og:title" content="TrackLab - Project Tracking Platform" />
            <meta property="og:description" content="TrackLab helps you manage and track projects efficiently with real-time updates, file uploads, and seamless collaboration." />
            <meta property="og:image" content="https://tracklab.aadityavinayak.in.net/android-chrome-512x512.png" />
            <meta property="og:url" content="https://tracklab.aadityavinayak.in.net" />
            <meta property="og:type" content="website" />
            <meta property="og:site_name" content="TrackLab" />
            <meta property="og:locale" content="en_US" />
            <link rel="manifest" href="/manifest.json" />
            <link rel="icon" href="/favicon.ico" />

            {/* Add this to prevent flash of default theme */}
            <style id="theme-initial-css">{`
              body {
                background-color: ${mode === 'dark' ? theme.palette.background.default : '#ffffff'};
                color: ${mode === 'dark' ? theme.palette.text.primary : '#000000'};
                transition: background-color 0.2s ease, color 0.2s ease;
              }
            `}</style>
          </head>
          <body style={{ 
            backgroundColor: theme.palette.background.default, 
            color: theme.palette.text.primary,
            transition: 'background-color 0.2s ease, color 0.2s ease'
          }}>
            <GoogleAnalytics />
            <SpeedInsights />
            <Analytics/>
            <Fragment>
              {/* Conditionally render the UI once theme is loaded */}
              {themeLoaded ? (
                <>
                  <NavigationHeader toggleThemeMode={toggleThemeMode} mode={mode} />
                  
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
                </>
              ) : (
                // Loading placeholder to prevent layout shift
                <div style={{ 
                  height: '100vh', 
                  width: '100%', 
                  backgroundColor: theme.palette.background.default 
                }}></div>
              )}
            </Fragment>
          </body>
        </html>
      </ThemeProvider>
    </SessionProvider>
  );
}

// Enhanced Navigation Header
function NavigationHeader({ toggleThemeMode, mode }) {
  const { data: session, status } = useSession();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [navReady, setNavReady] = useState(false);
  const isMobile = useMediaQuery((theme) => theme.breakpoints.down('md'));
  const pathname = usePathname();
  
  // Check if the current user is an admin
  const isAdmin = session?.user?.role === "ADMIN";
  
  // Get links based on user role
  const getLinks = () => {
    if (status === "authenticated" && isAdmin) {
      return [...navLinks, adminLink, assignedProjectsLink];
    }
    return navLinks;
  };
  
  const linksToShow = getLinks();
  
  // Check if a link is active
  const isActiveLink = (path) => {
    if (path === '/' && pathname === '/') {
      return true;
    }
    return path !== '/' && pathname === path;
  };
  
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
  
  // Set nav as ready after a brief delay to ensure synchronous animation
  useEffect(() => {
    const timer = setTimeout(() => {
      setNavReady(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

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
            ? theme => theme.palette.primary.main
            : theme => `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
          transition: 'all 0.3s ease-in-out',
        }}
      >
        <Container maxWidth="lg">
          <Toolbar disableGutters sx={{ py: 0.5 }}>
            {/* Mobile menu button */}
            {isMobile && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: navReady ? 1 : 0 }}
                transition={{ duration: 0.5 }}
              >
                <IconButton
                  color="inherit"
                  aria-label="open drawer"
                  edge="start"
                  onClick={handleDrawerToggle}
                  sx={{ mr: 2 }}
                >
                  <MenuIcon />
                </IconButton>
              </motion.div>
            )}
            
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: navReady ? 1 : 0, x: navReady ? 0 : -20 }}
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

            {/* All navigation elements in a single container for synchronized animation */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: navReady ? 1 : 0, y: navReady ? 0 : -10 }}
              transition={{ duration: 0.5 }}
              style={{ display: 'flex', alignItems: 'center' }}
            >
              {/* Theme Toggle Button - Desktop */}
              {!isMobile && (
                <Tooltip title={`Switch to ${mode === 'light' ? 'dark' : 'light'} mode`}>
                  <IconButton
                    color="inherit"
                    onClick={toggleThemeMode}
                    sx={{ 
                      mr: 2,
                      transition: 'all 0.2s ease',
                      '&:hover': { 
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      }
                    }}
                  >
                    {mode === 'light' ? <Brightness4Icon /> : <Brightness7Icon />}
                  </IconButton>
                </Tooltip>
              )}
              
              {/* Desktop Navigation Links */}
              {!isMobile && (
                <Box sx={{ display: 'flex', mr: 2 }}>
                  {status === "authenticated" && linksToShow.map((link, index) => {
                    const isActive = isActiveLink(link.path);
                    const isAdminButton = link.title === "Admin Panel";
                    
                    return (
                      <div key={link.path}>
                        <Button
                          component={Link}
                          href={link.path}
                          color="inherit"
                          sx={{ 
                            mx: 0.5,
                            borderRadius: theme => theme.shape.borderRadius,
                            // Admin button always has its special styling
                            ...(isAdminButton && {
                              backgroundColor: isActive 
                                ? theme => `${theme.palette.secondary.main}30` // More visible when active
                                : 'rgba(255, 255, 255, 0.1)',
                              fontWeight: isActive ? 'bold' : 'normal',
                              color: theme => theme.palette.secondary.light,
                            }),
                            // Non-admin buttons get standard active styling
                            ...(!isAdminButton && isActive && {
                              backgroundColor: 'rgba(255, 255, 255, 0.2)',
                              fontWeight: 'bold',
                              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                            }),
                            '&:hover': {
                              backgroundColor: isAdminButton
                                ? isActive 
                                  ? theme => `${theme.palette.secondary.main}40` 
                                  : theme => `${theme.palette.secondary.main}20`
                                : isActive 
                                  ? 'rgba(255, 255, 255, 0.25)' 
                                  : 'rgba(255, 255, 255, 0.1)',
                            }
                          }}
                          startIcon={link.icon}
                        >
                          {link.title}
                        </Button>
                      </div>
                    );
                  })}
                </Box>
              )}
              
              {/* User Account */}
              <UserAccount status={status} session={session} />
            </motion.div>
          </Toolbar>
        </Container>
      </AppBar>
      
      {/* Mobile Navigation Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          '& .MuiDrawer-paper': { 
            width: 240,
            background: theme => theme.palette.background.paper,
            boxSizing: 'border-box',
            overflowX: 'hidden',
          },
        }}
      >
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6" component="div" fontWeight="bold" noWrap>
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
                  bgcolor: theme => theme.palette.primary.main,
                  width: 40,
                  height: 40,
                  mr: 2,
                  flexShrink: 0
                }}
              >
                {session?.user?.name?.charAt(0) || "U"}
              </Avatar>
              <Box sx={{ minWidth: 0, width: '100%' }}>
                <Typography variant="body1" fontWeight="medium" noWrap>
                  {session?.user?.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" noWrap>
                  {session?.user?.email}
                </Typography>
                {isAdmin && (
                  <Typography variant="body2" sx={{ 
                    color: theme => theme.palette.secondary.main,
                    fontWeight: 'bold',
                    mt: 0.5
                  }}>
                    Admin
                  </Typography>
                )}
              </Box>
            </Box>
            <Divider sx={{ my: 1 }} />
          </Box>
        )}
        
        {/* Theme Toggle in Drawer */}
        <Box sx={{ px: 2, pb: 1 }}>
          <FormControlLabel
            control={
              <Switch
                checked={mode === 'dark'}
                onChange={toggleThemeMode}
                color="secondary"
              />
            }
            label={mode === 'dark' ? "Dark Mode" : "Light Mode"}
          />
        </Box>
        <Divider sx={{ mb: 1 }} />
        
        <List sx={{ width: '100%' }}>
          {linksToShow.map((link, index) => {
            const isActive = isActiveLink(link.path);
            const isAdminButton = link.title === "Admin Panel";
            
            return (
              <ListItem 
                key={link.path} 
                component={Link} 
                href={link.path}
                onClick={handleDrawerToggle}
                sx={{
                  borderRadius: 1,
                  mx: 1,
                  mb: 0.5,
                  width: 'auto',
                  // Admin button has special styling
                  ...(isAdminButton && {
                    backgroundColor: isActive
                      ? theme => `${theme.palette.secondary.main}25`
                      : theme => `${theme.palette.secondary.main}15`,
                  }),
                  // Non-admin buttons get standard active styling
                  ...(!isAdminButton && isActive && {
                    backgroundColor: theme => `${theme.palette.primary.main}25`,
                  }),
                  '&:hover': {
                    backgroundColor: isAdminButton
                      ? isActive
                        ? theme => `${theme.palette.secondary.main}35`
                        : theme => `${theme.palette.secondary.main}25`
                      : isActive
                        ? theme => `${theme.palette.primary.main}35`
                        : theme => `${theme.palette.primary.main}15`,
                  }
                }}
              >
                <ListItemIcon sx={{ 
                  minWidth: 40, 
                  color: isAdminButton
                    ? theme => theme.palette.secondary.main
                    : isActive 
                      ? theme => theme.palette.primary.main
                      : theme => theme.palette.text.primary
                }}>
                  {link.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={link.title} 
                  primaryTypographyProps={{ 
                    noWrap: true,
                    fontWeight: isActive ? 'bold' : 'normal',
                    color: isAdminButton ? theme => theme.palette.secondary.main : 'inherit'
                  }} 
                />
              </ListItem>
            );
          })}
        </List>
        <Divider />
        {status === "authenticated" ? (
          <List sx={{ width: '100%' }}>
            <ListItem 
              key="signout"
              component={Link} 
              href="/api/auth/signout"
              onClick={handleDrawerToggle}
              sx={{
                borderRadius: 1,
                mx: 1,
                mb: 0.5,
                width: 'auto',
                '&:hover': {
                  backgroundColor: theme => `${theme.palette.error.main}15`,
                }
              }}
            >
              <ListItemIcon sx={{ minWidth: 40, color: theme => theme.palette.error.main }}>
                <LogoutIcon />
              </ListItemIcon>
              <ListItemText primary="Sign Out" primaryTypographyProps={{ noWrap: true }} />
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

// User Account Component
function UserAccount({ status, session }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const isAdmin = session?.user?.role === "ADMIN";
  const pathname = usePathname();
  
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleClose = () => {
    setAnchorEl(null);
  };

  if (status === "authenticated") {
    return (
      <Box sx={{ ml: 1 }}>
        <Tooltip title="Account">
          <IconButton
            onClick={handleClick}
            size="small"
            aria-controls={open ? 'account-menu' : undefined}
            aria-haspopup="true"
            aria-expanded={open ? 'true' : undefined}
            sx={{ 
              p: 0.5,
              border: theme => `2px solid ${isAdmin ? theme.palette.secondary.light : theme.palette.primary.contrastText}`,
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
                bgcolor: theme => isAdmin ? theme.palette.secondary.light : theme.palette.primary.contrastText,
                color: theme => isAdmin ? theme.palette.secondary.contrastText : theme.palette.primary.main,
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
              borderRadius: 1,
              mt: 1.5,
              boxShadow: '0px 5px 15px rgba(0, 0, 0, 0.15)',
              minWidth: 200,
              padding: 1,
            },
          }}
        >
          <Box sx={{ px: 2, py: 1 }}>
            <Typography variant="subtitle1" fontWeight="medium">
              {session?.user?.name}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ 
              wordBreak: 'break-word',
              maxWidth: '100%'
            }}>
              {session?.user?.email}
            </Typography>
            {isAdmin && (
              <Typography variant="body2" sx={{ 
                color: theme => theme.palette.secondary.main,
                fontWeight: 'bold',
                mt: 0.5
              }}>
                Admin
              </Typography>
            )}
          </Box>
          <Divider sx={{ my: 1 }} />
          {/* Admin Panel link in dropdown for admin users */}
          {isAdmin && (
            <MenuItem 
              component={Link} 
              href="/admin" 
              onClick={handleClose}
              sx={{ 
                py: 1.5,
                // Highlight if on admin page
                ...(pathname === '/admin' && {
                  backgroundColor: theme => `${theme.palette.secondary.main}15`,
                  fontWeight: 'bold'
                })
              }}
            >
              <ListItemIcon>
                <AdminPanelSettingsIcon fontSize="small" color="secondary" />
              </ListItemIcon>
              <Typography color="secondary.main" fontWeight={pathname === '/admin' ? 'bold' : 'medium'}>Admin Panel</Typography>
            </MenuItem>
          )}
          {/* Sign out option */}
          <MenuItem 
            component={Link} 
            href="/api/auth/signout" 
            onClick={handleClose}
            sx={{ py: 1.5 }}
          >
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
    <Button
      component={Link}
      href="/api/auth/signin"
      variant="contained"
      color="secondary"
      sx={{ 
        fontWeight: 600,
        borderRadius: theme => theme.shape.borderRadius,
        px: 2,
        boxShadow: 2
      }}
    >
      Sign In
    </Button>
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
          bgcolor: theme => theme.palette.primary.dark,
          color: "white",
          py: 3,
          borderTopLeftRadius: theme => theme.shape.borderRadius * 2,
          borderTopRightRadius: theme => theme.shape.borderRadius * 2,
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
                  color: "currentColor", 
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