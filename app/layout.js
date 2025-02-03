"use client"; // Ensure this is a client component

import { useSession, SessionProvider } from "next-auth/react";
import Link from "next/link";
import { Fragment } from "react";
import { AppBar, Toolbar, Typography, Button, Container } from "@mui/material";
import { motion } from "framer-motion";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/react"
import "./globals.css";


export default function Layout({ children }) {
  return (
    <SessionProvider>
      <html lang="en">
        <body>
          <SpeedInsights />
          <Analytics/> 

          <Fragment>
            {/* Header */}
            <AppBar position="static" color="primary" elevation={4}>
              <Toolbar>
                <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                  <Link href="/" style={{ textDecoration: "none", color: "inherit" }}>
                    TrackLab
                  </Link>
                </Typography>
                <UserHeader />
              </Toolbar>
            </AppBar>

            {/* Main content with animation */}
            <motion.main
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Container sx={{ py: 4 }}>{children}</Container>
            </motion.main>

            {/* Footer */}
            <motion.footer
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <AppBar position="static" color="primary" elevation={4} sx={{ mt: 4, py: 1 }}>
                <Toolbar sx={{ justifyContent: "center" }}>
                  <Typography variant="body2" sx={{ color: "white" }}>
                    &copy; 2025 TrackLab. All rights reserved. |{" "}
                    <Link
                      href="https://aadityavinayak.in.net"
                      target="_blank"
                      style={{ color: "#90caf9", textDecoration: "none", fontWeight: "bold" }}
                    >
                      Developed & Maintained by Aaditya Vinayak
                    </Link>
                  </Typography>
                </Toolbar>
              </AppBar>
            </motion.footer>
          </Fragment>
        </body>
      </html>
    </SessionProvider>
  );
}

// User session handling component
function UserHeader() {
  const { data: session, status } = useSession();

  return status === "authenticated" ? (
    <div>
      <Typography variant="body1" sx={{ mr: 2 }}>
        Welcome, {session?.user?.name}
      </Typography>
      <Link href="/api/auth/signout">
        <Button variant="contained" color="secondary">
          Sign Out
        </Button>
      </Link>
    </div>
  ) : (
    <Link href="/api/auth/signin">
      <Button variant="contained" color="success">
        Sign In
      </Button>
    </Link>
  );
}
