"use client";

import React, { useEffect, useRef, useState } from "react";
import { Box, Container, Typography, Button } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { motion } from "framer-motion";
import Link from "next/link";
import * as THREE from "three";

// Typewriter effect for streaming text
const TypewriterText = ({ text, delay = 40 }) => {
  const theme = useTheme();
  const [displayedText, setDisplayedText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayedText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, delay);
      
      return () => clearTimeout(timer);
    } else {
      setIsComplete(true);
    }
  }, [currentIndex, text, delay]);

  return (
    <>
      <Typography
        variant="h5"
        fontWeight="500"
        sx={{
          mb: 2,
          height: "2em",
          display: "block",
          color: "primary.main",
        }}
      >
        {displayedText}
        {!isComplete && (
          <motion.span
            animate={{ opacity: [0, 1, 0] }}
            transition={{ repeat: Infinity, duration: 0.8 }}
          >
            |
          </motion.span>
        )}
      </Typography>
    </>
  );
};

// Background 3D Animation Component
const BackgroundAnimation = () => {
  const theme = useTheme();
  const mountRef = useRef(null);

  useEffect(() => {
    // Scene setup
    const scene = new THREE.Scene();
    
    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 20;
    
    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true,
    });
    renderer.setClearColor(0x000000, 0); // Transparent background
    renderer.setSize(window.innerWidth, window.innerHeight);
    mountRef.current.appendChild(renderer.domElement);
    
    // Add floating particles
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 100;
    const posArray = new Float32Array(particlesCount * 3);
    const scaleArray = new Float32Array(particlesCount);
    
    for (let i = 0; i < particlesCount * 3; i += 3) {
      // Position particles throughout the entire scene
      posArray[i] = (Math.random() - 0.5) * 30;      // x
      posArray[i + 1] = (Math.random() - 0.5) * 20;  // y
      posArray[i + 2] = (Math.random() - 0.5) * 10;  // z
      
      // Random scale for each particle
      scaleArray[i/3] = Math.random() * 0.5 + 0.1;
    }
    
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    particlesGeometry.setAttribute('scale', new THREE.BufferAttribute(scaleArray, 1));
    
    // Create different particle types with theme colors
    const createParticles = (color, size, count) => {
      const geometry = new THREE.BufferGeometry();
      const positions = new Float32Array(count * 3);
      
      for (let i = 0; i < count * 3; i += 3) {
        positions[i] = (Math.random() - 0.5) * 30;
        positions[i + 1] = (Math.random() - 0.5) * 20;
        positions[i + 2] = (Math.random() - 0.5) * 10;
      }
      
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      
      const material = new THREE.PointsMaterial({
        size,
        color: new THREE.Color(color),
        transparent: true,
        opacity: 0.6,
      });
      
      return new THREE.Points(geometry, material);
    };
    
    // Create different particle systems with theme colors
    const particles1 = createParticles(theme.palette.primary.light, 0.05, 200);
    const particles2 = createParticles(theme.palette.primary.main, 0.03, 300);
    const particles3 = createParticles(theme.palette.secondary.light, 0.02, 400);
    
    scene.add(particles1, particles2, particles3);
    
    // Add small floating cubes
    const cubes = [];
    for (let i = 0; i < 15; i++) {
      const size = Math.random() * 0.3 + 0.1;
      const geometry = new THREE.BoxGeometry(size, size, size);
      
      // Choose a random color from theme
      const colors = [
        theme.palette.primary.main,
        theme.palette.primary.light,
        theme.palette.secondary.main,
        theme.palette.secondary.light,
        theme.palette.error.main,
      ];
      
      const material = new THREE.MeshBasicMaterial({
        color: new THREE.Color(colors[Math.floor(Math.random() * colors.length)]),
        transparent: true,
        opacity: 0.7,
        wireframe: Math.random() > 0.5,
      });
      
      const cube = new THREE.Mesh(geometry, material);
      cube.position.set(
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 15,
        (Math.random() - 0.5) * 10
      );
      
      // Random rotation speeds
      cube.userData = {
        rotationSpeed: {
          x: (Math.random() - 0.5) * 0.01,
          y: (Math.random() - 0.5) * 0.01,
          z: (Math.random() - 0.5) * 0.01,
        },
        movementSpeed: {
          x: (Math.random() - 0.5) * 0.005,
          y: (Math.random() - 0.5) * 0.005,
        }
      };
      
      scene.add(cube);
      cubes.push(cube);
    }
    
    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      
      // Animate particles
      particles1.rotation.y += 0.0003;
      particles2.rotation.x += 0.0002;
      particles3.rotation.z += 0.0001;
      
      // Animate cubes
      cubes.forEach(cube => {
        cube.rotation.x += cube.userData.rotationSpeed.x;
        cube.rotation.y += cube.userData.rotationSpeed.y;
        cube.rotation.z += cube.userData.rotationSpeed.z;
        
        // Slight movement
        cube.position.x += cube.userData.movementSpeed.x;
        cube.position.y += cube.userData.movementSpeed.y;
        
        // Loop back if out of bounds
        if (Math.abs(cube.position.x) > 15) {
          cube.userData.movementSpeed.x *= -1;
        }
        if (Math.abs(cube.position.y) > 10) {
          cube.userData.movementSpeed.y *= -1;
        }
      });
      
      renderer.render(scene, camera);
    };
    
    // Handle resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    
    window.addEventListener('resize', handleResize);
    
    animate();
    
    // Cleanup
    return () => {
      if (mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
      window.removeEventListener('resize', handleResize);
    };
  }, [theme]);
  
  return (
    <Box 
      ref={mountRef} 
      sx={{ 
        width: '100%', 
        height: '100%',
        position: 'absolute',
        top: 0,
        left: 0,
        zIndex: 0,
        pointerEvents: 'none',
      }} 
    />
  );
};

