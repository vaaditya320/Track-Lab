"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box, Container, Typography, Card, CardContent, Grid, 
  Avatar, Chip, CircularProgress, Alert, Button, 
  useTheme, useMediaQuery, Divider
} from "@mui/material";
import { motion } from "framer-motion";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import SupervisedUserCircleIcon from '@mui/icons-material/SupervisedUserCircle';
import EmailIcon from '@mui/icons-material/Email';
import PersonIcon from '@mui/icons-material/Person';

export default function ContactAdmin() {
  const { data: session, status } = useSession();
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/api/auth/signin");
      return;
    }

    if (status === "authenticated") {
      fetchAdmins();
    }
  }, [status, router]);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/users?role=admin");
      
      if (!response.ok) {
        throw new Error("Failed to fetch admins");
      }
      
      const data = await response.json();
      setAdmins(data);
    } catch (error) {
      console.error("Error fetching admins:", error);
      setError("Failed to load admin information. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case "SUPER_ADMIN":
        return <AdminPanelSettingsIcon />;
      case "ADMIN":
        return <SupervisedUserCircleIcon />;
      default:
        return <PersonIcon />;
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case "SUPER_ADMIN":
        return "#FFD700"; // Bright yellow/gold
      case "ADMIN":
        return "#f72585"; // Vibrant pink/magenta
      default:
        return "default";
    }
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case "SUPER_ADMIN":
        return "Super Admin";
      case "ADMIN":
        return "Admin";
      default:
        return role;
    }
  };

  if (status === "loading" || loading) {
    return (
      <Box 
        sx={{ 
          minHeight: '100vh',
          backgroundColor: theme.palette.background.default,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (status === "unauthenticated") {
    return null;
  }

  return (
    <Box 
      sx={{ 
        minHeight: '100vh',
        backgroundColor: theme.palette.background.default,
        pb: 4,
      }}
    >
      <Container maxWidth="lg" sx={{ py: { xs: 2, md: 4 }, px: { xs: 2, sm: 3, md: 4 } }}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={() => router.back()}
              sx={{ borderRadius: 2 }}
            >
              Back
            </Button>
            <Typography 
              variant="h4" 
              fontWeight="bold"
              component={motion.h4}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Contact Administrators
            </Typography>
          </Box>

          {/* Description */}
          <Card 
            sx={{ 
              mb: 4, 
              background: `linear-gradient(135deg, ${theme.palette.primary.main}15, ${theme.palette.primary.light}30)`,
              borderRadius: 2,
            }}
            elevation={0}
          >
            <CardContent sx={{ py: 3 }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Need Help?
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Contact any of the administrators below for assistance with your projects, 
                account issues, or any questions about TrackLab. They are here to help you succeed!
              </Typography>
            </CardContent>
          </Card>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {/* Admins List */}
          {admins.length > 0 ? (
            <Grid container spacing={3}>
              {admins.map((admin, index) => (
                <Grid item xs={12} sm={6} md={4} key={admin.id}>
                  <Card
                    component={motion.div}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    sx={{
                      height: '100%',
                      borderRadius: 2,
                      boxShadow: 2,
                      transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: 4,
                      },
                    }}
                  >
                    <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                      {/* Avatar and Role */}
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Avatar
                          sx={{
                            width: 56,
                            height: 56,
                            bgcolor: getRoleColor(admin.role),
                            color: admin.role === "SUPER_ADMIN" ? "#000000" : "#ffffff",
                            mr: 2,
                            fontWeight: "bold",
                          }}
                        >
                          {getRoleIcon(admin.role)}
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="h6" fontWeight="bold" gutterBottom>
                            {admin.name}
                          </Typography>
                          <Chip
                            icon={getRoleIcon(admin.role)}
                            label={getRoleLabel(admin.role)}
                            size="small"
                            sx={{ 
                              borderRadius: 2,
                              backgroundColor: getRoleColor(admin.role),
                              color: admin.role === "SUPER_ADMIN" ? "#000000" : "#ffffff",
                              fontWeight: "bold",
                              '& .MuiChip-icon': {
                                color: admin.role === "SUPER_ADMIN" ? "#000000" : "#ffffff"
                              }
                            }}
                          />
                        </Box>
                      </Box>

                      <Divider sx={{ my: 2 }} />

                      {/* Contact Information */}
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          Contact Information
                        </Typography>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                          <EmailIcon sx={{ fontSize: 20, color: 'text.secondary', mr: 1 }} />
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              wordBreak: 'break-all',
                              color: 'text.primary'
                            }}
                          >
                            {admin.email}
                          </Typography>
                        </Box>

                        

                        {admin.regId && (
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <PersonIcon sx={{ fontSize: 20, color: 'text.secondary', mr: 1 }} />
                            <Typography variant="body2" color="text.primary">
                              ID: {admin.regId}
                            </Typography>
                          </Box>
                        )}
                      </Box>

                      {/* Action Buttons */}
                      <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                        <Button
                          variant="contained"
                          color="primary"
                          size="small"
                          fullWidth
                          startIcon={<EmailIcon />}
                          onClick={() => window.open(`mailto:${admin.email}`, '_blank')}
                          sx={{ borderRadius: 2 }}
                        >
                          Email
                        </Button>
                        
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Card sx={{ textAlign: 'center', py: 6 }}>
              <CardContent>
                <AdminPanelSettingsIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No Administrators Found
                </Typography>
                <Typography variant="body2" color="text.disabled">
                  There are currently no administrators available. Please try again later.
                </Typography>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </Container>
    </Box>
  );
}
