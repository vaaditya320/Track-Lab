// app/components/DashboardSkeleton.jsx
import React from 'react';
import { Box, Skeleton, Grid, Card, CardContent } from '@mui/material';

const DashboardSkeleton = () => {
  return (
    <Box sx={{ width: '100%' }}>
      {/* Welcome banner skeleton */}
      <Skeleton 
        variant="rectangular" 
        height={120} 
        sx={{ borderRadius: 3, mb: 4 }} 
      />
      
      {/* Stats cards skeleton */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[1, 2, 3].map((item) => (
          <Grid item xs={12} md={4} key={item}>
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Box>
                    <Skeleton variant="text" width={100} sx={{ mb: 1 }} />
                    <Skeleton variant="rectangular" width={60} height={40} />
                  </Box>
                  <Skeleton variant="circular" width={60} height={60} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      
      {/* Table skeleton */}
      <Skeleton variant="rectangular" height={50} sx={{ borderRadius: 1, mb: 0.5 }} />
      {[1, 2, 3, 4].map((item) => (
        <Skeleton 
          key={item}
          variant="rectangular" 
          height={60} 
          sx={{ borderRadius: 1, mb: 0.5 }} 
        />
      ))}
    </Box>
  );
};

export default DashboardSkeleton;