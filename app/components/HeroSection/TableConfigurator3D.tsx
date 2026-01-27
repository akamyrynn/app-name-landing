"use client";

import { useRef, useMemo } from "react";
import { Canvas, useLoader } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import { Geometry, Base, Subtraction } from "@react-three/csg";
import * as THREE from "three";
import { TableMaterial, TableCutout, TableCoating } from "../../utils/pageData";

interface TableModel3DProps {
  material: TableMaterial;
  coating: TableCoating;
  width: number;
  length: number;
  thickness: number;
  shape: string;
  cutouts: TableCutout[];
}

function TableModel3D({ material, coating, width, length, thickness, shape, cutouts }: TableModel3DProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  // Load PBR textures if available
  const textures = useMemo(() => {
    if (!material.textures) return null;

    const loader = new THREE.TextureLoader();

    const colorMap = loader.load(material.textures.color);
    const normalMap = loader.load(material.textures.normal);
    const roughnessMap = loader.load(material.textures.roughness);

    // Configure texture wrapping and repeat for proper scaling
    [colorMap, normalMap, roughnessMap].forEach((tex) => {
      tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(width, length); // Scale based on table size
    });

    return { colorMap, normalMap, roughnessMap };
  }, [material.textures, width, length]);

  // Trapezoid shape logic
  const trapezoidShape = useMemo(() => {
    if (shape !== "trapezoid") return null;
    const s = new THREE.Shape();
    s.moveTo(-width / 2, -length / 2);
    s.lineTo(width / 2, -length / 2);
    s.lineTo(width / 3, length / 2);
    s.lineTo(-width / 3, length / 2);
    s.closePath();
    return s;
  }, [width, length, shape]);

  const extrudeSettings = useMemo(() => ({
    depth: thickness,
    bevelEnabled: true,
    bevelThickness: 0.01,
    bevelSize: 0.01,
    bevelSegments: 3,
  }), [thickness]);

  // Create MeshPhysicalMaterial with textures and coating
  const tableMaterial = useMemo(() => {
    // Calculate coating tint blend
    const baseColor = new THREE.Color(material.color);
    const coatingColor = new THREE.Color(coating.color);

    // If coating has tint (not white/clear), blend it with base
    const hasTint = coating.id !== "none" && coating.id !== "osmo-clear";
    if (hasTint && coating.clearcoat > 0) {
      baseColor.lerp(coatingColor, 0.15); // Subtle 15% tint from oil
    }

    if (textures) {
      return new THREE.MeshPhysicalMaterial({
        map: textures.colorMap,
        normalMap: textures.normalMap,
        roughnessMap: textures.roughnessMap,
        roughness: material.roughness,
        metalness: material.metalness,
        // Coating properties
        clearcoat: coating.clearcoat,
        clearcoatRoughness: coating.clearcoatRoughness,
        // Oil tint effect
        ...(hasTint && { color: baseColor }),
      });
    }

    // Fallback to simple color if no textures
    return new THREE.MeshPhysicalMaterial({
      color: baseColor,
      roughness: material.roughness,
      metalness: material.metalness,
      clearcoat: coating.clearcoat,
      clearcoatRoughness: coating.clearcoatRoughness,
    });
  }, [material, coating, textures]);

  // Load Sink Model
  const { scene: sinkScene } = useGLTF("/kitchen_sink.glb");

  // Calculate sink model bounding box once
  const sinkInfo = useMemo(() => {
    const cloned = sinkScene.clone();
    const box = new THREE.Box3().setFromObject(cloned);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    return {
      scene: cloned,
      size,
      center,
      // Original dimensions of the model
      width: size.x,
      height: size.y,
      depth: size.z
    };
  }, [sinkScene]);

  return (
    <group>
      {/* Table Top with Holes */}
      <mesh ref={meshRef} material={tableMaterial} castShadow receiveShadow>
        <Geometry>
          <Base>
            {shape === "round" ? (
              <cylinderGeometry args={[width / 2, width / 2, thickness, 64]} />
            ) : shape === "trapezoid" && trapezoidShape ? (
              <group rotation={[Math.PI / 2, 0, 0]}>
                <extrudeGeometry args={[trapezoidShape, extrudeSettings]} />
              </group>
            ) : (
              <boxGeometry args={[width, thickness, length]} />
            )}
          </Base>

          {cutouts.map((cutout) => {
            // Make cutout slightly smaller than sink rim so the rim overlaps the table edge
            // This hides any gaps at the rounded corners
            const cutoutPadding = 0.92; // Cutout is 92% of sink size (rim overhangs 8%)
            return (
              <Subtraction
                key={cutout.id}
                position={[cutout.x, 0, cutout.y]}
                rotation={[0, (cutout.rotation || 0) * (Math.PI / 180), 0]}
              >
                <boxGeometry args={[cutout.width * cutoutPadding, thickness * 2, cutout.height * cutoutPadding]} />
              </Subtraction>
            );
          })}
        </Geometry>
      </mesh >

      {/* Accessories (Sinks) */}
      {cutouts.map((cutout) => {
        if (cutout.type === "sink") {
          // Scale sink to match cutout size
          const scaleX = cutout.width / sinkInfo.width;
          const scaleZ = cutout.height / sinkInfo.depth;
          const scaleY = Math.min(scaleX, scaleZ);

          // Position sink so rim sits ON the table surface
          // Table top is at Y = thickness/2
          // Simple approach: position sink center at table top level
          // Subtract small offset to sit slightly lower for perfect visual fit
          const sinkY = thickness / 2 + sinkInfo.center.y * scaleY - 0.015;

          return (
            <primitive
              key={`sink-${cutout.id}`}
              object={sinkInfo.scene.clone()}
              position={[cutout.x, sinkY, cutout.y]}
              rotation={[0, (cutout.rotation || 0) * (Math.PI / 180), 0]}
              scale={[scaleX, scaleY, scaleZ]}
            />
          );
        }
        return null;
      })}
    </group >
  );
}

useGLTF.preload("/kitchen_sink.glb");

interface TableConfigurator3DProps {
  material: TableMaterial;
  coating: TableCoating;
  width: number;
  length: number;
  thickness: number;
  shape: string;
  cutouts: TableCutout[];
}

export default function TableConfigurator3D({
  material,
  coating,
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
        coating={coating}
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
    </Canvas>
  );
}
