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
  List,
  ListItem,
  ListItemText,
  ClickAwayListener,
  Popper,
  Autocomplete,
  Chip,
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

// TypeaheadInput component for team member selection
const TypeaheadInput = ({ value, onChange, label, placeholder, required }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const inputRef = useRef(null);
  const [allStudents, setAllStudents] = useState([]);
  const theme = useTheme();
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const isClickingSuggestion = useRef(false);
  
  // Fetch all students when component mounts
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        const response = await axios.get("/api/students");
        setAllStudents(response.data);
      } catch (error) {
        console.error("Error fetching students:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStudents();
  }, []);
  
  // Update suggestions when value changes
  useEffect(() => {
    if (value.trim() === '') {
      setSuggestions([]);
      return;
    }
    
    const query = value.toLowerCase();
    const filtered = allStudents.filter(student => 
      student.name.toLowerCase().includes(query) ||
      student.regId.toLowerCase().includes(query)
    ).slice(0, 10); // Limit to 10 suggestions
    
    setSuggestions(filtered);
    setOpen(filtered.length > 0);
    setSelectedIndex(-1); // Reset selection when suggestions change
  }, [value, allStudents]);
  
  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!open) return;
      
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prevIndex => 
            prevIndex < suggestions.length - 1 ? prevIndex + 1 : prevIndex
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prevIndex => 
            prevIndex > 0 ? prevIndex - 1 : 0
          );
          break;
        case 'Enter':
          e.preventDefault();
          if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
            handleSuggestionClick(suggestions[selectedIndex]);
          }
          break;
        case 'Escape':
          setOpen(false);
          break;
        default:
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, selectedIndex, suggestions]);
  
  const handleInputChange = (e) => {
    onChange(e.target.value);
    setOpen(true);
  };
  
  const handleSuggestionClick = (suggestion) => {
    const displayValue = `${suggestion.name} ${suggestion.regId}`;
    onChange(displayValue);
    setOpen(false);
    inputRef.current?.blur();
  };
  
  const handleClickAway = () => {
    setOpen(false);
  };

  const handleBlur = () => {
    if (isClickingSuggestion.current) {
      isClickingSuggestion.current = false;
      return;
    }
    setTimeout(() => {
      const trimmedValue = value.trim();
      onChange(trimmedValue);
      setOpen(false);
    }, 150);
  };

  const highlightMatch = (text, query) => {
    if (!query.trim()) return text;
    
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, i) => 
      regex.test(part) ? 
        <Box component="span" key={i} sx={{ color: theme.palette.primary.main, fontWeight: 'bold' }}>{part}</Box> : 
        part
    );
  };
  
  const getAvatarColor = (name) => {
    const colors = [
      '#1E88E5', '#43A047', '#E53935', '#8E24AA', '#FB8C00', 
      '#00ACC1', '#3949AB', '#D81B60', '#6D4C41', '#546E7A'
    ];
    const charCode = name.charCodeAt(0) || 0;
    return colors[charCode % colors.length];
  };
  
  const getInitials = (name) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };
  
  return (
    <ClickAwayListener onClickAway={handleClickAway}>
      <Box sx={{ position: 'relative', width: '100%' }}>
        <TextField
          ref={inputRef}
          label={label}
          variant="outlined"
          fullWidth
          value={value}
          onChange={handleInputChange}
          onBlur={handleBlur}
          required={required}
          placeholder={placeholder}
          size="small"
          InputProps={{
            startAdornment: loading ? (
              <CircularProgress size={20} sx={{ mr: 1 }} />
            ) : (
              <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
            ),
          }}
          onFocus={() => value.trim() !== '' && suggestions.length > 0 && setOpen(true)}
        />
        
        {open && suggestions.length > 0 && (
          <Paper
            sx={{
              position: 'absolute',
              width: '100%',
              mt: 0.5,
              zIndex: 1000,
              maxHeight: 250,
              overflow: 'auto',
              borderRadius: 1.5,
              boxShadow: '0 8px 16px rgba(0,0,0,0.12)',
              transition: 'all 0.2s ease-in-out',
              animation: 'fadeIn 0.2s ease-in-out',
              WebkitOverflowScrolling: 'touch',
              touchAction: 'pan-y',
              '@keyframes fadeIn': {
                '0%': {
                  opacity: 0,
                  transform: 'translateY(-10px)'
                },
                '100%': {
                  opacity: 1,
                  transform: 'translateY(0)'
                }
              }
            }}
            onTouchStart={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
          >
            <Box sx={{ p: 1.5, borderBottom: `1px solid ${theme.palette.divider}` }}>
              <Typography variant="caption" color="text.secondary">
                {suggestions.length} results found
              </Typography>
            </Box>
            
            <List disablePadding>
              {suggestions.map((suggestion, index) => (
                <ListItem
                  key={index}
                  onMouseDown={() => { isClickingSuggestion.current = true; }}
                  onClick={() => handleSuggestionClick(suggestion)}
                  sx={{
                    transition: 'all 0.2s',
                    p: 1.5,
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor: theme.palette.action.hover,
                      transform: 'translateX(4px)',
                    },
                    backgroundColor: selectedIndex === index ? 
                      theme.palette.action.selected : 'transparent',
                    '&:not(:last-child)': {
                      borderBottom: `1px solid ${theme.palette.divider}`,
                      borderBottomColor: 'rgba(0, 0, 0, 0.04)'
                    },
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2
                  }}
                  component={motion.li}
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.03 }}
                >
                  <Box
                    sx={{
                      width: 36,
                      height: 36,
                      borderRadius: '50%',
                      backgroundColor: getAvatarColor(suggestion.name),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontWeight: 'bold',
                      fontSize: '0.875rem',
                      flexShrink: 0
                    }}
                  >
                    {getInitials(suggestion.name)}
                  </Box>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {highlightMatch(`${suggestion.name} ${suggestion.regId}`, value)}
                    </Typography>
                    {suggestion.role && (
                      <Typography variant="caption" color="text.secondary">
                        {suggestion.role}
                      </Typography>
                    )}
                  </Box>
                </ListItem>
              ))}
            </List>
            
            {suggestions.length > 0 && (
              <Box 
                sx={{ 
                  p: 1, 
                  borderTop: `1px solid ${theme.palette.divider}`,
                  bgcolor: 'rgba(0, 0, 0, 0.02)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '0.75rem',
                  color: 'text.secondary'
                }}
              >
                <Typography variant="caption">Press Enter to select</Typography>
                <Typography variant="caption">↑↓ to navigate</Typography>
              </Box>
            )}
          </Paper>
        )}
      </Box>
    </ClickAwayListener>
  );
};

