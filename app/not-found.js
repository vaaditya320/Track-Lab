"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Stars } from "@react-three/drei";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Container, Typography, Button, Box } from "@mui/material";
import { useState, useRef } from "react";

function AnimatedStars({ zoomOut }) {
  const starRef = useRef();
  let speed = 0.02; // Initial slow speed

  useFrame(({ camera }) => {
    if (zoomOut) {
      speed = Math.min(speed * 1.15, 3); // Exponential speed-up (warp effect)
      camera.position.z += speed;
    }
  });

  return <Stars ref={starRef} />;
}

export default function NotFound() {
  const router = useRouter();
  const [zoomOut, setZoomOut] = useState(false);

  const handleRedirect = () => {
    setZoomOut(true); // Start warp effect
    setTimeout(() => {
      router.push("/"); // Redirect after effect completes
    }, 1500);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "#000",
        color: "white",
        overflow: "hidden",
      }}
    >
      {/* 3D Space Background */}
      <Canvas style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}>
        <ambientLight intensity={0.5} />
        <AnimatedStars zoomOut={zoomOut} />
      </Canvas>

      {/* Content */}
      <Container maxWidth="md" sx={{ textAlign: "center", position: "relative", zIndex: 2 }}>
        <motion.div initial={{ y: -20 }} animate={{ y: 10 }} transition={{ repeat: Infinity, duration: 2, ease: "easeInOut", repeatType: "reverse" }}>
          <Typography variant="h2" fontWeight="bold" sx={{ color: "red" }}>
            404 - Lost in Space
          </Typography>
        </motion.div>

        <Typography variant="h5" sx={{ mt: 2, mb: 4 }}>
        It looks like this page got swallowed by a black hole.
        </Typography>

        <Box>
          <Button variant="contained" color="primary" onClick={handleRedirect}>
          Escape
          </Button>
        </Box>
      </Container>
    </motion.div>
  );
}
