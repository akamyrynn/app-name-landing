import gsap from "gsap";
import { lenis } from "./lenis-scroll.js";

const GRID_BLOCK_SIZE = 60;
let preloaderBlocks = [];

document.addEventListener("DOMContentLoaded", () => {
  initPreloader();
});

// preloader - main initialization function
function initPreloader() {
  const hasSeenPreloader = sessionStorage.getItem("preloaderSeen") === "true";
  const lenisInstance = lenis || window.lenis;
  const preloaderOverlay = document.querySelector(".preloader-overlay");

  if (hasSeenPreloader) {
    if (preloaderOverlay) {
      preloaderOverlay.style.display = "none";
    }
    if (lenisInstance) {
      lenisInstance.start();
    }
    return;
  }

  if (lenisInstance) {
    lenisInstance.stop();
  }

  if (!preloaderOverlay) return;

  requestAnimationFrame(() => {
    createPreloaderGrid();
    createPreloaderAnimation();
    startPreloaderSequence();
  });
}

// preloader - creates grid of blocks (similar to interactive-grid)
function createPreloaderGrid() {
  const preloaderGrid = document.querySelector(".preloader-grid");
  if (!preloaderGrid) return;

  preloaderGrid.innerHTML = "";
  preloaderBlocks = [];

  const gridWidth = preloaderGrid.offsetWidth || window.innerWidth;
  const gridHeight = preloaderGrid.offsetHeight || window.innerHeight;
  const gridColumnCount = Math.ceil(gridWidth / GRID_BLOCK_SIZE);
  const gridRowCount = Math.ceil(gridHeight / GRID_BLOCK_SIZE) + 1;
  const gridOffsetX = (gridWidth - gridColumnCount * GRID_BLOCK_SIZE) / 2;
  const gridOffsetY = (gridHeight - gridRowCount * GRID_BLOCK_SIZE) / 2;

  for (let rowIndex = 0; rowIndex < gridRowCount; rowIndex++) {
    for (let colIndex = 0; colIndex < gridColumnCount; colIndex++) {
      const blockPosX = colIndex * GRID_BLOCK_SIZE + gridOffsetX;
      const blockPosY = rowIndex * GRID_BLOCK_SIZE + gridOffsetY;
      createPreloaderBlock(preloaderGrid, blockPosX, blockPosY);
    }
  }
}

// preloader - creates individual grid block
function createPreloaderBlock(container, posX, posY) {
  const block = document.createElement("div");
  block.classList.add("preloader-block");
  block.style.width = `${GRID_BLOCK_SIZE}px`;
  block.style.height = `${GRID_BLOCK_SIZE}px`;
  block.style.left = `${posX}px`;
  block.style.top = `${posY}px`;
  container.appendChild(block);
  preloaderBlocks.push({ element: block });
}

// preloader - creates the loading animation (rings and discs)
function createPreloaderAnimation() {
  const ringFrame = document.querySelector(".preloader-ring-frame");
  const discFrame = document.querySelector(".preloader-disc-frame");

  if (!ringFrame || !discFrame) return;

  let i = 1;
  let num = 200;
  let lim = 4;

  for (i; i < lim; i++) {
    let span = document.createElement("span");
    let disk = document.createElement("span");
    span.setAttribute("class", "preloader-ring");
    disk.setAttribute("class", "preloader-disc");
    span.style.height = `${i * 10 + num}px`;
    span.style.width = `${i * 10 + num}px`;
    disk.style.animationDelay = `${i - 0.8}s`;
    ringFrame.appendChild(span);
    discFrame.appendChild(disk);
  }
}

// preloader - starts the preloader sequence (4 seconds then flicker out)
function startPreloaderSequence() {
  const blocks = preloaderBlocks.map((b) => b.element);
  const preloaderOverlay = document.querySelector(".preloader-overlay");
  const preloaderAnimationWrapper = document.querySelector(
    ".preloader-animation-wrapper"
  );

  if (!blocks.length || !preloaderOverlay) {
    cleanupPreloader();
    return;
  }

  const timeline = gsap.timeline({
    delay: 1.75,
    onComplete: () => {
      sessionStorage.setItem("preloaderSeen", "true");
      cleanupPreloader();
    },
  });

  timeline.to(preloaderAnimationWrapper, {
    opacity: 0,
    duration: 0.3,
  });

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
}

// preloader - cleanup and re-enable scrolling
function cleanupPreloader() {
  const preloaderOverlay = document.querySelector(".preloader-overlay");
  if (preloaderOverlay) {
    preloaderOverlay.remove();
  }

  const blocks = preloaderBlocks.map((b) => b.element);
  if (blocks.length) {
    gsap.killTweensOf(blocks);
  }

  const lenisInstance = lenis || window.lenis;
  if (lenisInstance) {
    lenisInstance.start();
  }
}
