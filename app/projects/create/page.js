"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Container,
  Typography,
  TextField,
  Select,
  MenuItem,
  Button,
  Grid,
  Card,
  CardContent,
  InputLabel,
  FormControl,
  Alert,
  CircularProgress,
  Snackbar,
  LinearProgress,
  Box,
  Divider,
  Paper,
  Breadcrumbs,
  IconButton,
  Tooltip,
  useTheme,
  Autocomplete,
  Chip,
  Avatar,
} from "@mui/material";
import { motion } from "framer-motion";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import GroupIcon from '@mui/icons-material/Group';
import TitleIcon from '@mui/icons-material/Title';
import ExtensionIcon from '@mui/icons-material/Extension';
import SaveIcon from '@mui/icons-material/Save';
import HomeIcon from '@mui/icons-material/Home';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import PersonIcon from '@mui/icons-material/Person';
import SearchIcon from '@mui/icons-material/Search';

// Loading skeleton component
const CreateProjectSkeleton = () => {
  const theme = useTheme();
  
  return (
    <Box sx={{ width: '100%', p: 2 }}>
      <Box sx={{ mb: 3, width: '40%' }}>
        <motion.div 
          animate={{ opacity: [0.5, 0.8, 0.5] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        >
          <Box sx={{ height: 30, bgcolor: 'action.hover', borderRadius: 1, mb: 2 }} />
        </motion.div>
      </Box>
      
      <Paper sx={{ p: 3, borderRadius: 2 }}>
        <Box sx={{ mb: 4, width: '60%' }}>
          <motion.div 
            animate={{ opacity: [0.5, 0.8, 0.5] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          >
            <Box sx={{ height: 40, bgcolor: 'action.hover', borderRadius: 1, mb: 1 }} />
          </motion.div>
        </Box>
        
        <Grid container spacing={3}>
          {[1, 2, 3, 4, 5].map((i) => (
            <Grid item xs={12} key={i}>
              <motion.div 
                animate={{ opacity: [0.5, 0.8, 0.5] }}
                transition={{ repeat: Infinity, duration: 1.5, delay: i * 0.1 }}
              >
                <Box sx={{ height: 56, bgcolor: 'action.hover', borderRadius: 1 }} />
              </motion.div>
            </Grid>
          ))}
          
          <Grid item xs={12}>
            <motion.div 
              animate={{ opacity: [0.5, 0.8, 0.5] }}
              transition={{ repeat: Infinity, duration: 1.5, delay: 0.6 }}
            >
              <Box sx={{ height: 120, bgcolor: 'action.hover', borderRadius: 1 }} />
            </motion.div>
          </Grid>
          
          <Grid item xs={12}>
            <motion.div 
              animate={{ opacity: [0.5, 0.8, 0.5] }}
              transition={{ repeat: Infinity, duration: 1.5, delay: 0.7 }}
            >
              <Box sx={{ height: 50, bgcolor: 'action.hover', borderRadius: 1 }} />
            </motion.div>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

function formatMemberLabel(u) {
  if (!u?.name) return u?.regId || "";
  const rid = (u.regId || "").trim();
  return rid ? `${u.name.trim()} ${rid}` : u.name.trim();
}

function memberSearchInitials(name) {
  if (!name?.trim()) return "?";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function memberAvatarColor(name) {
  const s = name || "?";
  let hash = 0;
  for (let i = 0; i < s.length; i += 1) {
    hash = s.charCodeAt(i) + ((hash << 5) - hash);
  }
  const h = Math.abs(hash) % 360;
  return `hsl(${h} 55% 42%)`;
}

/** Pick a registered student (User) — options load from `/api/users/search`. */
function TeamMemberAutocomplete({ value, onChange, label, excludeIds = [], required }) {
  const theme = useTheme();
  const [inputValue, setInputValue] = useState(() =>
    value ? formatMemberLabel(value) : ""
  );
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef(null);

  useEffect(() => {
    if (value) setInputValue(formatMemberLabel(value));
    else setInputValue("");
  }, [value]);

  useEffect(() => {
    const q = inputValue.trim();
    if (q.length < 2) {
      setOptions([]);
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await axios.get("/api/users/search", {
          params: { q, limit: 20 },
        });
        const data = Array.isArray(res.data) ? res.data : [];
        const exclude = new Set(excludeIds);
        setOptions(data.filter((u) => u?.id && !exclude.has(u.id)));
      } catch {
        setOptions([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [inputValue, excludeIds.join(",")]);

  return (
    <Autocomplete
      value={value}
      onChange={(_e, newValue) => onChange(newValue)}
      inputValue={inputValue}
      onInputChange={(_e, newInput, reason) => {
        if (reason === "input") setInputValue(newInput);
        if (reason === "clear") setInputValue("");
        if (reason === "reset" && value) {
          setInputValue(formatMemberLabel(value));
        }
      }}
      options={options}
      loading={loading}
      getOptionLabel={(opt) => (opt ? formatMemberLabel(opt) : "")}
      isOptionEqualToValue={(a, b) => a?.id === b?.id}
      filterOptions={(x) => x}
      slotProps={{
        paper: {
          elevation: 0,
          sx: {
            mt: 0.75,
            borderRadius: 2,
            border: "1px solid",
            borderColor: "divider",
            boxShadow:
              theme.palette.mode === "dark"
                ? "0 8px 24px rgba(0,0,0,0.45), 0 0 0 1px rgba(255,255,255,0.06)"
                : "0 8px 24px rgba(60,64,67,0.28), 0 0 0 1px rgba(60,64,67,0.08)",
            overflow: "hidden",
            minWidth: 320,
          },
        },
        listbox: {
          sx: {
            py: 0.75,
            px: 0.5,
            maxHeight: 320,
            "& .MuiAutocomplete-option": {
              px: 0,
              py: 0,
              minHeight: 0,
            },
          },
        },
      }}
      renderOption={(props, option) => {
        const { key, ...liProps } = props;
        const name = option.name?.trim() || "—";
        const rid = (option.regId || "").trim();
        return (
          <Box
            component="li"
            key={key}
            {...liProps}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              px: 1,
              py: 1,
              mx: 0.25,
              my: 0.125,
              borderRadius: 1.5,
              cursor: "pointer",
              transition: "background-color 0.12s ease",
              "&:hover": { bgcolor: "action.hover" },
              '&.Mui-focused, &[aria-selected="true"]': {
                bgcolor: "action.selected",
              },
            }}
          >
            <Avatar
              sx={{
                width: 40,
                height: 40,
                fontSize: "0.875rem",
                fontWeight: 600,
                bgcolor: memberAvatarColor(name),
                color: "common.white",
                flexShrink: 0,
              }}
            >
              {memberSearchInitials(name)}
            </Avatar>
            <Box sx={{ minWidth: 0, flex: 1, textAlign: "left" }}>
              <Typography
                variant="body2"
                fontWeight={600}
                noWrap
                sx={{ lineHeight: 1.35, color: "text.primary" }}
              >
                {name}
              </Typography>
              {rid ? (
                <Typography
                  variant="caption"
                  noWrap
                  sx={{
                    display: "block",
                    mt: 0.25,
                    color: "text.secondary",
                    fontFamily:
                      'ui-monospace, "SF Mono", Menlo, Consolas, monospace',
                    letterSpacing: "0.03em",
                  }}
                >
                  {rid}
                </Typography>
              ) : null}
            </Box>
          </Box>
        );
      }}
      noOptionsText={
        <Box sx={{ py: 2, px: 1, textAlign: "center" }}>
          <Typography variant="body2" color="text.secondary">
            {inputValue.trim().length < 2
              ? "Type at least 2 characters to search"
              : "No students match your search"}
          </Typography>
        </Box>
      }
      loadingText={
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, py: 1.5, px: 1 }}>
          <CircularProgress size={20} thickness={4} />
          <Typography variant="body2" color="text.secondary">
            Searching…
          </Typography>
        </Box>
      }
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          required={required}
          placeholder="Search people"
          size="small"
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: 2,
              bgcolor: theme.palette.mode === "dark" ? "action.hover" : "grey.50",
              transition: theme.transitions.create(["box-shadow", "background-color"], {
                duration: theme.transitions.duration.shorter,
              }),
              "&:hover": {
                bgcolor: theme.palette.mode === "dark" ? "action.selected" : "grey.100",
              },
              "&.Mui-focused": {
                bgcolor: "background.paper",
                boxShadow: `0 1px 2px 0 rgba(60,64,67,0.3), 0 2px 6px 2px rgba(60,64,67,0.15)`,
              },
            },
          }}
          InputProps={{
            ...params.InputProps,
            startAdornment: (
              <>
                <SearchIcon sx={{ ml: 0.75, mr: 0.25, color: "text.secondary", fontSize: 22 }} />
                {params.InputProps.startAdornment}
              </>
            ),
          }}
        />
      )}
    />
  );
}

export default function CreateProject() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const theme = useTheme();

  const [title, setTitle] = useState("");
  const [numMembers, setNumMembers] = useState(1);
  /** @type {Array<{ id: string; name: string; regId: string } | null>} */
  const [teamMemberSelections, setTeamMemberSelections] = useState([null]);
  const [components, setComponents] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ open: false, message: "", severity: "success" });
  const [progress, setProgress] = useState(100);
  const [teachers, setTeachers] = useState([]);
  const [selectedTeacherId, setSelectedTeacherId] = useState(null);
  const [inputString, setInputString] = useState('');

  useEffect(() => {
    setTeamMemberSelections((prev) => {
      const next = Array(numMembers).fill(null);
      for (let i = 0; i < Math.min(prev.length, numMembers); i++) {
        next[i] = prev[i];
      }
      return next;
    });
  }, [numMembers]);

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const response = await axios.get("/api/users?role=TEACHER");
        setTeachers(response.data);
      } catch (error) {
        console.error("Error fetching teachers:", error);
      }
    };
    fetchTeachers();
  }, []);

  const handleTeamMemberChange = (index, user) => {
    setTeamMemberSelections((prev) => {
      const next = [...prev];
      next[index] = user;
      return next;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const trimmedTitle = title.trim();
    const trimmedComponents = components.join(", ");

    if (!trimmedTitle) {
      setToast({ open: true, message: "Project title is required.", severity: "error" });
      return;
    }

    if (components.length === 0) {
      setToast({ open: true, message: "At least one component is required.", severity: "error" });
      return;
    }

    const emptyMemberIndex = teamMemberSelections.findIndex((m) => !m);
    if (emptyMemberIndex !== -1) {
      setToast({
        open: true,
        message: `Select a registered student for team member ${emptyMemberIndex + 1}.`,
        severity: "error",
      });
      return;
    }

    const teamMemberIds = teamMemberSelections.map((m) => m.id);
    const unique = new Set(teamMemberIds);
    if (unique.size !== teamMemberIds.length) {
      setToast({
        open: true,
        message: "Each team member must be a different person.",
        severity: "error",
      });
      return;
    }

    if (!selectedTeacherId) {
      setToast({ open: true, message: "Please select a teacher for the project.", severity: "error" });
      return;
    }

    setLoading(true);
    setError("");

    try {
      const projectData = {
        title: trimmedTitle,
        teamMemberIds,
        components: trimmedComponents,
        assignedTeacherId: selectedTeacherId,
      };

      const response = await axios.post("/api/projects/create", projectData);

      if (response.status === 201) {
        setToast({ 
          open: true, 
          message: "Project created successfully! Redirecting to dashboard...", 
          severity: "success" 
        });

        // Start progress countdown
        let timeLeft = 3000;
        const interval = setInterval(() => {
          setProgress((prev) => Math.max(prev - (100 / (timeLeft / 100)), 0));
        }, 100);

        // Redirect after 3 seconds
        setTimeout(() => {
          clearInterval(interval);
          router.push(`/`);
        }, 3000);
      }
    } catch (error) {
      console.error("Error creating project:", error);
      const errorMessage = error.response?.data?.error || "Error creating project. Please try again.";
      setToast({ 
        open: true, 
        message: errorMessage, 
        severity: "error" 
      });
      setProgress(100); // Reset progress on error
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <Container maxWidth="md" sx={{ py: { xs: 2, sm: 4 } }}>
        <CreateProjectSkeleton />
      </Container>
    );
  }

  if (status === "unauthenticated") {
    router.push("/api/auth/signin");
    return (
      <Container maxWidth="md" sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Box 
      sx={{ 
        minHeight: '100vh',
        backgroundColor: 'background.default',
        pb: 8,
        width: '100%',
      }}
    >
      <Container maxWidth="md" sx={{ py: { xs: 2, md: 4 }, px: { xs: 2, sm: 3, md: 4 } }}>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Breadcrumb and page header */}
          <Box sx={{ mb: 3, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' } }}>
            <Box>
              <Breadcrumbs 
                separator={<NavigateNextIcon fontSize="small" />} 
                aria-label="breadcrumb"
                sx={{ mb: 1 }}
              >
                <Link href="/" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center' }}>
                  <HomeIcon sx={{ mr: 0.5 }} fontSize="small" />
                  TrackLab
                </Link>
                <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
                  New Project
                </Typography>
              </Breadcrumbs>
              <Typography variant="h5" fontWeight="bold" component={motion.h1}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                Create New Project
              </Typography>
            </Box>
            
            <Tooltip title="Back to Dashboard">
              <Button
                component={Link}
                href="/"
                startIcon={<ArrowBackIcon />}
                sx={{ mt: { xs: 2, sm: 0 } }}
              >
                Dashboard
              </Button>
            </Tooltip>
          </Box>

          <Card 
            elevation={2} 
            sx={{ 
              borderRadius: 2,
              overflow: 'hidden',
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
            }}
            component={motion.div}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Box sx={{ 
              p: 2, 
              background: (theme) => `linear-gradient(135deg, ${theme.palette.primary.main}15, ${theme.palette.primary.light}30)`,
              borderBottom: (theme) => `1px solid ${theme.palette.divider}`
            }}>
              <Typography variant="h6" fontWeight="medium">
                Project Information
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Fill in the details to create your new project
              </Typography>
            </Box>
            
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              {error && (
                <Alert 
                  severity="error" 
                  sx={{ mb: 3, borderRadius: 1 }}
                  component={motion.div}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {error}
                </Alert>
              )}

              <form onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <TextField
                      label="Project Title"
                      variant="outlined"
                      fullWidth
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                      InputProps={{
                        startAdornment: <TitleIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                      }}
                      placeholder="Enter a descriptive title for your project"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: 'white',
                          '& fieldset': {
                            borderColor: 'rgba(0, 0, 0, 0.23)'
                          },
                          '&:hover fieldset': {
                            borderColor: 'rgba(0, 0, 0, 0.23)'
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: 'primary.main'
                          }
                        }
                      }}
                    />
                  </Grid>

                  {/* Current user info */}
                  <Grid item xs={12}>
                    <Box sx={{ 
                      p: 2, 
                      borderRadius: 2, 
                      bgcolor: 'background.paper',
                      border: (theme) => `1px solid ${theme.palette.divider}`,
                      display: 'flex',
                      alignItems: 'center',
                      mb: 1
                    }}>
                      <PersonIcon sx={{ mr: 2, color: 'primary.main' }} />
                      <Box>
                        <Typography variant="subtitle2">
                          Project Creator
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {session?.user?.name || session?.user?.email || "You (logged in user)"}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>

                  {/* Teacher Selection */}
                  <Grid item xs={12}>
                    <Box sx={{ 
                      p: 2, 
                      borderRadius: 2, 
                      bgcolor: 'background.paper',
                      border: (theme) => `1px solid ${theme.palette.divider}`,
                    }}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Assign Project Teacher
                      </Typography>
                      <FormControl fullWidth required>
                        <InputLabel id="teacher-select-label">Select Project Teacher</InputLabel>
                        <Select
                          labelId="teacher-select-label"
                          id="teacher-select"
                          value={selectedTeacherId || ""}
                          label="Select Project Teacher"
                          onChange={(e) => setSelectedTeacherId(e.target.value)}
                          startAdornment={<PersonIcon sx={{ mr: 1, color: 'text.secondary' }} />}
                          sx={{
                            '& .MuiSelect-select': {
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1
                            },
                            '& .MuiOutlinedInput-notchedOutline': {
                              borderColor: 'rgba(0, 0, 0, 0.23)'
                            },
                            '&:hover .MuiOutlinedInput-notchedOutline': {
                              borderColor: 'rgba(0, 0, 0, 0.23)'
                            },
                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                              borderColor: 'primary.main'
                            }
                          }}
                          displayEmpty
                          renderValue={(selected) => {
                            if (!selected) {
                              return <Typography color="text.secondary">Select from dropdown</Typography>;
                            }
                            const teacher = teachers.find(t => t.id === selected);
                            return teacher ? teacher.name : '';
                          }}
                        >
                          {teachers.map((teacher) => (
                            <MenuItem 
                              key={teacher.id} 
                              value={teacher.id}
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                                py: 1
                              }}
                            >
                              <Box
                                sx={{
                                  width: 32,
                                  height: 32,
                                  borderRadius: '50%',
                                  backgroundColor: theme.palette.primary.main,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  color: 'white',
                                  fontWeight: 'bold',
                                  fontSize: '0.875rem',
                                  flexShrink: 0
                                }}
                              >
                                {teacher.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                              </Box>
                              <Box>
                                <Typography variant="body2">
                                  {teacher.name}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {teacher.regId}
                                </Typography>
                              </Box>
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1, ml: 1 }}>
                        Select a teacher who will oversee this project
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid item xs={12}>
                    <FormControl fullWidth>
                      <InputLabel>Additional Team Members</InputLabel>
                      <Select
                        value={numMembers}
                        onChange={(e) => setNumMembers(Number(e.target.value))}
                        label="Additional Team Members"
                        startAdornment={<GroupIcon sx={{ mr: 1, ml: -0.5, color: 'text.secondary' }} />}
                      >
                        {[1, 2, 3, 4, 5].map((num) => (
                          <MenuItem key={num} value={num}>
                            {num} {num === 1 ? 'Member' : 'Members'}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1, ml: 1 }}>
                      You are automatically listed as the project creator. Add additional team members here.
                    </Typography>
                  </Grid>

                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Additional Team Members
                    </Typography>
                    <Box 
                      sx={{ 
                        p: 2, 
                        borderRadius: 2, 
                        bgcolor: 'background.paper',
                        border: (theme) => `1px solid ${theme.palette.divider}`
                      }}
                    >
                      <Grid container spacing={2}>
                        {teamMemberSelections.map((member, index) => {
                          const excludeIds = teamMemberSelections
                            .map((m, i) => (i !== index && m ? m.id : null))
                            .filter(Boolean);
                          return (
                            <Grid item xs={12} sm={numMembers > 2 ? 6 : 12} key={index}>
                              <TeamMemberAutocomplete
                                label={`Team Member ${index + 1}`}
                                value={member}
                                onChange={(user) => handleTeamMemberChange(index, user)}
                                excludeIds={excludeIds}
                                required
                              />
                            </Grid>
                          );
                        })}
                      </Grid>
                    </Box>
                  </Grid>

                  <Grid item xs={12}>
                    <Autocomplete
                      multiple
                      id="components-input"
                      options={[]}
                      freeSolo
                      value={components}
                      onChange={(event, newValue) => {
                        // Filter out any empty strings that might result from extra commas
                        const filteredNewValue = newValue.filter(item => item.trim() !== '');

                        // Limit the number of chips to 30
                        if (filteredNewValue.length > 30) {
                          setToast({
                            open: true,
                            message: `You can add a maximum of 30 components. ${components.length} already added.`, // Adjust message as needed
                            severity: "warning"
                          });
                          setComponents(filteredNewValue.slice(0, 30)); // Only keep the first 30
                        } else {
                          setComponents(filteredNewValue);
                        }
                      }}
                      inputValue={inputString} // Control input value with state
                      onInputChange={(event, newInputValue) => {
                        setInputString(newInputValue);
                        // Handle comma-separated input
                        if (newInputValue.includes(',')) {
                          const newItems = newInputValue.split(',')
                            .map(item => item.trim())
                            .filter(item => item && !components.includes(item)); // Filter out empty and existing items

                          // Add new items if they don't exceed the limit when combined with existing ones
                          const currentCount = components.length;
                          const potentialNewCount = currentCount + newItems.length;

                          if (potentialNewCount > 30) {
                             const itemsToAddCount = 30 - currentCount;
                             const itemsToAdd = newItems.slice(0, itemsToAddCount);
                             if(itemsToAdd.length > 0) {
                                 setComponents(prev => [...prev, ...itemsToAdd]);
                             }
                             setToast({
                               open: true,
                               message: `You can add a maximum of 30 components. ${currentCount} already added, ${newItems.length - itemsToAddCount} items were not added.`, // More detailed message
                               severity: "warning"
                             });
                          } else if (newItems.length > 0) {
                              setComponents(prev => [...prev, ...newItems]);
                          }

                          // Clear the input string after processing comma-separated input
                          setInputString('');
                        }
                      }}
                      renderTags={(value, getTagProps) =>
                        value.map((option, index) => {
                          const { key, ...chipProps } = getTagProps({ index });
                          return (
                            <Chip
                              key={key}
                              label={option}
                              {...chipProps}
                              sx={{
                                backgroundColor: theme.palette.primary.light,
                                color: theme.palette.primary.contrastText,
                                '& .MuiChip-deleteIcon': {
                                  color: theme.palette.primary.contrastText,
                                  '&:hover': {
                                    color: theme.palette.error.main,
                                  },
                                },
                              }}
                            />
                          );
                        })
                      }
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Borrowed Components"
                          placeholder="Enter components (press Enter or comma to add)"
                          InputProps={{
                            ...params.InputProps,
                            startAdornment: (
                              <>
                                <ExtensionIcon sx={{ mr: 1, color: 'text.secondary', alignSelf: 'flex-start', mt: 1 }} />
                                {params.InputProps.startAdornment}
                              </>
                            ),
                          }}
                        />
                      )}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: 'white',
                          '& fieldset': {
                            borderColor: 'rgba(0, 0, 0, 0.23)'
                          },
                          '&:hover fieldset': {
                            borderColor: 'rgba(0, 0, 0, 0.23)'
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: 'primary.main'
                          }
                        }
                      }}
                    />
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1, ml: 1 }}>
                      Enter components and press Enter or comma to add them as chips. You can also paste a comma-separated list.
                    </Typography>
                  </Grid>

                  <Grid item xs={12}>
                    <Divider sx={{ my: 1 }} />
                  </Grid>

                  <Grid item xs={12}>
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      fullWidth
                      disabled={loading}
                      size="large"
                      startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                      sx={{ 
                        py: 1.5, 
                        fontWeight: 600,
                        borderRadius: 2,
                        boxShadow: 2,
                        transition: 'all 0.3s ease-in-out'
                      }}
                    >
                      {loading ? "Creating Project..." : "Create Project"}
                    </Button>
                  </Grid>
                </Grid>
              </form>
            </CardContent>
          </Card>
        </motion.div>

        {/* Toast Notification */}
        <Snackbar
          open={toast.open}
          autoHideDuration={3000}
          onClose={() => setToast({ ...toast, open: false })}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          sx={{
            '& .MuiSnackbar-root': {
              bottom: { xs: 16, sm: 24 }
            }
          }}
        >
          <Box sx={{ 
            width: "100%", 
            borderRadius: 2, 
            overflow: 'hidden', 
            boxShadow: 3,
            maxWidth: 400
          }}>
            <Alert 
              severity={toast.severity} 
              onClose={() => setToast({ ...toast, open: false })}
              variant="filled"
              sx={{
                '& .MuiAlert-message': {
                  fontWeight: 500
                }
              }}
            >
              {toast.message}
            </Alert>
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{
                backgroundColor: (theme) => toast.severity === "success" ? 
                  theme.palette.success.dark : theme.palette.error.dark,
                height: 4,
                '& .MuiLinearProgress-bar': {
                  transition: 'transform 0.1s linear'
                }
              }}
            />
          </Box>
        </Snackbar>
      </Container>
    </Box>
  );
}