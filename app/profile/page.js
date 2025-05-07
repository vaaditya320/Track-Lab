"use client";
import { useSession, signIn, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  MenuItem, Select, Button, Typography, Box, FormControl, InputLabel, CircularProgress, Alert, Paper, TextField, Grid, Table, TableBody, TableCell, TableContainer, TableRow, useTheme, Avatar, Divider, Card, CardContent
} from "@mui/material";
import SchoolIcon from '@mui/icons-material/School';
import EmailIcon from '@mui/icons-material/Email';
import BadgeIcon from '@mui/icons-material/Badge';
import BusinessIcon from '@mui/icons-material/Business';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import CategoryIcon from '@mui/icons-material/Category';
import GroupIcon from '@mui/icons-material/Group';
import ClassIcon from '@mui/icons-material/Class';

const BRANCHES = [
  { value: "CS", label: "CS" },
  { value: "CSR", label: "CS(R)" },
  { value: "CSAI", label: "CS(AI)" },
  { value: "CSDS", label: "CS(DS)" },
  { value: "AIDS", label: "AIDS" },
  { value: "CSIOT", label: "CS(IOT)" },
];
const SECTIONS = ["A", "B", "C", "D", "E", "F", "G", "H"];
const BATCHES = [
  "A1", "A2", "A3", "B1", "B2", "B3", "C1", "C2", "C3", "D1", "D2", "D3", "E1", "E2", "E3", "F1", "F2", "F3", "G1", "G2", "G3", "H1", "H2", "H3"
];

export default function ProfilePage() {
  const theme = useTheme();
  const { data: session, status, update } = useSession();
  const [branch, setBranch] = useState("");
  const [section, setSection] = useState("");
  const [batch, setBatch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  // Extract non-editable info from session
  const user = session?.user;

  useEffect(() => {
    if (status === "authenticated" && user) {
      setBranch(user.branch || "");
      setSection(user.section || "");
      setBatch(user.batch || "");
      setLoading(false);
    } else if (status === "unauthenticated") {
      router.push("/api/auth/signin");
    }
  }, [status, user]);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        router.push("/");
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [success, router]);

  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSuccess(false);
    try {
      const res = await fetch("/api/users/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ branch, section, batch }),
      });
      if (!res.ok) throw new Error("Failed to save profile info");
      setSuccess(true);
      // Update session so branch, section, batch are available in session.user
      await update();
    } catch (e) {
      setError(e.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  if (loading || status === "loading") {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '80vh',
        bgcolor: 'background.default'
      }}>
        <CircularProgress size={60} thickness={4} />
      </Box>
    );
  }

  if (!user) return null;

  const InfoRow = ({ icon, label, value, editable, children }) => (
    <Box sx={{ 
      display: 'flex', 
      alignItems: 'center', 
      mb: 2,
      p: 2,
      borderRadius: 1,
      bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
      transition: 'all 0.2s ease-in-out',
      '&:hover': {
        bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
      }
    }}>
      <Box sx={{ mr: 2, color: 'primary.main' }}>{icon}</Box>
      <Box sx={{ flex: 1 }}>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          {label}
        </Typography>
        {editable ? children : (
          <Typography variant="body1" fontWeight="medium">
            {value}
          </Typography>
        )}
      </Box>
    </Box>
  );

  return (
    <Box sx={{ 
      maxWidth: 800, 
      mx: 'auto', 
      mt: 4, 
      mb: 8,
      px: 2
    }}>
      <Card elevation={0} sx={{ 
        bgcolor: 'background.paper',
        borderRadius: 2,
        overflow: 'hidden'
      }}>
        <Box sx={{ 
          p: 4, 
          bgcolor: 'primary.main', 
          color: 'primary.contrastText',
          textAlign: 'center'
        }}>
          <Avatar 
            sx={{ 
              width: 80, 
              height: 80, 
              mx: 'auto', 
              mb: 2,
              bgcolor: 'primary.dark'
            }}
          >
            {user.name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase()}
          </Avatar>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            {user.name || 'Student Profile'}
          </Typography>
        </Box>

        <CardContent sx={{ p: 3 }}>
          <InfoRow 
            icon={<BadgeIcon />} 
            label="User ID" 
            value={user.id} 
          />
          <InfoRow 
            icon={<SchoolIcon />} 
            label="Registration ID" 
            value={user.regId} 
          />
          <InfoRow 
            icon={<EmailIcon />} 
            label="Email" 
            value={user.email} 
          />
          <InfoRow 
            icon={<BusinessIcon />} 
            label="Institution" 
            value={user.regId?.includes('piet') ? 'Poornima Institute of Engineering and Technology' : 'Not Specified'} 
          />
          <InfoRow 
            icon={<CalendarTodayIcon />} 
            label="Cohort" 
            value={user.regId?.match(/\d{4}/)?.[0] || 'N/A'} 
          />
          <InfoRow 
            icon={<CategoryIcon />} 
            label="Branch" 
            value={user.branch ? BRANCHES.find(b => b.value === user.branch)?.label || user.branch : ''}
            editable={!user.branch}
          >
            <FormControl fullWidth>
              <InputLabel>Branch</InputLabel>
              <Select 
                value={branch} 
                label="Branch" 
                onChange={e => setBranch(e.target.value)} 
                required
                sx={{ bgcolor: 'background.paper' }}
              >
                {BRANCHES.map(opt => (
                  <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </InfoRow>
          <InfoRow 
            icon={<GroupIcon />} 
            label="Section" 
            value={user.section}
            editable={!user.section}
          >
            <FormControl fullWidth>
              <InputLabel>Section</InputLabel>
              <Select 
                value={section} 
                label="Section" 
                onChange={e => setSection(e.target.value)} 
                required
                sx={{ bgcolor: 'background.paper' }}
              >
                {SECTIONS.map(opt => (
                  <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </InfoRow>
          <InfoRow 
            icon={<ClassIcon />} 
            label="Batch" 
            value={user.batch}
            editable={!user.batch}
          >
            <FormControl fullWidth>
              <InputLabel>Batch</InputLabel>
              <Select 
                value={batch} 
                label="Batch" 
                onChange={e => setBatch(e.target.value)} 
                required
                sx={{ bgcolor: 'background.paper' }}
              >
                {BATCHES.filter(b => b.startsWith(section)).map(opt => (
                  <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </InfoRow>
        </CardContent>

        {error && (
          <Alert severity="error" sx={{ mx: 3, mb: 3 }}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mx: 3, mb: 3 }}>
            Profile updated successfully!
          </Alert>
        )}
        
        {(!user.branch || !user.section || !user.batch) && (
          <Box sx={{ p: 3, pt: 0 }}>
            <Button 
              variant="contained" 
              color="primary" 
              fullWidth 
              onClick={handleSave} 
              disabled={saving || !branch || !section || !batch}
              sx={{ 
                py: 1.5,
                borderRadius: 2,
                textTransform: 'none',
                fontSize: '1.1rem'
              }}
            >
              {saving ? <CircularProgress size={24} /> : "Save Profile"}
            </Button>
          </Box>
        )}
      </Card>
    </Box>
  );
} 