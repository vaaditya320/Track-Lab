"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import axios from "axios";
import {
  Container, Typography, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Snackbar, Alert,
  CircularProgress, Box, Grid, Card, CardContent, TextField,
  MenuItem, Select, InputLabel, FormControl, Checkbox, LinearProgress
} from "@mui/material";
import { motion } from "framer-motion";

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingProjectId, setLoadingProjectId] = useState(null);
  const [filter, setFilter] = useState({ leader: "", status: "", search: "" });
  const [toast, setToast] = useState({ open: false, message: "", severity: "success" });
  const [error, setError] = useState("");
  const [selectedProjects, setSelectedProjects] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  useEffect(() => {
    if (status === "authenticated") {
      fetchProjects();
    }
  }, [status]);

  useEffect(() => {
    const filtered = projects.filter(project =>
      (filter.leader ? project.leaderName.toLowerCase().includes(filter.leader.toLowerCase()) : true) &&
      (filter.status ? project.status.toLowerCase() === filter.status.toLowerCase() : true) &&
      (filter.search ? project.title.toLowerCase().includes(filter.search.toLowerCase()) || project.leaderName.toLowerCase().includes(filter.search.toLowerCase()) : true)
    );
    setFilteredProjects(filtered);
  }, [filter, projects]);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/api/admin/projects", {
        headers: { Authorization: `Bearer ${session.user.id}` },
      });
      setProjects(response.data);
      setFilteredProjects(response.data);
    } catch (error) {
      setError("Failed to fetch projects");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProject = async (projectId) => {
    setLoadingProjectId(projectId);
    try {
      await axios.delete(`/api/admin/projects/${projectId}`, {
        headers: { Authorization: `Bearer ${session.user.id}` },
      });
      setToast({ open: true, message: "Project deleted successfully", severity: "success" });
      fetchProjects();
    } catch (error) {
      setToast({ open: true, message: "Failed to delete project", severity: "error" });
    } finally {
      setLoadingProjectId(null);
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedProjects.length === 0) return;

    try {
      await Promise.all(selectedProjects.map(id =>
        axios.delete(`/api/admin/projects/${id}`, {
          headers: { Authorization: `Bearer ${session.user.id}` },
        })
      ));
      setToast({ open: true, message: "Selected projects deleted successfully", severity: "success" });
      setSelectedProjects([]);
      setSelectAll(false);
      fetchProjects();
    } catch (error) {
      setToast({ open: true, message: "Failed to delete selected projects", severity: "error" });
    }
  };

  const handleSelectProject = (projectId) => {
    setSelectedProjects((prev) =>
      prev.includes(projectId) ? prev.filter(id => id !== projectId) : [...prev, projectId]
    );
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedProjects([]);
    } else {
      setSelectedProjects(filteredProjects.map(project => project.id));
    }
    setSelectAll(!selectAll);
  };

  const handleFilterChange = (e) => {
    setFilter({ ...filter, [e.target.name]: e.target.value });
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      {loading && <LinearProgress color="primary" />}

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Admin Dashboard
        </Typography>

        {status === "authenticated" ? (
          <>
            <Box sx={{ mb: 4 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    fullWidth
                    label="Search by Leader or Title"
                    variant="outlined"
                    value={filter.search}
                    name="search"
                    onChange={handleFilterChange}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <FormControl fullWidth>
                    <InputLabel>Status</InputLabel>
                    <Select value={filter.status} label="Status" name="status" onChange={handleFilterChange}>
                      <MenuItem value="">All</MenuItem>
                      <MenuItem value="PARTIAL">Partial</MenuItem>
                      <MenuItem value="SUBMITTED">Submitted</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    fullWidth
                    label="Filter by Leader"
                    variant="outlined"
                    value={filter.leader}
                    name="leader"
                    onChange={handleFilterChange}
                  />
                </Grid>
              </Grid>
            </Box>

            {error && (
              <Typography color="error" sx={{ mb: 3 }}>
                {error}
              </Typography>
            )}

            <Card sx={{ borderRadius: 2 }}>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Manage Projects
                </Typography>
                <Button
                  variant="contained"
                  color="error"
                  onClick={handleDeleteSelected}
                  disabled={selectedProjects.length === 0}
                  sx={{ mb: 2 }}
                >
                  Delete Selected
                </Button>
                <TableContainer component={Paper} elevation={3}>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ backgroundColor: "#eeeeee" }}>
                        <TableCell>
                          <Checkbox checked={selectAll} onChange={handleSelectAll} />
                        </TableCell>
                        <TableCell><strong>S. No.</strong></TableCell>
                        <TableCell><strong>Project Title</strong></TableCell>
                        <TableCell><strong>Leader</strong></TableCell>
                        <TableCell><strong>Status</strong></TableCell>
                        <TableCell><strong>Actions</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredProjects.map((project, index) => (
                        <TableRow key={project.id}>
                          <TableCell>
                            <Checkbox
                              checked={selectedProjects.includes(project.id)}
                              onChange={() => handleSelectProject(project.id)}
                            />
                          </TableCell>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell>{project.title}</TableCell>
                          <TableCell>{project.leaderName}</TableCell>
                          <TableCell>{project.status}</TableCell>
                          <TableCell>
                            <Button variant="contained" color="primary" onClick={() => router.push(`/admin/projects/${project.id}`)} sx={{ mr: 1 }}>
                              View Details
                            </Button>
                            <Button variant="contained" color="error" onClick={() => handleDeleteProject(project.id)} disabled={loadingProjectId === project.id}>
                              {loadingProjectId === project.id ? <CircularProgress size={24} color="inherit" /> : "Delete"}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </>
        ) : (
          <Typography variant="body1" color="error">
            Please sign in to access the admin dashboard.
          </Typography>
        )}
      </Container>
    </motion.div>
  );
}