// app/theme/trackLabTheme.js
import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    primary: {
      main: '#4361ee', // Professional blue
      light: '#6588ff',
      dark: '#2b3fbb',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#f72585', // Vibrant pink for accent
      light: '#ff5bac',
      dark: '#c00060',
    },
    success: {
      main: '#06d6a0', // Mint green
      light: '#56ffcf',
      dark: '#00a472',
    },
    warning: {
      main: '#ffd166', // Amber
      light: '#ffff96',
      dark: '#caa034',
    },
    error: {
      main: '#ef476f', // Soft red
      light: '#ff789c',
      dark: '#b91646',
    },
    background: {
      default: '#f8fafc', // Very light blue-gray
      paper: '#ffffff',
    },
    text: {
      primary: '#1e293b', // Dark blue-gray
      secondary: '#64748b', // Medium blue-gray
      disabled: '#94a3b8', // Light blue-gray
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 700,
      letterSpacing: '-0.01em',
    },
    h5: {
      fontWeight: 700,
      letterSpacing: '-0.01em',
    },
    h6: {
      fontWeight: 600,
      letterSpacing: '0.01em',
    },
    subtitle1: {
      fontWeight: 600,
    },
    subtitle2: {
      fontWeight: 600,
      letterSpacing: '0.05em',
      textTransform: 'uppercase',
      fontSize: '0.75rem',
    },
    button: {
      fontWeight: 600,
      textTransform: 'none',
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
          },
        },
        contained: {
          '&:hover': {
            boxShadow: '0 6px 16px rgba(0,0,0,0.1)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          padding: '16px 20px',
        },
        head: {
          fontWeight: 600,
          backgroundColor: '#f8fafc',
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:last-child td': {
            borderBottom: 0,
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
  },
  shadows: [
    'none',
    '0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.1)',
    '0 3px 6px rgba(0,0,0,0.05), 0 2px 4px rgba(0,0,0,0.1)',
    '0 10px 20px rgba(0,0,0,0.05), 0 3px 6px rgba(0,0,0,0.1)',
    '0 15px 25px rgba(0,0,0,0.05), 0 5px 10px rgba(0,0,0,0.1)',
    '0 20px 40px rgba(0,0,0,0.05), 0 10px 20px rgba(0,0,0,0.1)',
    ...Array(19).fill('none'), // Fill the rest with none
  ],
});