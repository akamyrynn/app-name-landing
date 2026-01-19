"use client";

import { useRef, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { useGLTF, Float, OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { TableMaterial, TableSize } from "../../utils/pageData";

interface ModelProps {
  url: string;
  material: TableMaterial;
  size: TableSize;
}

function TableModel({ url, material, size }: ModelProps) {
  const { scene } = useGLTF(url);
  const modelRef = useRef<THREE.Group>(null);

  // Apply material to table
  useEffect(() => {
    if (scene) {
      scene.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.material = new THREE.MeshStandardMaterial({
            color: material.color,
            roughness: material.roughness,
            metalness: material.metalness,
          });
        }
      });
    }
  }, [scene, material]);

  // Apply size
  useEffect(() => {
    if (modelRef.current) {
      modelRef.current.scale.set(size.width, size.height, size.length);
    }
  }, [size]);

  return (
    <Float speed={1.5} rotationIntensity={0.1} floatIntensity={0.2}>
      <group ref={modelRef}>
        <primitive object={scene} />
      </group>
    </Float>
  );
}

interface TableConfiguratorProps {
  className?: string;
  material: TableMaterial;
  size: TableSize;
}

export default function TableConfigurator({ className, material, size }: TableConfiguratorProps) {
  return (
    <div className={className} style={{ width: "100%", height: "100%" }}>
      <Canvas
        camera={{ position: [3, 2, 3], fov: 50 }}
        gl={{ 
          antialias: true, 
          alpha: true,
          powerPreference: "high-performance",
          precision: "highp",
        }}
        dpr={[1, 2]}
        style={{ background: "transparent" }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <directionalLight position={[-10, -10, -5]} intensity={0.4} />
        <spotLight position={[0, 10, 0]} intensity={0.5} angle={0.3} />
        
        <TableModel 
          url="/weather_timber_table_top_2_scaniverse.glb" 
          material={material}
          size={size}
        />
        
        <OrbitControls 
          enablePan={false}
          minDistance={2}
          maxDistance={8}
          maxPolarAngle={Math.PI / 2}
        />
      </Canvas>
    </div>
  );
}

useGLTF.preload("/weather_timber_table_top_2_scaniverse.glb");
