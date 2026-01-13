"use client";

import { useRef, useEffect, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, Float } from "@react-three/drei";
import * as THREE from "three";

interface ModelProps {
  url: string;
  mousePosition: { x: number; y: number };
}

function Model({ url, mousePosition }: ModelProps) {
  const { scene } = useGLTF(url);
  const modelRef = useRef<THREE.Group>(null);
  const targetRotation = useRef({ x: 0, y: 0 });
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [videoTexture, setVideoTexture] = useState<THREE.VideoTexture | null>(null);

  // Create video texture
  useEffect(() => {
    const video = document.createElement("video");
    video.src = "/Video_walk_trough_202601130122_b40nh.mp4";
    video.crossOrigin = "anonymous";
    video.loop = true;
    video.muted = true;
    video.playsInline = true;
    video.autoplay = true;
    
    video.play().catch(console.error);
    
    const texture = new THREE.VideoTexture(video);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.generateMipmaps = true;
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.flipY = false;
    
    videoRef.current = video;
    setVideoTexture(texture);

    return () => {
      video.pause();
      video.src = "";
      texture.dispose();
    };
  }, []);

  // Apply video texture to screen
  useEffect(() => {
    if (scene && videoTexture) {
      scene.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          if (child.name === "Object_7") {
            child.material = new THREE.MeshBasicMaterial({
              map: videoTexture,
              toneMapped: false,
            });
          }
        }
      });
    }
  }, [scene, videoTexture]);

  useFrame((state) => {
    if (modelRef.current) {
      targetRotation.current.y = mousePosition.x * 0.3;
      targetRotation.current.x = mousePosition.y * 0.15;

      modelRef.current.rotation.y = THREE.MathUtils.lerp(
        modelRef.current.rotation.y,
        targetRotation.current.y + Math.sin(state.clock.elapsedTime * 0.3) * 0.05,
        0.05
      );
      modelRef.current.rotation.x = THREE.MathUtils.lerp(
        modelRef.current.rotation.x,
        targetRotation.current.x + 0.15,
        0.05
      );
    }
    
    // Update video texture
    if (videoTexture) {
      videoTexture.needsUpdate = true;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.2} floatIntensity={0.3}>
      <group ref={modelRef} scale={21} position={[0, -2, 0]}>
        <primitive object={scene} rotation={[0, Math.PI, 0]} />
      </group>
    </Float>
  );
}

interface IPhoneModelProps {
  className?: string;
}

export default function IPhoneModel({ className }: IPhoneModelProps) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = -(e.clientY / window.innerHeight) * 2 + 1;
      setMousePosition({ x, y });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className={className} style={{ width: "100%", height: "100%" }}>
      <Canvas
        camera={{ position: [0, 0, 4], fov: 50 }}
        gl={{ 
          antialias: true, 
          alpha: true,
          powerPreference: "high-performance",
          precision: "highp",
        }}
        dpr={[1, 3]}
        style={{ background: "transparent" }}
      >
        <ambientLight intensity={1} />
        <directionalLight position={[10, 10, 5]} intensity={1.5} />
        <directionalLight position={[-10, -10, -5]} intensity={0.5} color="#ee6436" />
        <Model url="/iphone_17_air.glb" mousePosition={mousePosition} />
      </Canvas>
    </div>
  );
}

useGLTF.preload("/iphone_17_air.glb");
