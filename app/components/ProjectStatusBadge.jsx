// app/components/ProjectStatusBadge.jsx
import React from 'react';
import { Chip } from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const ProjectStatusBadge = ({ status }) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'PARTIAL':
        return {
          label: 'In Progress',
          color: 'warning',
          icon: <AccessTimeIcon fontSize="small" />
        };
      case 'SUBMITTED':
        return {
          label: 'Submitted',
          color: 'success',
          icon: <CheckCircleIcon fontSize="small" />
        };
      default:
        return {
          label: status,
          color: 'default',
          icon: null
        };
    }
  };

  const { label, color, icon } = getStatusConfig();

  return (
    <Chip
      label={label}
      color={color}
      size="small"
      icon={icon}
      sx={{ 
        fontWeight: 500,
        borderRadius: 6,
        '& .MuiChip-icon': {
          ml: 0.5,
        }
      }}
    />
  );
};

export default ProjectStatusBadge;