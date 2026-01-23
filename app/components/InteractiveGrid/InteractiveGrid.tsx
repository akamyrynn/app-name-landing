"use client";

import { useRef } from "react";
import { useInteractiveGrid } from "../../hooks/useInteractiveGrid";
import "./InteractiveGrid.css";

interface InteractiveGridProps {
  blockSize?: number;
  highlightDuration?: number;
}

export default function InteractiveGrid({
  blockSize,
  highlightDuration,
}: InteractiveGridProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useInteractiveGrid(containerRef, { blockSize, highlightDuration });

  return <div className="interactive-grid" ref={containerRef}></div>;
}