export default function CreateProject() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const theme = useTheme();

  const [title, setTitle] = useState("");
  const [numMembers, setNumMembers] = useState(1);
  const [teamMembers, setTeamMembers] = useState([]);
  const [components, setComponents] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ open: false, message: "", severity: "success" });
  const [progress, setProgress] = useState(100);
  const [teachers, setTeachers] = useState([]);
  const [selectedTeacherId, setSelectedTeacherId] = useState(null);
  const [inputString, setInputString] = useState('');

  useEffect(() => {
    setTeamMembers(Array(numMembers).fill(""));
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

  const handleTeamMemberChange = (index, value) => {
    const updatedMembers = [...teamMembers];
    updatedMembers[index] = value;
    setTeamMembers(updatedMembers);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Trim whitespace from all inputs
    const trimmedTitle = title.trim();
    const trimmedComponents = components.join(", ");
    const trimmedTeamMembers = teamMembers.map(member => member.trim());

    // Check if any required field is empty
    if (!trimmedTitle) {
      setToast({ open: true, message: "Project title is required.", severity: "error" });
      return;
    }

    if (components.length === 0) {
      setToast({ open: true, message: "At least one component is required.", severity: "error" });
      return;
    }

    // Check if any team member name is empty
    const emptyMemberIndex = trimmedTeamMembers.findIndex(member => !member);
    if (emptyMemberIndex !== -1) {
      setToast({ open: true, message: `Team member ${emptyMemberIndex + 1} name is required.`, severity: "error" });
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
        teamMembers: trimmedTeamMembers.join(", "),
        components: trimmedComponents,
        assignedTeacherId: selectedTeacherId,
        leaderId: session?.user?.id,
        status: "PARTIAL" // Using the default status from schema
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
                        {teamMembers.map((member, index) => (
                          <Grid item xs={12} sm={numMembers > 2 ? 6 : 12} key={index}>
                            <TypeaheadInput
                              label={`Team Member ${index + 1}`}
                              value={member}
                              onChange={(value) => handleTeamMemberChange(index, value)}
                              required
                              placeholder="Start typing a name"
                            />
                          </Grid>
                        ))}
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