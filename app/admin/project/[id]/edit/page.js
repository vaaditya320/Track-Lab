"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import {
  Alert,
  Autocomplete,
  Avatar,
  Breadcrumbs,
  Chip,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Divider,
  FormControl,
  Grid,
  InputLabel,
  LinearProgress,
  MenuItem,
  Paper,
  Select,
  Snackbar,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { motion } from "framer-motion";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import GroupIcon from "@mui/icons-material/Group";
import TitleIcon from "@mui/icons-material/Title";
import ExtensionIcon from "@mui/icons-material/Extension";
import HomeIcon from "@mui/icons-material/Home";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import SearchIcon from "@mui/icons-material/Search";
import SaveIcon from "@mui/icons-material/Save";
import { isSuperAdmin } from "@/lib/isSuperAdmin";

function parseMembers(value) {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) return parsed.map((m) => String(m).trim()).filter(Boolean);
    return [String(value)];
  } catch {
    return String(value)
      .split(",")
      .map((m) => m.trim())
      .filter(Boolean);
  }
}

function parseComponents(value) {
  if (!value) return [];
  return String(value)
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);
}

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

function TeamMemberAutocomplete({ value, onChange, label, excludeIds = [] }) {
  const [inputValue, setInputValue] = useState(() => (value ? formatMemberLabel(value) : ""));
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
        const res = await axios.get("/api/users/search", { params: { q, limit: 20 } });
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
        if (reason === "reset" && value) setInputValue(formatMemberLabel(value));
      }}
      options={options}
      loading={loading}
      getOptionLabel={(opt) => (opt ? formatMemberLabel(opt) : "")}
      isOptionEqualToValue={(a, b) => a?.id === b?.id}
      filterOptions={(x) => x}
      renderOption={(props, option) => {
        const { key, ...liProps } = props;
        const name = option.name?.trim() || "—";
        const rid = (option.regId || "").trim();
        return (
          <Box component="li" key={key} {...liProps} sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Avatar
              sx={{
                width: 36,
                height: 36,
                fontSize: "0.8rem",
                fontWeight: 600,
                bgcolor: memberAvatarColor(name),
                color: "common.white",
                flexShrink: 0,
              }}
            >
              {memberSearchInitials(name)}
            </Avatar>
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography variant="body2" fontWeight={600} noWrap>
                {name}
              </Typography>
              {rid ? (
                <Typography variant="caption" noWrap color="text.secondary">
                  {rid}
                </Typography>
              ) : null}
            </Box>
          </Box>
        );
      }}
      noOptionsText={inputValue.trim().length < 2 ? "Type at least 2 characters to search" : "No students found"}
      loadingText="Searching..."
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          required
          placeholder="Search people"
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

function CreateProjectSkeleton() {
  return (
    <Box sx={{ width: "100%", p: 2 }}>
      <Paper sx={{ p: 3, borderRadius: 2 }}>
        <Grid container spacing={3}>
          {[1, 2, 3, 4].map((i) => (
            <Grid item xs={12} key={i}>
              <Box sx={{ height: 56, bgcolor: "action.hover", borderRadius: 1 }} />
            </Grid>
          ))}
        </Grid>
      </Paper>
    </Box>
  );
}