// Main 3D feature component for the right side
const MainFeature3D = () => {
  const theme = useTheme();
  const mountRef = useRef(null);

  useEffect(() => {
    // Scene setup
    const scene = new THREE.Scene();
    
    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      1, // Square aspect ratio initially, will be updated in resize handler
      0.1,
      1000
    );
    camera.position.z = 5;
    
    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true,
    });
    renderer.setClearColor(0x000000, 0); // Transparent background
    
    // Initial size will be updated in resize handler
    const updateSize = () => {
      const containerWidth = mountRef.current.clientWidth;
      const containerHeight = mountRef.current.clientHeight;
      renderer.setSize(containerWidth, containerHeight);
      camera.aspect = containerWidth / containerHeight;
      camera.updateProjectionMatrix();
    };
    
    // Add renderer to DOM
    mountRef.current.appendChild(renderer.domElement);
    updateSize();
    
    // Create a glowing wireframe globe
    const globeGeometry = new THREE.IcosahedronGeometry(1.5, 5);
    const globeMaterial = new THREE.MeshBasicMaterial({
      color: new THREE.Color(theme.palette.primary.main),
      wireframe: true,
      transparent: true,
      opacity: 0.7,
    });
    const globe = new THREE.Mesh(globeGeometry, globeMaterial);
    scene.add(globe);
    
    // Create a ring
    const ringGeometry = new THREE.TorusGeometry(2.3, 0.1, 16, 100);
    const ringMaterial = new THREE.MeshBasicMaterial({
      color: new THREE.Color(theme.palette.secondary.main),
      wireframe: true,
      transparent: true,
      opacity: 0.7,
    });
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.rotation.x = Math.PI / 3;
    scene.add(ring);
    
    // Create a secondary ring
    const ring2Geometry = new THREE.TorusGeometry(2, 0.05, 16, 100);
    const ring2Material = new THREE.MeshBasicMaterial({
      color: new THREE.Color(theme.palette.primary.light),
      wireframe: true,
      transparent: true,
      opacity: 0.5,
    });
    const ring2 = new THREE.Mesh(ring2Geometry, ring2Material);
    ring2.rotation.x = Math.PI / 2;
    ring2.rotation.y = Math.PI / 6;
    scene.add(ring2);
    
    // Add a pulsing effect to the globe
    let pulseDirection = 1;
    let pulseValue = 0;
    
    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      
      // Rotate the globe slowly
      globe.rotation.y += 0.005;
      globe.rotation.x += 0.002;
      
      // Rotate the rings
      ring.rotation.z += 0.003;
      ring2.rotation.z -= 0.002;
      
      // Pulsing effect for globe
      pulseValue += 0.01 * pulseDirection;
      if (pulseValue > 1) {
        pulseDirection = -1;
      } else if (pulseValue < 0) {
        pulseDirection = 1;
      }
      
      // Apply pulse to globe scale and opacity
      const pulseScale = 1 + pulseValue * 0.05;
      globe.scale.set(pulseScale, pulseScale, pulseScale);
      globeMaterial.opacity = 0.5 + pulseValue * 0.2;
      
      renderer.render(scene, camera);
    };
    
    // Handle window resize
    const handleResize = () => {
      updateSize();
    };
    
    window.addEventListener('resize', handleResize);
    
    animate();
    
    // Cleanup
    return () => {
      if (mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
      window.removeEventListener('resize', handleResize);
    };
  }, [theme]);
  
  return (
    <Box 
      ref={mountRef} 
      sx={{ 
        width: '100%', 
        height: '100%',
        borderRadius: 4,
        overflow: 'hidden',
      }} 
    />
  );
};

