"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import axios from "axios";
import { 
  Container, 
  Typography, 
  Card, 
  CardContent, 
  Grid, 
  Box, 
  Chip, 
  Avatar, 
  LinearProgress, 
  Button,
  Divider,
  Paper,
  Skeleton,
  TableContainer,
  Table,
  TableBody,
  TableRow,
  TableCell
} from "@mui/material";
import { 
  Person as PersonIcon, 
  Email as EmailIcon, 
  Badge as BadgeIcon, 
  School as SchoolIcon,
  KeyboardBackspace as BackIcon,
  Key as KeyIcon,
  CalendarToday as CalendarIcon,
  Info as InfoIcon
} from "@mui/icons-material";
import { motion } from "framer-motion";

// Skeleton Loading Component
const UserDetailsSkeleton = () => {
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Skeleton variant="rectangular" width={100} height={40} />
      </Box>

      <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
        <CardContent>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={4} display="flex" justifyContent="center">
              <Skeleton variant="circular" width={150} height={150} />
            </Grid>
            
            <Grid item xs={12} md={8}>
              <Skeleton variant="text" width="60%" height={50} />
              <Skeleton variant="text" width="40%" height={30} />
              <Skeleton variant="text" width="50%" height={30} />
              <Skeleton variant="text" width="30%" height={30} />
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          <TableContainer>
            <Table>
              <TableBody>
                {[1, 2, 3, 4, 5].map((row) => (
                  <TableRow key={row}>
                    <TableCell width="30%">
                      <Skeleton variant="text" />
                    </TableCell>
                    <TableCell width="70%">
                      <Skeleton variant="text" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Container>
  );
};

export default function UserDetailsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const userId = params.id;

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (status === "authenticated") {
      fetchUserDetails();
    }
  }, [status, userId]);

  const fetchUserDetails = async () => {
    try {
      const response = await axios.get(`/api/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${session.user.id}` }
      });
      setUser(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch user details", error);
      setError("Failed to load user details");
      setLoading(false);
    }
  };

  if (loading) {
    return <UserDetailsSkeleton />;
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography color="error">{error}</Typography>
      </Container>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Button 
          startIcon={<BackIcon />} 
          onClick={() => router.push('/admin/user-roles')}
          sx={{ mb: 3 }}
        >
          Back to User List
        </Button>

        <Card sx={{ 
          borderRadius: 3, 
          boxShadow: 3,
          background: "linear-gradient(145deg, #f0f0f0 0%, #e6e6e6 100%)"
        }}>
          <CardContent>
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} md={4} display="flex" justifyContent="center">
                <Avatar 
                  sx={{ 
                    width: 150, 
                    height: 150, 
                    fontSize: '3rem',
                    background: "linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)",
                    boxShadow: 2
                  }}
                >
                  {user.name.charAt(0).toUpperCase()}
                </Avatar>
              </Grid>
              
              <Grid item xs={12} md={8}>
                <Typography variant="h4" gutterBottom>
                  {user.name}
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <BadgeIcon sx={{ mr: 2, color: 'text.secondary' }} />
                  <Chip 
                    label={user.role} 
                    color={user.role === 'ADMIN' ? 'error' : 'default'}
                    variant="outlined"
                  />
                </Box>
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            <Paper elevation={0} sx={{ p: 3, backgroundColor: 'background.default', borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <InfoIcon sx={{ mr: 2, color: 'text.secondary' }} />
                Detailed Information
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TableContainer>
                    <Table>
                      <TableBody>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 'bold', width: '40%' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <KeyIcon sx={{ mr: 2, color: 'text.secondary' }} />
                              User ID
                            </Box>
                          </TableCell>
                          <TableCell>{user.id}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 'bold' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <PersonIcon sx={{ mr: 2, color: 'text.secondary' }} />
                              Registration ID
                            </Box>
                          </TableCell>
                          <TableCell>{user.regId}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 'bold' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <EmailIcon sx={{ mr: 2, color: 'text.secondary' }} />
                              Email
                            </Box>
                          </TableCell>
                          <TableCell>{user.email}</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TableContainer>
                    <Table>
                      <TableBody>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 'bold', width: '40%' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <SchoolIcon sx={{ mr: 2, color: 'text.secondary' }} />
                              Institution
                            </Box>
                          </TableCell>
                          <TableCell>
                            {user.regId.includes('piet') 
                              ? 'Poornima Institute of Engineering and Technology' 
                              : 'Not Specified'}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 'bold' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <CalendarIcon sx={{ mr: 2, color: 'text.secondary' }} />
                              Cohort
                            </Box>
                          </TableCell>
                          <TableCell>
                            {user.regId.match(/\d{4}/)?.[0] || 'N/A'}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>
              </Grid>
            </Paper>
          </CardContent>
        </Card>
      </Container>
    </motion.div>
  );
}