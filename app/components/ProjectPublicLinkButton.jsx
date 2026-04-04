"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";
import {
  Button,
  Box,
  TextField,
  IconButton,
  Typography,
  Collapse,
  Tooltip,
  CircularProgress,
  Alert,
} from "@mui/material";
import LinkIcon from "@mui/icons-material/Link";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CheckIcon from "@mui/icons-material/Check";
import { isAdmin } from "@/lib/isAdmin";

export default function ProjectPublicLinkButton({ projectId }) {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  if (!isAdmin(session)) {
    return null;
  }

  const handleClick = async () => {
    if (open && url) {
      setOpen(false);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const { data } = await axios.get(`/api/admin/projects/${projectId}/public-link`);
      setUrl(data.publicUrl);
      setOpen(true);
    } catch (e) {
      const msg =
        e.response?.data?.error ||
        (e.response?.status === 500
          ? "Check that BASE_URL is set in the server environment."
          : "Could not load public link.");
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Unable to copy to clipboard.");
    }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 1 }}>
      <Button
        variant="outlined"
        color="primary"
        startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <LinkIcon />}
        onClick={handleClick}
        disabled={loading}
      >
        {open && url ? "Hide public link" : "Public link"}
      </Button>
      <Collapse in={open && !!url} sx={{ width: "100%", maxWidth: 560 }}>
        <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1, flexWrap: "wrap" }}>
          <TextField
            size="small"
            fullWidth
            value={url}
            InputProps={{ readOnly: true }}
            label="Shareable URL (QR-friendly)"
            sx={{ flex: 1, minWidth: 220 }}
          />
          <Tooltip title={copied ? "Copied" : "Copy"}>
            <span>
              <IconButton
                color={copied ? "success" : "default"}
                onClick={handleCopy}
                aria-label="Copy public link"
                disabled={!url}
              >
                {copied ? <CheckIcon /> : <ContentCopyIcon />}
              </IconButton>
            </span>
          </Tooltip>
        </Box>
        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5 }}>
          Read-only page for hardware labels; no login required.
        </Typography>
      </Collapse>
      {error && (
        <Alert severity="error" sx={{ width: "100%", maxWidth: 560 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}
    </Box>
  );
}
