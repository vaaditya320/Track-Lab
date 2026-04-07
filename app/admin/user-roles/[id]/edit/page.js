"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import {
  Alert,
  Avatar,
  Divider,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Snackbar,
  TextField,
  Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SaveIcon from "@mui/icons-material/Save";
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import SchoolIcon from "@mui/icons-material/School";
import PhoneIphoneIcon from "@mui/icons-material/PhoneIphone";
import CategoryIcon from "@mui/icons-material/Category";
import GroupIcon from "@mui/icons-material/Group";
import ClassIcon from "@mui/icons-material/Class";
import { isSuperAdmin } from "@/lib/isSuperAdmin";

const ROLES = ["STUDENT", "TEACHER", "ADMIN"];
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
  "A1", "A2", "A3", "B1", "B2", "B3", "C1", "C2", "C3",
  "D1", "D2", "D3", "E1", "E2", "E3", "F1", "F2", "F3",
  "G1", "G2", "G3", "H1", "H2", "H3", "I1", "I2", "I3",
];

export default function EditUserPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { id } = useParams();
  const canEdit = useMemo(() => isSuperAdmin(session), [session]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState({ open: false, message: "", severity: "success" });
  const [form, setForm] = useState({
    name: "",
    email: "",
    regId: "",
    phoneNumber: "",
    role: "STUDENT",
    branch: "",
    section: "",
    batch: "",
  });

  useEffect(() => {
    if (status !== "authenticated") return;
    if (!canEdit) {
      setError("Only superadmin can edit users.");
      setLoading(false);
      return;
    }
    (async () => {
      try {
        const res = await axios.get(`/api/admin/users/${id}`);
        const user = res.data;
        setForm({
          name: user.name || "",
          email: user.email || "",
          regId: user.regId || "",
          phoneNumber: user.phoneNumber || "",
          role: user.role || "STUDENT",
          branch: user.branch || "",
          section: user.section || "",
          batch: user.batch || "",
        });
      } catch (e) {
        setError(e.response?.data?.error || "Failed to load user.");
      } finally {
        setLoading(false);
      }
    })();
  }, [status, id, canEdit]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await axios.put(`/api/admin/users/${id}`, form);
      setToast({ open: true, message: "User updated successfully", severity: "success" });
      setTimeout(() => router.push("/admin/user-roles"), 700);
    } catch (e) {
      setError(e.response?.data?.error || "Failed to update user.");
    } finally {
      setSaving(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <Container maxWidth="md" sx={{ py: 5, textAlign: "center" }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Button startIcon={<ArrowBackIcon />} onClick={() => router.push("/admin/user-roles")} sx={{ mb: 2 }}>
        Back
      </Button>
      <Card>
        <CardContent>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
            <Avatar sx={{ width: 56, height: 56, fontWeight: 700 }}>
              {form.name?.charAt(0)?.toUpperCase() || "U"}
            </Avatar>
            <Box>
              <Typography variant="h5" fontWeight={700}>
                Edit User Profile
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Update all profile fields available in user profile API.
              </Typography>
            </Box>
          </Box>
          <Divider sx={{ mb: 3 }} />
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Box component="form" onSubmit={onSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Name"
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  required
                  disabled={!canEdit || saving}
                  InputProps={{ startAdornment: <PersonIcon sx={{ mr: 1, color: "text.secondary" }} /> }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email"
                  value={form.email}
                  onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                  required
                  disabled={!canEdit || saving}
                  InputProps={{ startAdornment: <EmailIcon sx={{ mr: 1, color: "text.secondary" }} /> }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Registration ID"
                  value={form.regId}
                  onChange={(e) => setForm((p) => ({ ...p, regId: e.target.value }))}
                  required
                  disabled={!canEdit || saving}
                  InputProps={{ startAdornment: <SchoolIcon sx={{ mr: 1, color: "text.secondary" }} /> }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  value={form.phoneNumber}
                  onChange={(e) => setForm((p) => ({ ...p, phoneNumber: e.target.value }))}
                  disabled={!canEdit || saving}
                  InputProps={{ startAdornment: <PhoneIphoneIcon sx={{ mr: 1, color: "text.secondary" }} /> }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Branch</InputLabel>
                  <Select
                    value={form.branch}
                    label="Branch"
                    onChange={(e) => setForm((p) => ({ ...p, branch: e.target.value }))}
                    disabled={!canEdit || saving}
                    startAdornment={<CategoryIcon sx={{ mr: 1, ml: -0.5, color: "text.secondary" }} />}
                  >
                    <MenuItem value="">None</MenuItem>
                    {BRANCHES.map((branch) => (
                      <MenuItem key={branch.value} value={branch.value}>
                        {branch.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Section</InputLabel>
                  <Select
                    value={form.section}
                    label="Section"
                    onChange={(e) => {
                      const nextSection = e.target.value;
                      setForm((p) => ({
                        ...p,
                        section: nextSection,
                        batch: p.batch && !p.batch.startsWith(nextSection) ? "" : p.batch,
                      }));
                    }}
                    disabled={!canEdit || saving}
                    startAdornment={<GroupIcon sx={{ mr: 1, ml: -0.5, color: "text.secondary" }} />}
                  >
                    <MenuItem value="">None</MenuItem>
                    {SECTIONS.map((section) => (
                      <MenuItem key={section} value={section}>
                        {section}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Batch</InputLabel>
                  <Select
                    value={form.batch}
                    label="Batch"
                    onChange={(e) => setForm((p) => ({ ...p, batch: e.target.value }))}
                    disabled={!canEdit || saving}
                    startAdornment={<ClassIcon sx={{ mr: 1, ml: -0.5, color: "text.secondary" }} />}
                  >
                    <MenuItem value="">None</MenuItem>
                    {BATCHES.filter((b) => !form.section || b.startsWith(form.section)).map((batch) => (
                      <MenuItem key={batch} value={batch}>
                        {batch}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Role</InputLabel>
                  <Select
                    value={form.role}
                    label="Role"
                    onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))}
                    disabled={!canEdit || saving}
                  >
                    {ROLES.map((role) => (
                      <MenuItem key={role} value={role}>
                        {role}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  fullWidth
                  startIcon={saving ? <CircularProgress size={18} color="inherit" /> : <SaveIcon />}
                  disabled={!canEdit || saving}
                >
                  {saving ? "Saving..." : "Save User"}
                </Button>
              </Grid>
            </Grid>
          </Box>
        </CardContent>
      </Card>
      <Snackbar
        open={toast.open}
        autoHideDuration={3000}
        onClose={() => setToast((t) => ({ ...t, open: false }))}
      >
        <Alert severity={toast.severity}>{toast.message}</Alert>
      </Snackbar>
    </Container>
  );
}
