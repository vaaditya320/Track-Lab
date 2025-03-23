"use client";

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { useTheme } from '@mui/material';

export default function ParticleBackground() {
  const ref = useRef();
  const theme = useTheme();
  const count = 8000;
  const isDarkMode = theme.palette.mode === 'dark';
  
  // Use the secondary color from your theme
  const particleColor = theme.palette.secondary.main || '#f72585';

  const positions = useMemo(() => {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 20;
    }
    return positions;
  }, [count]);

  // Create color array based on theme
  const colors = useMemo(() => {
    const colors = new Float32Array(count * 3);
    const color = new THREE.Color(particleColor);
    
    for (let i = 0; i < count; i++) {
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }
    return colors;
  }, [count, particleColor]);

  useFrame((state, delta) => {
    ref.current.rotation.x -= delta / 15;
    ref.current.rotation.y -= delta / 20;
  });

  return (
    <group rotation={[0, 0, Math.PI / 4]}>
      <Points
        ref={ref}
        positions={positions}
        colors={colors}
        stride={3}
        frustumCulled={false}
      >
        <PointMaterial
          transparent
          vertexColors
          size={isDarkMode ? 0.05 : 0.035}
          sizeAttenuation={true}
          depthWrite={false}
          opacity={isDarkMode ? 0.9 : 0.7}
        />
      </Points>
    </group>
  );
}