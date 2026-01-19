"use client";

import { useRef, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment } from "@react-three/drei";
import * as THREE from "three";
import { TableMaterial, TableCutout } from "../../utils/pageData";

interface TableModel3DProps {
  material: TableMaterial;
  width: number;
  length: number;
  thickness: number;
  shape: string;
  cutouts: TableCutout[];
}

function TableModel3D({ material, width, length, thickness, shape, cutouts }: TableModel3DProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  // Create table geometry based on shape
  const createTableGeometry = () => {
    if (shape === "round") {
      return new THREE.CylinderGeometry(width / 2, width / 2, thickness, 32);
    } else if (shape === "trapezoid") {
      const shape = new THREE.Shape();
      shape.moveTo(-width / 2, -length / 2);
      shape.lineTo(width / 2, -length / 2);
      shape.lineTo(width / 3, length / 2);
      shape.lineTo(-width / 3, length / 2);
      shape.closePath();
      
      const extrudeSettings = {
        depth: thickness,
        bevelEnabled: true,
        bevelThickness: 0.01,
        bevelSize: 0.01,
        bevelSegments: 3,
      };
      
      return new THREE.ExtrudeGeometry(shape, extrudeSettings);
    } else {
      // Rectangle or custom
      return new THREE.BoxGeometry(width, thickness, length);
    }
  };

  // Apply cutouts (simplified - would need CSG for real implementation)
  useEffect(() => {
    if (meshRef.current) {
      meshRef.current.geometry = createTableGeometry();
    }
  }, [width, length, thickness, shape]);

  // Apply material
  const tableMaterial = new THREE.MeshStandardMaterial({
    color: material.color,
    roughness: material.roughness,
    metalness: material.metalness,
  });

  return (
    <mesh ref={meshRef} material={tableMaterial} castShadow receiveShadow>
      <boxGeometry args={[width, thickness, length]} />
    </mesh>
  );
}

interface TableConfigurator3DProps {
  material: TableMaterial;
  width: number;
  length: number;
  thickness: number;
  shape: string;
  cutouts: TableCutout[];
}

export default function TableConfigurator3D({
  material,
  width,
  length,
  thickness,
  shape,
  cutouts,
}: TableConfigurator3DProps) {
  return (
    <Canvas
      camera={{ position: [3, 2, 3], fov: 50 }}
      gl={{
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
        precision: "highp",
      }}
      dpr={[1, 2]}
      shadows
      style={{ background: "transparent" }}
    >
      <ambientLight intensity={0.4} />
      <directionalLight
        position={[10, 10, 5]}
        intensity={1}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <directionalLight position={[-10, -10, -5]} intensity={0.3} />
      <spotLight position={[0, 10, 0]} intensity={0.5} angle={0.3} castShadow />

      <TableModel3D
        material={material}
        width={width}
        length={length}
        thickness={thickness}
        shape={shape}
        cutouts={cutouts}
      />

      <OrbitControls
        enablePan={false}
        minDistance={2}
        maxDistance={8}
        maxPolarAngle={Math.PI / 2}
      />

      <Environment preset="studio" />
    </Canvas>
  );
}
