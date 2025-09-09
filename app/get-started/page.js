"use client";

import { useSession } from "next-auth/react";
import { useMemo, useState } from "react";
import { Box, Container, Typography, Tabs, Tab, Card, CardContent, useTheme, List, ListItem, ListItemIcon, ListItemText, Divider } from "@mui/material";
import { motion } from "framer-motion";
import LoginIcon from '@mui/icons-material/Login';
import AddIcon from '@mui/icons-material/Add';
import DownloadIcon from '@mui/icons-material/Download';
import SendIcon from '@mui/icons-material/Send';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ContactSupportIcon from '@mui/icons-material/ContactSupport';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import AssessmentIcon from '@mui/icons-material/Assessment';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import StarIcon from '@mui/icons-material/Star';

function a11yProps(index) {
  return {
    id: `guideline-tab-${index}`,
    "aria-controls": `guideline-tabpanel-${index}`,
  };
}

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`guideline-tabpanel-${index}`}
      aria-labelledby={`guideline-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 2 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function StudentGuidelines() {
  const theme = useTheme();
  
  const guidelines = [
    {
      title: "Login",
      icon: <LoginIcon />,
      items: [
        "Login using your official @poornima.org email ID",
        "On your first login, enter basic details (Branch, Section, and Batch) carefully and save it"
      ]
    },
    {
      title: "Project Creation",
      icon: <AddIcon />,
      items: [
        "On the dashboard, click 'Create Project'",
        "Only the team leader should create the project (team members don't need separate entries)",
        "Do not add the team leader's name again under team members (system automatically registers the leader)",
        "Select your assigned teacher from the dropdown list",
        "Enter required components in comma-separated format (e.g., Arduino, L298, Breadboard)"
      ]
    },
    {
      title: "Partial Project Report & Component Collection",
      icon: <DownloadIcon />,
      items: [
        "After saving, the team leader can download the partial project report from the dashboard",
        "The report will also be sent to the leader's email",
        "Print the report and submit it at Idealab to receive your project components"
      ]
    },
    {
      title: "Final Submission",
      icon: <SendIcon />,
      items: [
        "Once your project is complete, consult your assigned teacher for approval",
        "On the Submit Page, provide:",
        "• A short summary of the project",
        "• An image of your final project"
      ]
    }
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Typography variant="h5" fontWeight="bold" gutterBottom color="primary">
          Guidelines for Using the Project Management Portal
        </Typography>
      </motion.div>

      {guidelines.map((section, index) => (
        <motion.div
          key={section.title}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
        >
          <Card 
            elevation={0} 
            sx={{ 
              borderRadius: 2, 
              boxShadow: 1,
              border: `1px solid ${theme.palette.divider}`,
              '&:hover': {
                boxShadow: 3,
                transform: 'translateY(-2px)',
                transition: 'all 0.3s ease-in-out'
              }
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box 
                  sx={{ 
                    p: 1, 
                    borderRadius: '50%', 
                    backgroundColor: theme.palette.primary.main,
                    color: 'white',
                    mr: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {section.icon}
                </Box>
                <Typography variant="h6" fontWeight="bold" color="primary">
                  {section.title}
                </Typography>
              </Box>
              
              <List sx={{ pl: 0 }}>
                {section.items.map((item, itemIndex) => (
                  <motion.div
                    key={itemIndex}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: (index * 0.1) + (itemIndex * 0.05) }}
                  >
                    <ListItem sx={{ px: 0, py: 0.5 }}>
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        <CheckCircleIcon 
                          sx={{ 
                            fontSize: 16, 
                            color: theme.palette.success.main 
                          }} 
                        />
                      </ListItemIcon>
                      <ListItemText 
                        primary={
                          <Typography variant="body1" sx={{ lineHeight: 1.6 }}>
                            {item}
                          </Typography>
                        }
                      />
                    </ListItem>
                  </motion.div>
                ))}
              </List>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </Box>
  );
}

function TeacherGuidelines() {
  const theme = useTheme();
  
  const guidelines = [
    {
      title: "Login",
      icon: <LoginIcon />,
      items: [
        "Login using your official @poornima.org email ID",
        "On your first login, enter details (Branch, Section, Batch, and Phone Number) and save it"
      ]
    },
    {
      title: "Viewing Assigned Projects",
      icon: <VisibilityIcon />,
      items: [
        "After logging in, you will see a button labeled 'Assigned Projects'",
        "From here, you can view all the projects created by students assigned to you",
        "You will also have the option to download project data for review or record-keeping"
      ]
    },
    {
      title: "Contacting Admins",
      icon: <ContactSupportIcon />,
      items: [
        "For any queries or issues, use the 'Contact Admins' button available in the portal",
        "The admin team will assist with technical support or portal-related concerns"
      ]
    }
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Typography variant="h5" fontWeight="bold" gutterBottom color="primary">
          Guidelines for Teachers Using the Project Management Portal
        </Typography>
      </motion.div>

      {guidelines.map((section, index) => (
        <motion.div
          key={section.title}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
        >
          <Card 
            elevation={0} 
            sx={{ 
              borderRadius: 2, 
              boxShadow: 1,
              border: `1px solid ${theme.palette.divider}`,
              '&:hover': {
                boxShadow: 3,
                transform: 'translateY(-2px)',
                transition: 'all 0.3s ease-in-out'
              }
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box 
                  sx={{ 
                    p: 1, 
                    borderRadius: '50%', 
                    backgroundColor: theme.palette.secondary.main,
                    color: 'white',
                    mr: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {section.icon}
                </Box>
                <Typography variant="h6" fontWeight="bold" color="secondary">
                  {section.title}
                </Typography>
              </Box>
              
              <List sx={{ pl: 0 }}>
                {section.items.map((item, itemIndex) => (
                  <motion.div
                    key={itemIndex}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: (index * 0.1) + (itemIndex * 0.05) }}
                  >
                    <ListItem sx={{ px: 0, py: 0.5 }}>
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        <CheckCircleIcon 
                          sx={{ 
                            fontSize: 16, 
                            color: theme.palette.success.main 
                          }} 
                        />
                      </ListItemIcon>
                      <ListItemText 
                        primary={
                          <Typography variant="body1" sx={{ lineHeight: 1.6 }}>
                            {item}
                          </Typography>
                        }
                      />
                    </ListItem>
                  </motion.div>
                ))}
              </List>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </Box>
  );
}

function AdminGuidelines() {
  const theme = useTheme();
  
  const guidelines = [
    {
      title: "Login",
      icon: <LoginIcon />,
      items: [
        "Login using your official @poornima.org email ID",
        "On your first login, enter details (Branch, Section, Batch, and Phone Number) and save it"
      ]
    },
    {
      title: "Accessing the Admin Panel",
      icon: <AdminPanelSettingsIcon />,
      items: [
        "Click on your Profile Icon in the top-right corner",
        "Select the 'Admin Panel' button to enter the admin section"
      ]
    },
    {
      title: "Managing Projects",
      icon: <ManageAccountsIcon />,
      items: [
        "The Manage Projects page is the default view in the Admin Panel",
        "Here, you can see all projects currently being created in Idealab"
      ]
    },
    {
      title: "Viewing System Logs",
      icon: <AssessmentIcon />,
      items: [
        "Click the 'System Logs' button to view app activity logs",
        "Logs include actions like user promotions and details of who performed the action"
      ]
    },
    {
      title: "Managing Achievements",
      icon: <EmojiEventsIcon />,
      items: [
        "Navigate to the Achievements Page",
        "As an admin, you can add, delete, or manage achievement records"
      ]
    },
    {
      title: "Managing Featured Projects (Idealab Star Projects)",
      icon: <StarIcon />,
      items: [
        "Admins can create or delete Star Projects for Idealab",
        "These projects are highlighted on the /idealab/projects page"
      ]
    }
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Typography variant="h5" fontWeight="bold" gutterBottom color="primary">
          Guidelines for Admins Using the Project Management Portal
        </Typography>
      </motion.div>

      {guidelines.map((section, index) => (
        <motion.div
          key={section.title}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
        >
          <Card 
            elevation={0} 
            sx={{ 
              borderRadius: 2, 
              boxShadow: 1,
              border: `1px solid ${theme.palette.divider}`,
              '&:hover': {
                boxShadow: 3,
                transform: 'translateY(-2px)',
                transition: 'all 0.3s ease-in-out'
              }
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box 
                  sx={{ 
                    p: 1, 
                    borderRadius: '50%', 
                    backgroundColor: theme.palette.error.main,
                    color: 'white',
                    mr: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {section.icon}
                </Box>
                <Typography variant="h6" fontWeight="bold" color="error">
                  {section.title}
                </Typography>
              </Box>
              
              <List sx={{ pl: 0 }}>
                {section.items.map((item, itemIndex) => (
                  <motion.div
                    key={itemIndex}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: (index * 0.1) + (itemIndex * 0.05) }}
                  >
                    <ListItem sx={{ px: 0, py: 0.5 }}>
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        <CheckCircleIcon 
                          sx={{ 
                            fontSize: 16, 
                            color: theme.palette.success.main 
                          }} 
                        />
                      </ListItemIcon>
                      <ListItemText 
                        primary={
                          <Typography variant="body1" sx={{ lineHeight: 1.6 }}>
                            {item}
                          </Typography>
                        }
                      />
                    </ListItem>
                  </motion.div>
                ))}
              </List>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </Box>
  );
}

export default function GetStartedPage() {
  const theme = useTheme();
  const { data: session, status } = useSession();

  const role = session?.user?.role;

  const tabs = useMemo(() => {
    if (status !== "authenticated") {
      return ["Student"]; // unauthenticated: only student guidelines
    }
    if (role === "ADMIN" || role === "SUPER_ADMIN") {
      return ["Student", "Teacher", "Admin"];
    }
    if (role === "TEACHER") {
      return ["Student", "Teacher"];
    }
    return ["Student"]; // default fallback
  }, [status, role]);

  const [tabIndex, setTabIndex] = useState(0);

  const showTabs = tabs.length > 1; // only show bar when more than one option

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: theme.palette.background.default, pb: 8 }}>
      <Container maxWidth="md" sx={{ py: { xs: 2, md: 4 } }}>
        <Box sx={{ mb: 3, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Typography 
            variant="h4" 
            fontWeight="bold"
          >
            Get Started
          </Typography>
        </Box>

        {showTabs ? (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card 
              elevation={0}
              sx={{ 
                mb: 4, 
                borderRadius: 3,
                background: `linear-gradient(135deg, ${theme.palette.background.paper}, ${theme.palette.primary.light}08)`,
                border: `1px solid ${theme.palette.divider}`,
                overflow: 'hidden'
              }}
            >
              <Box sx={{ p: 2 }}>
                <Typography 
                  variant="h6" 
                  fontWeight="bold" 
                  color="text.secondary" 
                  sx={{ mb: 2, textAlign: 'center' }}
                >
                  Select Your Role
                </Typography>
                <Box sx={{ 
                  display: 'flex', 
                  gap: 1, 
                  justifyContent: 'center',
                  flexWrap: 'wrap'
                }}>
                  {tabs.map((label, index) => (
                    <motion.div
                      key={label}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Box
                        onClick={() => setTabIndex(index)}
                        sx={{
                          px: 4,
                          py: 2,
                          borderRadius: 2,
                          cursor: 'pointer',
                          position: 'relative',
                          minWidth: 120,
                          textAlign: 'center',
                          transition: 'all 0.3s ease-in-out',
                          backgroundColor: tabIndex === index 
                            ? theme.palette.primary.main 
                            : 'transparent',
                          color: tabIndex === index 
                            ? 'white' 
                            : theme.palette.text.secondary,
                          border: `2px solid ${tabIndex === index 
                            ? theme.palette.primary.main 
                            : theme.palette.divider}`,
                          '&:hover': {
                            backgroundColor: tabIndex === index 
                              ? theme.palette.primary.dark 
                              : theme.palette.action.hover,
                            borderColor: tabIndex === index 
                              ? theme.palette.primary.dark 
                              : theme.palette.primary.light,
                            color: tabIndex === index 
                              ? 'white' 
                              : theme.palette.primary.main,
                            transform: 'translateY(-2px)',
                            boxShadow: 2
                          }
                        }}
                      >
                        <Typography 
                          variant="button" 
                          fontWeight="bold"
                          sx={{ 
                            fontSize: '0.875rem',
                            textTransform: 'none',
                            letterSpacing: '0.5px'
                          }}
                        >
                          {label}
                        </Typography>
                        {tabIndex === index && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 0.2 }}
                            style={{
                              position: 'absolute',
                              bottom: -2,
                              left: '50%',
                              transform: 'translateX(-50%)',
                              width: 8,
                              height: 8,
                              borderRadius: '50%',
                              backgroundColor: 'white',
                              boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                            }}
                          />
                        )}
                      </Box>
                    </motion.div>
                  ))}
                </Box>
              </Box>
            </Card>
          </motion.div>
        ) : null}

        {/* Panels */}
        {tabs.map((label, index) => (
          <TabPanel key={label} value={tabIndex} index={index}>
            {label === "Student" && <StudentGuidelines />}
            {label === "Teacher" && <TeacherGuidelines />}
            {label === "Admin" && <AdminGuidelines />}
          </TabPanel>
        ))}
      </Container>
    </Box>
  );
}


