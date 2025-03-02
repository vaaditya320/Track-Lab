// app/components/ProjectStatsCard.jsx
import React from 'react';
import { Box, Card, CardContent, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import AssignmentIcon from '@mui/icons-material/Assignment';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import TaskAltIcon from '@mui/icons-material/TaskAlt';

const ProjectStatsCard = ({ title, count, icon, color }) => {
  const getIcon = () => {
    switch (icon) {
      case 'total':
        return <AssignmentIcon sx={{ fontSize: 40, color }} />;
      case 'progress':
        return <PendingActionsIcon sx={{ fontSize: 40, color }} />;
      case 'submitted':
        return <TaskAltIcon sx={{ fontSize: 40, color }} />;
      default:
        return <AssignmentIcon sx={{ fontSize: 40, color }} />;
    }
  };

  return (
    <Card 
      component={motion.div}
      whileHover={{ y: -5, boxShadow: '0 10px 20px rgba(0,0,0,0.1)' }}
      transition={{ duration: 0.2 }}
      sx={{ height: '100%' }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h4" fontWeight="bold">
              {count}
            </Typography>
          </Box>
          <Box 
            sx={{ 
              p: 1.5, 
              borderRadius: '12px',
              bgcolor: `${color}15`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {getIcon()}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default ProjectStatsCard;