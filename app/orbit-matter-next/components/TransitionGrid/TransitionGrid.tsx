"use client";

import { useEffect, useRef, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { GRID_BLOCK_SIZE } from "../../utils/constants";
import "./TransitionGrid.css";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface TransitionBlock {
  element: HTMLDivElement;
}

// Pure function for testing - determines if link should trigger transition
export function shouldTriggerTransition(href: string | null, currentPath: string): boolean {
  if (!href) return false;
  
  // External links
  if (href.startsWith("http") || href.startsWith("mailto:") || href.startsWith("tel:")) {
    return false;
  }
  
  // Hash links
  if (href.startsWith("#")) {
    return false;
  }
  
  // Normalize paths for comparison
  let normalizedCurrent = currentPath.replace(/\.html$/, "").replace(/\/$/, "") || "/";
  if (normalizedCurrent === "/index") normalizedCurrent = "/";
  
  let normalizedTarget = href.trim();
  if (normalizedTarget === "/" || normalizedTarget === "/index" || normalizedTarget === "/index.html" || normalizedTarget === "index.html" || !normalizedTarget) {
    normalizedTarget = "/";
  } else {
    if (!normalizedTarget.startsWith("/")) {
      normalizedTarget = "/" + normalizedTarget;
    }
    normalizedTarget = normalizedTarget.replace(/\.html$/, "").replace(/\/$/, "");
  }
  
  // Same page
  if (normalizedCurrent === normalizedTarget) {
    return false;
  }
  
  return true;
}

export default function TransitionGrid() {
  const gridRef = useRef<HTMLDivElement>(null);
  const blocksRef = useRef<TransitionBlock[]>([]);
  const isTransitioningRef = useRef(false);
  const router = useRouter();
  const pathname = usePathname();


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
        block.classList.add("transition-block");
        block.style.width = `${GRID_BLOCK_SIZE}px`;
        block.style.height = `${GRID_BLOCK_SIZE}px`;
        block.style.left = `${blockPosX}px`;
        block.style.top = `${blockPosY}px`;
        grid.appendChild(block);
        blocksRef.current.push({ element: block });
      }
    }
  }, []);

  const animateTransition = useCallback((): Promise<void> => {
    return new Promise((resolve) => {
      const blocks = blocksRef.current.map((b) => b.element);
      const grid = gridRef.current;

      if (!blocks.length || !grid) {
        setTimeout(() => resolve(), 100);
        return;
      }

      grid.style.pointerEvents = "auto";
      grid.style.zIndex = "1000";

      gsap.set(blocks, { opacity: 0 });

      gsap.to(blocks, {
        opacity: 1,
        duration: 0.05,
        ease: "power2.inOut",
        stagger: {
          amount: 0.5,
          each: 0.01,
          from: "random",
        },
        onComplete: () => {
          setTimeout(() => resolve(), 300);
        },
      });
    });
  }, []);

  const revealTransition = useCallback(() => {
    const blocks = blocksRef.current.map((b) => b.element);
    const grid = gridRef.current;

    if (!blocks.length) return;

    gsap.to(blocks, {
      opacity: 0,
      duration: 0.05,
      ease: "power2.inOut",
      stagger: {
        amount: 0.5,
        each: 0.01,
        from: "random",
      },
      onComplete: () => {
        if (grid) {
          grid.style.pointerEvents = "none";
        }
        ScrollTrigger.refresh();
      },
    });
  }, []);


  useEffect(() => {
    createGrid();

    // Check if we're coming from a page transition
    const isPageNavigation = sessionStorage.getItem("pageTransition") === "true";
    const blocks = blocksRef.current.map((b) => b.element);

    if (isPageNavigation) {
      sessionStorage.removeItem("pageTransition");
      gsap.set(blocks, { opacity: 1 });
      setTimeout(() => {
        revealTransition();
      }, 300);
    } else {
      gsap.set(blocks, { opacity: 0 });
    }
  }, [createGrid, revealTransition]);

  useEffect(() => {
    const handleLinkClick = (event: MouseEvent) => {
      if (isTransitioningRef.current) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }

      const link = (event.target as HTMLElement).closest("a");
      if (!link) return;

      const href = link.getAttribute("href");
      
      if (!shouldTriggerTransition(href, pathname)) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      isTransitioningRef.current = true;

      const grid = gridRef.current;
      if (grid) {
        grid.style.pointerEvents = "auto";
      }

      sessionStorage.setItem("pageTransition", "true");

      animateTransition().then(() => {
        router.push(href!);
      });
    };

    document.addEventListener("click", handleLinkClick, { capture: true });

    return () => {
      document.removeEventListener("click", handleLinkClick, { capture: true });
    };
  }, [pathname, router, animateTransition]);

  return <div className="transition-grid" ref={gridRef}></div>;
}
