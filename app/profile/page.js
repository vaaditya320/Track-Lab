"use client";
import { useSession, signIn, signOut } from "next-auth/react";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  MenuItem, Select, Button, Typography, Box, FormControl, InputLabel, CircularProgress, Alert, Paper, TextField, Grid, Table, TableBody, TableCell, TableContainer, TableRow, useTheme, Avatar, Divider, Card, CardContent, InputAdornment
} from "@mui/material";
import SchoolIcon from '@mui/icons-material/School';
import EmailIcon from '@mui/icons-material/Email';
import BadgeIcon from '@mui/icons-material/Badge';
import BusinessIcon from '@mui/icons-material/Business';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import CategoryIcon from '@mui/icons-material/Category';
import GroupIcon from '@mui/icons-material/Group';
import ClassIcon from '@mui/icons-material/Class';
import PersonIcon from '@mui/icons-material/Person';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import PhoneIphoneIcon from '@mui/icons-material/PhoneIphone';
import { motion, AnimatePresence } from "framer-motion";

const BRANCHES = [
  { value: "CS", label: "CS" },
  { value: "CSR", label: "CS(R)" },
  { value: "CSAI", label: "CS(AI)" },
  { value: "CSDS", label: "CS(DS)" },
  { value: "AIDS", label: "AIDS" },
  { value: "CSIOT", label: "CS(IOT)" },
  { value: "EC", label: "EC" },
];
const SECTIONS = ["A", "B", "C", "D", "E", "F", "G", "H", "I"];
const BATCHES = [
  "A1", "A2", "A3", "B1", "B2", "B3", "C1", "C2", "C3", "D1", "D2", "D3", "E1", "E2", "E3", "F1", "F2", "F3", "G1", "G2", "G3", "H1", "H2", "H3", "I1", "I2", "I3"
];

// Loading skeleton component
const ProfileSkeleton = () => {
  const theme = useTheme();
  
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
          <motion.div 
            animate={{ opacity: [0.5, 0.8, 0.5] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          >
            <Box sx={{ 
              width: 80, 
              height: 80, 
              mx: 'auto', 
              mb: 2,
              borderRadius: '50%',
              bgcolor: 'rgba(255,255,255,0.2)'
            }} />
            <Box sx={{ 
              height: 32, 
              width: '60%', 
              mx: 'auto',
              bgcolor: 'rgba(255,255,255,0.2)',
              borderRadius: 1,
              mb: 1
            }} />
          </motion.div>
        </Box>

        <CardContent sx={{ p: 3 }}>
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <motion.div
              key={i}
              animate={{ opacity: [0.5, 0.8, 0.5] }}
              transition={{ repeat: Infinity, duration: 1.5, delay: i * 0.1 }}
            >
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                mb: 2,
                p: 2,
                borderRadius: 1,
                bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
              }}>
                <Box sx={{ 
                  width: 24, 
                  height: 24, 
                  mr: 2,
                  borderRadius: '50%',
                  bgcolor: 'action.hover'
                }} />
                <Box sx={{ flex: 1 }}>
                  <Box sx={{ 
                    height: 20, 
                    width: '30%', 
                    bgcolor: 'action.hover',
                    borderRadius: 1,
                    mb: 1
                  }} />
                  <Box sx={{ 
                    height: 24, 
                    width: '60%', 
                    bgcolor: 'action.hover',
                    borderRadius: 1
                  }} />
                </Box>
              </Box>
            </motion.div>
          ))}

          <Box sx={{ p: 3, pt: 0 }}>
            <motion.div
              animate={{ opacity: [0.5, 0.8, 0.5] }}
              transition={{ repeat: Infinity, duration: 1.5, delay: 0.8 }}
            >
              <Box sx={{ 
                height: 48,
                bgcolor: 'action.hover',
                borderRadius: 2
              }} />
            </motion.div>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

const InfoRow = ({ icon, label, value, editable, children, theme }) => (
  <div>
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
        transform: 'translateY(-2px)',
        boxShadow: theme.palette.mode === 'dark' 
          ? '0 4px 12px rgba(0,0,0,0.2)' 
          : '0 4px 12px rgba(0,0,0,0.05)'
      }
    }}>
      <Box sx={{ 
        mr: 2, 
        color: 'primary.main',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 40,
        height: 40,
        borderRadius: '50%',
        bgcolor: theme.palette.mode === 'dark' 
          ? 'rgba(255, 255, 255, 0.05)' 
          : 'rgba(0, 0, 0, 0.02)'
      }}>
        {icon}
      </Box>
      <Box sx={{ flex: 1 }}>
        <Typography 
          variant="subtitle2" 
          color="text.secondary" 
          gutterBottom
          sx={{ 
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}
        >
          {label}
          {editable && (
            <EditIcon 
              sx={{ 
                fontSize: 16,
                color: 'primary.main',
                opacity: 0.7
              }} 
            />
          )}
        </Typography>
        {editable ? children : (
          <Typography 
            variant="body1" 
            fontWeight="medium"
            sx={{
              color: theme.palette.mode === 'dark' 
                ? 'rgba(255, 255, 255, 0.9)' 
                : 'text.primary'
            }}
          >
            {value}
          </Typography>
        )}
      </Box>
    </Box>
  </div>
);