export default function EditProjectPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { id } = useParams();
  const canEdit = useMemo(() => isSuperAdmin(session), [session]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState({ open: false, message: "", severity: "success" });
  const [progress, setProgress] = useState(100);
  const [title, setTitle] = useState("");
  const [components, setComponents] = useState([]);
  const [inputString, setInputString] = useState("");
  const [numMembers, setNumMembers] = useState(1);
  const [teamMemberSelections, setTeamMemberSelections] = useState([null]);

  useEffect(() => {
    if (status !== "authenticated") return;
    if (!canEdit) {
      setError("Only superadmin can edit projects.");
      setLoading(false);
      return;
    }

    (async () => {
      try {
        const res = await axios.get(`/api/admin/projects/${id}`);
        const p = res.data;
        setTitle(p.title || "");
        setComponents(parseComponents(p.components));
        const memberNames = parseMembers(p.teamMembers);
        const initialMembers =
          memberNames.length > 0
            ? memberNames.map((name, idx) => ({ id: `existing-${idx}`, name, regId: "" }))
            : [null];
        setNumMembers(initialMembers.length);
        setTeamMemberSelections(initialMembers);
      } catch (e) {
        setError(e.response?.data?.error || "Failed to load project.");
      } finally {
        setLoading(false);
      }
    })();
  }, [status, id, canEdit]);

  useEffect(() => {
    setTeamMemberSelections((prev) => {
      const next = Array(numMembers).fill(null);
      for (let i = 0; i < Math.min(prev.length, numMembers); i += 1) next[i] = prev[i];
      return next;
    });
  }, [numMembers]);

  const handleTeamMemberChange = (index, user) => {
    setTeamMemberSelections((prev) => {
      const next = [...prev];
      next[index] = user;
      return next;
    });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      if (!title.trim()) throw new Error("Project title is required.");
      if (components.length === 0) throw new Error("At least one component is required.");
      const emptyMemberIndex = teamMemberSelections.findIndex((m) => !m);
      if (emptyMemberIndex !== -1) {
        throw new Error(`Select a team member for slot ${emptyMemberIndex + 1}.`);
      }
      const teamMemberNames = teamMemberSelections.map((m) => m.name?.trim()).filter(Boolean);
      const uniqueNames = new Set(teamMemberNames.map((x) => x.toLowerCase()));
      if (uniqueNames.size !== teamMemberNames.length) {
        throw new Error("Each team member must be different.");
      }

      await axios.put(`/api/admin/projects/${id}`, {
        title: title.trim(),
        teamMembers: JSON.stringify(teamMemberNames),
        components: components.join(", "),
      });

      setToast({ open: true, message: "Project updated successfully!", severity: "success" });
      let timeLeft = 2000;
      const interval = setInterval(() => {
        setProgress((prev) => Math.max(prev - 100 / (timeLeft / 100), 0));
      }, 100);
      setTimeout(() => {
        clearInterval(interval);
        router.push(`/admin/projects/${id}`);
      }, 2000);
    } catch (e) {
      setError(e.message || e.response?.data?.error || "Failed to update project.");
      setProgress(100);
    } finally {
      setSaving(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <CreateProjectSkeleton />
      </Container>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "background.default", pb: 6 }}>
      <Container maxWidth="md" sx={{ py: { xs: 2, md: 4 } }}>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Box
            sx={{
              mb: 3,
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              justifyContent: "space-between",
              alignItems: { xs: "flex-start", sm: "center" },
            }}
          >
            <Box>
              <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} sx={{ mb: 1 }}>
                <HomeIcon sx={{ mr: 0.5 }} fontSize="small" />
                <Typography color="text.secondary">Admin</Typography>
                <Typography color="text.primary">Edit Project</Typography>
              </Breadcrumbs>
              <Typography variant="h5" fontWeight="bold">
                Edit Project
              </Typography>
            </Box>
            <Tooltip title="Back to project details">
              <Button
                startIcon={<ArrowBackIcon />}
                onClick={() => router.push(`/admin/projects/${id}`)}
                sx={{ mt: { xs: 2, sm: 0 } }}
              >
                Back
              </Button>
            </Tooltip>
          </Box>

          <Card elevation={2} sx={{ borderRadius: 2, overflow: "hidden" }}>
            <Box sx={{ p: 2, borderBottom: (theme) => `1px solid ${theme.palette.divider}` }}>
              <Typography variant="h6" fontWeight="medium">
                Project Information
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Update title, team members, and components.
              </Typography>
            </Box>
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {error}
                </Alert>
              )}

              <form onSubmit={onSubmit}>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <TextField
                      label="Project Title"
                      variant="outlined"
                      fullWidth
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                      disabled={!canEdit || saving}
                      InputProps={{
                        startAdornment: <TitleIcon sx={{ mr: 1, color: "text.secondary" }} />,
                      }}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <FormControl fullWidth>
                      <InputLabel>Team Members</InputLabel>
                      <Select
                        value={numMembers}
                        onChange={(e) => setNumMembers(Number(e.target.value))}
                        label="Team Members"
                        startAdornment={<GroupIcon sx={{ mr: 1, ml: -0.5, color: "text.secondary" }} />}
                        disabled={!canEdit || saving}
                      >
                        {[1, 2, 3, 4, 5].map((num) => (
                          <MenuItem key={num} value={num}>
                            {num} {num === 1 ? "Member" : "Members"}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12}>
                    <Box sx={{ p: 2, borderRadius: 2, bgcolor: "background.paper", border: (theme) => `1px solid ${theme.palette.divider}` }}>
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
                      options={[]}
                      freeSolo
                      value={components}
                      onChange={(_event, newValue) => {
                        const filtered = newValue.filter((item) => item.trim() !== "");
                        if (filtered.length > 30) {
                          setToast({ open: true, message: "Max 30 components allowed.", severity: "warning" });
                          setComponents(filtered.slice(0, 30));
                        } else {
                          setComponents(filtered);
                        }
                      }}
                      inputValue={inputString}
                      onInputChange={(_event, newInputValue) => {
                        setInputString(newInputValue);
                        if (newInputValue.includes(",")) {
                          const newItems = newInputValue
                            .split(",")
                            .map((item) => item.trim())
                            .filter((item) => item && !components.includes(item));
                          const currentCount = components.length;
                          const room = 30 - currentCount;
                          if (room <= 0) {
                            setToast({ open: true, message: "Max 30 components allowed.", severity: "warning" });
                          } else {
                            setComponents((prev) => [...prev, ...newItems.slice(0, room)]);
                            if (newItems.length > room) {
                              setToast({ open: true, message: "Some components were not added (max 30).", severity: "warning" });
                            }
                          }
                          setInputString("");
                        }
                      }}
                      renderTags={(value, getTagProps) =>
                        value.map((option, index) => {
                          const { key, ...chipProps } = getTagProps({ index });
                          return <Chip key={key} label={option} {...chipProps} />;
                        })
                      }
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Borrowed Components"
                          placeholder="Enter components (press Enter or comma)"
                          InputProps={{
                            ...params.InputProps,
                            startAdornment: (
                              <>
                                <ExtensionIcon sx={{ mr: 1, color: "text.secondary", alignSelf: "flex-start", mt: 1 }} />
                                {params.InputProps.startAdornment}
                              </>
                            ),
                          }}
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Divider sx={{ my: 1 }} />
                  </Grid>

                  <Grid item xs={12}>
                    <Button
                      type="submit"
                      variant="contained"
                      fullWidth
                      disabled={!canEdit || saving}
                      size="large"
                      startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                    >
                      {saving ? "Saving..." : "Save Project"}
                    </Button>
                  </Grid>
                </Grid>
              </form>
            </CardContent>
          </Card>
        </motion.div>

        <Snackbar
          open={toast.open}
          autoHideDuration={3000}
          onClose={() => setToast((t) => ({ ...t, open: false }))}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        >
          <Box sx={{ width: "100%", borderRadius: 2, overflow: "hidden", boxShadow: 3, maxWidth: 420 }}>
            <Alert severity={toast.severity} onClose={() => setToast((t) => ({ ...t, open: false }))} variant="filled">
              {toast.message}
            </Alert>
            <LinearProgress variant="determinate" value={progress} sx={{ height: 4 }} />
          </Box>
        </Snackbar>
      </Container>
    </Box>
  );
}
