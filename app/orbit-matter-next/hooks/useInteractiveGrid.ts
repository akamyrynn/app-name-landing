"use client";

import { useEffect, useRef, useCallback, RefObject } from "react";
import { GRID_BLOCK_SIZE, GRID_HIGHLIGHT_DURATION, GRID_HIGHLIGHT_RADIUS } from "../utils/constants";

export interface GridBlock {
  element: HTMLDivElement;
  x: number;
  y: number;
  gridX: number;
  gridY: number;
  highlightEndTime: number;
}

export interface UseInteractiveGridOptions {
  blockSize?: number;
  highlightDuration?: number;
  highlightRadius?: number;
}

// Pure function for testing - calculates grid dimensions
export function calculateGridDimensions(
  viewportWidth: number,
  viewportHeight: number,
  blockSize: number
): { columns: number; rows: number; totalBlocks: number } {
  const columns = Math.ceil(viewportWidth / blockSize);
  const rows = Math.ceil(viewportHeight / blockSize);
  return {
    columns,
    rows,
    totalBlocks: columns * rows,
  };
}

// Pure function for testing - determines if highlight should be removed
export function shouldRemoveHighlight(
  highlightEndTime: number,
  currentTime: number
): boolean {
  return highlightEndTime > 0 && currentTime > highlightEndTime;
}

export function useInteractiveGrid(
  containerRef: RefObject<HTMLDivElement | null>,
  options: UseInteractiveGridOptions = {}
): void {
  const {
    blockSize = GRID_BLOCK_SIZE,
    highlightDuration = GRID_HIGHLIGHT_DURATION,
    highlightRadius = GRID_HIGHLIGHT_RADIUS,
  } = options;

  const blocksRef = useRef<GridBlock[]>([]);
  const mouseRef = useRef({ x: 0, y: 0 });
  const animationFrameRef = useRef<number>();


  const createGrid = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    container.innerHTML = "";
    blocksRef.current = [];

    const gridWidth = window.innerWidth;
    const gridHeight = window.innerHeight;
    const { columns, rows } = calculateGridDimensions(gridWidth, gridHeight, blockSize);
    const gridOffsetX = (gridWidth - columns * blockSize) / 2;
    const gridOffsetY = (gridHeight - rows * blockSize) / 2;

    for (let rowIndex = 0; rowIndex < rows; rowIndex++) {
      for (let colIndex = 0; colIndex < columns; colIndex++) {
        const posX = colIndex * blockSize + gridOffsetX;
        const posY = rowIndex * blockSize + gridOffsetY;

        const block = document.createElement("div");
        block.classList.add("block");
        block.style.width = `${blockSize}px`;
        block.style.height = `${blockSize}px`;
        block.style.left = `${posX}px`;
        block.style.top = `${posY}px`;

        container.appendChild(block);

        blocksRef.current.push({
          element: block,
          x: posX + blockSize / 2,
          y: posY + blockSize / 2,
          gridX: colIndex,
          gridY: rowIndex,
          highlightEndTime: 0,
        });
      }
    }
  }, [containerRef, blockSize]);

  const addHighlights = useCallback(() => {
    const { x, y } = mouseRef.current;
    if (!x || !y) return;

    let closestBlock: GridBlock | null = null;
    let closestDistance = Infinity;

    for (const block of blocksRef.current) {
      const distanceX = x - block.x;
      const distanceY = y - block.y;
      const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);

      if (distance < closestDistance) {
        closestDistance = distance;
        closestBlock = block;
      }
    }

    if (!closestBlock || closestDistance > highlightRadius) return;

    const currentTime = Date.now();
    closestBlock.element.classList.add("highlight");
    closestBlock.highlightEndTime = currentTime + highlightDuration;

    // Highlight cluster of adjacent blocks
    const clusterSize = Math.floor(Math.random() * 1) + 1;
    let currentBlock = closestBlock;
    const highlightedBlocks = [closestBlock];

    for (let i = 0; i < clusterSize; i++) {
      const neighbors = blocksRef.current.filter((neighbor) => {
        if (highlightedBlocks.includes(neighbor)) return false;
        const distX = Math.abs(neighbor.gridX - currentBlock.gridX);
        const distY = Math.abs(neighbor.gridY - currentBlock.gridY);
        return distX <= 1 && distY <= 1;
      });

      if (neighbors.length === 0) break;

      const randomNeighbor = neighbors[Math.floor(Math.random() * neighbors.length)];
      randomNeighbor.element.classList.add("highlight");
      randomNeighbor.highlightEndTime = currentTime + highlightDuration + i * 10;
      highlightedBlocks.push(randomNeighbor);
      currentBlock = randomNeighbor;
    }
  }, [highlightDuration, highlightRadius]);


  const updateHighlights = useCallback(() => {
    const currentTime = Date.now();

    blocksRef.current.forEach((block) => {
      if (shouldRemoveHighlight(block.highlightEndTime, currentTime)) {
        block.element.classList.remove("highlight");
        block.highlightEndTime = 0;
      }
    });

    animationFrameRef.current = requestAnimationFrame(updateHighlights);
  }, []);

  useEffect(() => {
    createGrid();

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
      addHighlights();
    };

    const handleMouseOut = () => {
      mouseRef.current = { x: 0, y: 0 };
    };

    const handleResize = () => {
      createGrid();
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseout", handleMouseOut);
    window.addEventListener("resize", handleResize);

    animationFrameRef.current = requestAnimationFrame(updateHighlights);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseout", handleMouseOut);
      window.removeEventListener("resize", handleResize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [createGrid, addHighlights, updateHighlights]);
}
