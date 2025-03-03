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
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import { ThemeProvider } from "@mui/material/styles";
import { theme } from "./theme/trackLabTheme";
import "./globals.css";

// Navigation links - Removed "Projects" as requested
const navLinks = [
  { title: "Dashboard", path: "/", icon: <DashboardIcon /> },
  { title: "Create New", path: "/projects/create", icon: <AddCircleOutlineIcon /> },
];

// Admin panel link - Will only show to admin users
const adminLink = { title: "Admin Panel", path: "/admin", icon: <AdminPanelSettingsIcon /> };

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
  
  // Check if the current user is an admin
  const isAdmin = session?.user?.email === "2023pietcsaaditya003@poornima.org";
  
  // Get links based on user role
  const getLinks = () => {
    if (status === "authenticated" && isAdmin) {
      return [...navLinks, adminLink];
    }
    return navLinks;
  };
  
  const linksToShow = getLinks();
  
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
                {status === "authenticated" && linksToShow.map((link, index) => (
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
                        },
                        // Special styling for admin button
                        ...(link.title === "Admin Panel" && {
                          backgroundColor: 'rgba(255, 255, 255, 0.1)',
                          fontWeight: 'bold',
                        })
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
      
      {/* Mobile Navigation Drawer - Fixed to prevent horizontal scrollbar */}
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
            overflowX: 'hidden', // Prevent horizontal overflow
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
                  bgcolor: theme.palette.primary.main,
                  width: 40,
                  height: 40,
                  mr: 2,
                  flexShrink: 0 // Prevent avatar from shrinking
                }}
              >
                {session?.user?.name?.charAt(0) || "U"}
              </Avatar>
              <Box sx={{ minWidth: 0, width: '100%' }}> {/* Container with proper width constraints */}
                <Typography variant="body1" fontWeight="medium" noWrap>
                  {session?.user?.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" noWrap>
                  {session?.user?.email}
                </Typography>
                {isAdmin && (
                  <Typography variant="body2" sx={{ 
                    color: theme.palette.secondary.main,
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
        <List sx={{ width: '100%' }}>
          {linksToShow.map((link, index) => (
            <ListItem 
              key={link.path} 
              component={Link} 
              href={link.path}
              onClick={handleDrawerToggle}
              sx={{
                borderRadius: 1,
                mx: 1,
                mb: 0.5,
                width: 'auto', // Prevent items from extending beyond container
                '&:hover': {
                  backgroundColor: `${theme.palette.primary.main}15`,
                },
                // Special styling for admin option
                ...(link.title === "Admin Panel" && {
                  backgroundColor: `${theme.palette.secondary.main}15`,
                })
              }}
            >
              <ListItemIcon sx={{ 
                minWidth: 40, 
                color: link.title === "Admin Panel" 
                  ? theme.palette.secondary.main 
                  : theme.palette.primary.main 
              }}>
                {link.icon}
              </ListItemIcon>
              <ListItemText 
                primary={link.title} 
                primaryTypographyProps={{ 
                  noWrap: true,
                  ...(link.title === "Admin Panel" && {
                    fontWeight: 'bold',
                  })
                }} 
              />
            </ListItem>
          ))}
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
                width: 'auto', // Prevent items from extending beyond container
                '&:hover': {
                  backgroundColor: `${theme.palette.error.main}15`,
                }
              }}
            >
              <ListItemIcon sx={{ minWidth: 40, color: theme.palette.error.main }}>
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

// User Account Component with dropdown menu - Simplified to only show sign out
function UserAccount({ status, session }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const isAdmin = session?.user?.email === "2023pietcsaaditya003@poornima.org";
  
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
              border: `2px solid ${isAdmin ? theme.palette.secondary.light : theme.palette.primary.contrastText}`,
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
                bgcolor: isAdmin ? theme.palette.secondary.light : theme.palette.primary.contrastText,
                color: isAdmin ? theme.palette.secondary.contrastText : theme.palette.primary.main,
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
              borderRadius: 1, // Less rounded corners
              mt: 1.5,
              boxShadow: '0px 5px 15px rgba(0, 0, 0, 0.15)',
              minWidth: 200, // Wider menu
              padding: 1, // Added padding
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
                color: theme.palette.secondary.main,
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
              sx={{ py: 1.5 }}
            >
              <ListItemIcon>
                <AdminPanelSettingsIcon fontSize="small" color="secondary" />
              </ListItemIcon>
              <Typography color="secondary.main" fontWeight="medium">Admin Panel</Typography>
            </MenuItem>
          )}
          {/* Only sign out option as requested */}
          <MenuItem 
            component={Link} 
            href="/api/auth/signout" 
            onClick={handleClose}
            sx={{ py: 1.5 }} // Increased item height for better touch targets
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