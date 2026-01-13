"use client";

import { useEffect, useRef, useCallback } from "react";
import gsap from "gsap";
import { GRID_BLOCK_SIZE, PRELOADER_DELAY } from "../../utils/constants";
import "./Preloader.css";

interface PreloaderProps {
  onComplete: () => void;
  isVisible: boolean;
}

interface PreloaderBlock {
  element: HTMLDivElement;
}

export default function Preloader({ onComplete, isVisible }: PreloaderProps) {
  const gridRef = useRef<HTMLDivElement>(null);
  const ringFrameRef = useRef<HTMLDivElement>(null);
  const discFrameRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const blocksRef = useRef<PreloaderBlock[]>([]);

  const createGrid = useCallback(() => {
    const grid = gridRef.current;
    if (!grid) return;

    grid.innerHTML = "";
    blocksRef.current = [];

    const gridWidth = grid.offsetWidth || window.innerWidth;
    const gridHeight = grid.offsetHeight || window.innerHeight;
    const gridColumnCount = Math.ceil(gridWidth / GRID_BLOCK_SIZE);
    const gridRowCount = Math.ceil(gridHeight / GRID_BLOCK_SIZE) + 1;
    const gridOffsetX = (gridWidth - gridColumnCount * GRID_BLOCK_SIZE) / 2;
    const gridOffsetY = (gridHeight - gridRowCount * GRID_BLOCK_SIZE) / 2;

    for (let rowIndex = 0; rowIndex < gridRowCount; rowIndex++) {
      for (let colIndex = 0; colIndex < gridColumnCount; colIndex++) {
        const blockPosX = colIndex * GRID_BLOCK_SIZE + gridOffsetX;
        const blockPosY = rowIndex * GRID_BLOCK_SIZE + gridOffsetY;

        const block = document.createElement("div");
        block.classList.add("preloader-block");
        block.style.width = `${GRID_BLOCK_SIZE}px`;
        block.style.height = `${GRID_BLOCK_SIZE}px`;
        block.style.left = `${blockPosX}px`;
        block.style.top = `${blockPosY}px`;
        grid.appendChild(block);
        blocksRef.current.push({ element: block });
      }
    }
  }, []);

  const createAnimation = useCallback(() => {
    const ringFrame = ringFrameRef.current;
    const discFrame = discFrameRef.current;
    if (!ringFrame || !discFrame) return;

    for (let i = 1; i < 4; i++) {
      const span = document.createElement("span");
      const disk = document.createElement("span");
      span.className = "preloader-ring";
      disk.className = "preloader-disc";
      span.style.height = `${i * 10 + 200}px`;
      span.style.width = `${i * 10 + 200}px`;
      disk.style.animationDelay = `${i - 0.8}s`;
      ringFrame.appendChild(span);
      discFrame.appendChild(disk);
    }
  }, []);


  const startSequence = useCallback(() => {
    const blocks = blocksRef.current.map((b) => b.element);
    const wrapper = wrapperRef.current;

    if (!blocks.length) {
      onComplete();
      return;
    }

    const timeline = gsap.timeline({
      delay: PRELOADER_DELAY,
      onComplete: () => {
        onComplete();
      },
    });

    if (wrapper) {
      timeline.to(wrapper, {
        opacity: 0,
        duration: 0.3,
      });
    }

    timeline.to(blocks, {
      opacity: 0,
      duration: 0.05,
      ease: "power2.inOut",
      stagger: {
        amount: 0.5,
        each: 0.01,
        from: "random",
      },
    });
  }, [onComplete]);

  useEffect(() => {
    if (!isVisible) return;

    requestAnimationFrame(() => {
      createGrid();
      createAnimation();
      startSequence();
    });
  }, [isVisible, createGrid, createAnimation, startSequence]);

  if (!isVisible) return null;

  return (
    <div className="preloader-overlay">
      <div className="preloader-grid" ref={gridRef}></div>

      <div className="preloader-animation-wrapper" ref={wrapperRef}>
        <p className="preloader-text">Stabilizing Feed</p>
        <div className="preloader-ring-frame" ref={ringFrameRef}></div>
        <div className="preloader-disc-frame" ref={discFrameRef}></div>
      </div>
    </div>
  );
}