export default function ProfilePage() {
  const theme = useTheme();
  const { data: session, status, update } = useSession();
  const [branch, setBranch] = useState("");
  const [section, setSection] = useState("");
  const [batch, setBatch] = useState("");
  const [phoneDigits, setPhoneDigits] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const initializedRef = useRef(false);

  // Extract non-editable info from session
  const user = session?.user;

  useEffect(() => {
    if (status === "authenticated" && user && !initializedRef.current) {
      setBranch(user.branch || "");
      setSection(user.section || "");
      setBatch(user.batch || "");
      const existing = user.phoneNumber || "";
      const digitsOnly = existing.replace(/[^0-9]/g, "");
      const normalized = digitsOnly.startsWith("91") ? digitsOnly.slice(2) : digitsOnly;
      setPhoneDigits(normalized.slice(0, 10));
      setLoading(false);
      initializedRef.current = true;
    } else if (status === "unauthenticated") {
      router.push("/api/auth/signin");
    }
  }, [status, user, router]);

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
        body: JSON.stringify({ branch, section, batch, phoneNumber: phoneDigits || null }),
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
    return <ProfileSkeleton />;
  }

  if (!user) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
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
          overflow: 'hidden',
          boxShadow: theme.palette.mode === 'dark' ? '0 0 20px rgba(0,0,0,0.3)' : '0 0 20px rgba(0,0,0,0.05)'
        }}>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Box sx={{ 
              p: 4, 
              bgcolor: 'primary.main', 
              color: 'primary.contrastText',
              textAlign: 'center',
              position: 'relative',
              background: theme.palette.mode === 'dark'
                ? 'linear-gradient(45deg, #1a237e 30%, #0d47a1 90%)'
                : 'linear-gradient(45deg, #1976d2 30%, #2196f3 90%)'
            }}>
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <Avatar 
                  sx={{ 
                    width: 80, 
                    height: 80, 
                    mx: 'auto', 
                    mb: 2,
                    bgcolor: 'primary.dark',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                    border: '3px solid rgba(255,255,255,0.2)'
                  }}
                >
                  {user.name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase()}
                </Avatar>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <Typography variant="h5" fontWeight="bold" gutterBottom>
                  {user.name || 'Student Profile'}
                </Typography>
                <Typography 
                  variant="subtitle1" 
                  sx={{ 
                    opacity: 0.9,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 1
                  }}
                >
                  <PersonIcon fontSize="small" />
                  {user.role || 'Student'}
                </Typography>
              </motion.div>
            </Box>
          </motion.div>

          <CardContent sx={{ p: 3 }}>
            <AnimatePresence>
              {error && (
                <motion.div
                  key="error-alert"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <Alert 
                    severity="error" 
                    sx={{ 
                      mb: 3,
                      borderRadius: 2,
                      boxShadow: theme.palette.mode === 'dark' 
                        ? '0 4px 12px rgba(0,0,0,0.2)' 
                        : '0 4px 12px rgba(0,0,0,0.05)'
                    }}
                  >
                    {error}
                  </Alert>
                </motion.div>
              )}
              {success && (
                <motion.div
                  key="success-alert"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <Alert 
                    severity="success" 
                    sx={{ 
                      mb: 3,
                      borderRadius: 2,
                      boxShadow: theme.palette.mode === 'dark' 
                        ? '0 4px 12px rgba(0,0,0,0.2)' 
                        : '0 4px 12px rgba(0,0,0,0.05)'
                    }}
                  >
                    Profile updated successfully!
                  </Alert>
                </motion.div>
              )}
            </AnimatePresence>

            <InfoRow 
              icon={<BadgeIcon />} 
              label="User ID" 
              value={user.id} 
              theme={theme}
            />
            <InfoRow 
              icon={<SchoolIcon />} 
              label="Registration ID" 
              value={user.regId} 
              theme={theme}
            />
            <InfoRow 
              icon={<EmailIcon />} 
              label="Email" 
              value={user.email} 
              theme={theme}
            />
            <InfoRow 
              icon={<BusinessIcon />} 
              label="Institution" 
              value={user.regId?.includes('piet') ? 'Poornima Institute of Engineering and Technology' : 'Not Specified'} 
              theme={theme}
            />
            <InfoRow 
              icon={<CalendarTodayIcon />} 
              label="Cohort" 
              value={user.regId?.match(/\d{4}/)?.[0] || 'N/A'} 
              theme={theme}
            />
            <InfoRow 
              icon={<CategoryIcon />} 
              label="Branch" 
              value={user.branch ? BRANCHES.find(b => b.value === user.branch)?.label || user.branch : ''}
              editable={!user.branch}
              theme={theme}
            >
              <FormControl fullWidth>
                <InputLabel>Branch</InputLabel>
                <Select 
                  value={branch} 
                  label="Branch" 
                  onChange={e => setBranch(e.target.value)} 
                  required
                  sx={{ 
                    bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'background.paper',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : undefined
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.2)' : undefined
                    }
                  }}
                >
                  {BRANCHES.map(opt => (
                    <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </InfoRow>
            <InfoRow 
              icon={<PhoneIphoneIcon />} 
              label="Phone Number" 
              value={user.phoneNumber || ''}
              editable={true}
              theme={theme}
            >
              {!user.phoneNumber ? (
                <TextField 
                  fullWidth 
                  type="tel"
                  value={phoneDigits}
                  onChange={(e) => {
                    const digits = (e.target.value || '').replace(/\D/g, '').slice(0, 10);
                    setPhoneDigits(digits);
                  }}
                  inputProps={{ inputMode: 'numeric' }}
                  placeholder="9929575464"
                  InputProps={{ startAdornment: <InputAdornment position="start">+91</InputAdornment> }}
                />
              ) : (
                <Typography 
                  variant="body1" 
                  fontWeight="medium"
                  sx={{
                    color: theme.palette.mode === 'dark' 
                      ? 'rgba(255, 255, 255, 0.9)' 
                      : 'text.primary'
                  }}
                >
                  {user.phoneNumber}
                </Typography>
              )}
            </InfoRow>
            <InfoRow 
              icon={<GroupIcon />} 
              label="Section" 
              value={user.section}
              editable={!user.section}
              theme={theme}
            >
              <FormControl fullWidth>
                <InputLabel>Section</InputLabel>
                <Select 
                  value={section} 
                  label="Section" 
                  onChange={e => setSection(e.target.value)} 
                  required
                  sx={{ 
                    bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'background.paper',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : undefined
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.2)' : undefined
                    }
                  }}
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
              theme={theme}
            >
              <FormControl fullWidth>
                <InputLabel>Batch</InputLabel>
                <Select 
                  value={batch} 
                  label="Batch" 
                  onChange={e => setBatch(e.target.value)} 
                  required
                  sx={{ 
                    bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'background.paper',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : undefined
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.2)' : undefined
                    }
                  }}
                >
                  {BATCHES.filter(b => b.startsWith(section)).map(opt => (
                    <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </InfoRow>
          </CardContent>

          {(!user.branch || !user.section || !user.batch || !user.phoneNumber) && (
            <Box sx={{ p: 3, pt: 0 }}>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button 
                  variant="contained" 
                  color="primary" 
                  fullWidth 
                  onClick={handleSave} 
                  disabled={saving || !branch || !section || !batch || !(phoneDigits && /^\d{10}$/.test(phoneDigits))}
                  sx={{ 
                    py: 1.5,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontSize: '1.1rem',
                    boxShadow: theme.palette.mode === 'dark' ? '0 4px 12px rgba(0,0,0,0.3)' : '0 4px 12px rgba(0,0,0,0.1)',
                    background: theme.palette.mode === 'dark'
                      ? 'linear-gradient(45deg, #1a237e 30%, #0d47a1 90%)'
                      : 'linear-gradient(45deg, #1976d2 30%, #2196f3 90%)',
                    '&:hover': {
                      background: theme.palette.mode === 'dark'
                        ? 'linear-gradient(45deg, #0d47a1 30%, #1565c0 90%)'
                        : 'linear-gradient(45deg, #1565c0 30%, #1976d2 90%)'
                    }
                  }}
                >
                  {saving ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    <>
                      <SaveIcon sx={{ mr: 1 }} />
                      Save Profile
                    </>
                  )}
                </Button>
              </motion.div>
            </Box>
          )}
        </Card>
      </Box>
    </motion.div>
  );
}