export default function NotFound() {
  const theme = useTheme();
  
  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100%',
        backgroundColor: 'background.default',
        overflow: 'hidden',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
      }}
    >
      {/* Background 3D elements that float across the entire page */}
      <BackgroundAnimation />
      
      <Container maxWidth="lg" sx={{ p: 0, position: 'relative', zIndex: 1 }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: 'center',
            justifyContent: 'space-between',
            minHeight: '100vh',
            py: { xs: 4, md: 0 },
          }}
        >
          {/* Text Content */}
          <Box
            sx={{
              width: { xs: '100%', md: '50%' },
              p: { xs: 3, md: 5 },
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              zIndex: 2,
            }}
          >
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <Typography
                variant="h1"
                fontWeight="bold"
                sx={{
                  fontSize: { xs: '4rem', md: '6rem' },
                  letterSpacing: '-0.05em',
                  mb: 2,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.error.main})`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                404
              </Typography>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              <TypewriterText text="Error: This page could not be found. It either doesn't exist or was deleted. Or perhaps you don't exist and this webpage couldn't find you." />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.5 }}
              style={{ marginTop: '7rem' }}
            >
              <Button
                variant="contained"
                color="primary"
                size="large"
                component={Link}
                href="/"
                sx={{
                  px: 4,
                  py: 1.5,
                  fontSize: '16px',
                  fontWeight: 600,
                  borderRadius: 2,
                  boxShadow: 3,
                  position: 'relative',
                  overflow: 'hidden',
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: '-100%',
                    width: '100%',
                    height: '100%',
                    background: `linear-gradient(to right, transparent, ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.4)'}, transparent)`,
                    animation: 'shimmer 2s infinite',
                  },
                  '@keyframes shimmer': {
                    '0%': {
                      left: '-100%',
                    },
                    '100%': {
                      left: '100%',
                    },
                  },
                }}
              >
                Return to Dashboard
              </Button>
            </motion.div>
          </Box>

          {/* Main 3D Animation */}
          <Box
            sx={{
              width: { xs: '100%', md: '50%' },
              height: { xs: '50vh', md: '70vh' },
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              position: 'relative',
              zIndex: 2,
            }}
          >
            <MainFeature3D />
          </Box>
        </Box>
      </Container>
    </Box>
  );
}