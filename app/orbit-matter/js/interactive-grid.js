document.addEventListener("DOMContentLoaded", () => {
  initInteractiveGrid();
});

const GRID_BLOCK_SIZE = 60;
const GRID_HIGHLIGHT_DURATION = 300;

let gridBlocks = [];
let gridWidth, gridHeight;
let gridMouse = {
  x: undefined,
  y: undefined,
  radius: GRID_BLOCK_SIZE * 2,
};

// interactive grid - creates grid and sets up mouse interactions
function initInteractiveGrid() {
  const interactiveGridContainer = document.querySelector(".interactive-grid");
  if (!interactiveGridContainer) return;

  resetInteractiveGrid(interactiveGridContainer);
  setupInteractiveGridEvents(interactiveGridContainer);
  requestAnimationFrame(() => updateGridHighlights());
}

function resetInteractiveGrid(container) {
  container.innerHTML = "";
  gridBlocks = [];

  gridWidth = window.innerWidth;
  gridHeight = window.innerHeight;

  const gridColumnCount = Math.ceil(gridWidth / GRID_BLOCK_SIZE);
  const gridRowCount = Math.ceil(gridHeight / GRID_BLOCK_SIZE);

  const gridOffsetX = (gridWidth - gridColumnCount * GRID_BLOCK_SIZE) / 2;
  const gridOffsetY = (gridHeight - gridRowCount * GRID_BLOCK_SIZE) / 2;

  for (let rowIndex = 0; rowIndex < gridRowCount; rowIndex++) {
    for (let colIndex = 0; colIndex < gridColumnCount; colIndex++) {
      const blockPosX = colIndex * GRID_BLOCK_SIZE + gridOffsetX;
      const blockPosY = rowIndex * GRID_BLOCK_SIZE + gridOffsetY;
      createGridBlock(container, blockPosX, blockPosY, colIndex, rowIndex);
    }
  }
}

function createGridBlock(container, posX, posY, gridX, gridY) {
  const gridBlock = document.createElement("div");
  gridBlock.classList.add("block");

  gridBlock.style.width = `${GRID_BLOCK_SIZE}px`;
  gridBlock.style.height = `${GRID_BLOCK_SIZE}px`;
  gridBlock.style.left = `${posX}px`;
  gridBlock.style.top = `${posY}px`;

  container.appendChild(gridBlock);

  gridBlocks.push({
    element: gridBlock,
    x: posX + GRID_BLOCK_SIZE / 2,
    y: posY + GRID_BLOCK_SIZE / 2,
    gridX: gridX,
    gridY: gridY,
    highlightEndTime: 0,
  });
}

function setupInteractiveGridEvents(container) {
  window.addEventListener("resize", () => {
    resetInteractiveGrid(container);
  });
  window.addEventListener("mousemove", handleGridMouseMove);
  window.addEventListener("mouseout", handleGridMouseOut);
}

function handleGridMouseMove(e) {
  gridMouse.x = e.clientX;
  gridMouse.y = e.clientY;
  addGridHighlights();
}

function handleGridMouseOut() {
  gridMouse.x = undefined;
  gridMouse.y = undefined;
}

function addGridHighlights() {
  if (!gridMouse.x || !gridMouse.y) return;

  let closestGridBlock = null;
  let closestGridDistance = Infinity;

  for (const block of gridBlocks) {
    const distanceX = gridMouse.x - block.x;
    const distanceY = gridMouse.y - block.y;
    const blockDistance = Math.sqrt(
      distanceX * distanceX + distanceY * distanceY
    );

    if (blockDistance < closestGridDistance) {
      closestGridDistance = blockDistance;
      closestGridBlock = block;
    }
  }

  if (!closestGridBlock || closestGridDistance > gridMouse.radius) return;

  const currentGridTime = Date.now();

  closestGridBlock.element.classList.add("highlight");
  closestGridBlock.highlightEndTime = currentGridTime + GRID_HIGHLIGHT_DURATION;

  const gridClusterSize = Math.floor(Math.random() * 1) + 1;
  let currentGridBlock = closestGridBlock;
  let highlightedGridBlocks = [closestGridBlock];

  for (let i = 0; i < gridClusterSize; i++) {
    const gridNeighbors = gridBlocks.filter((neighborBlock) => {
      if (highlightedGridBlocks.includes(neighborBlock)) return false;

      const neighborDistanceX = Math.abs(
        neighborBlock.gridX - currentGridBlock.gridX
      );
      const neighborDistanceY = Math.abs(
        neighborBlock.gridY - currentGridBlock.gridY
      );

      return neighborDistanceX <= 1 && neighborDistanceY <= 1;
    });

    if (gridNeighbors.length === 0) break;

    const randomGridNeighbor =
      gridNeighbors[Math.floor(Math.random() * gridNeighbors.length)];

    randomGridNeighbor.element.classList.add("highlight");
    randomGridNeighbor.highlightEndTime =
      currentGridTime + GRID_HIGHLIGHT_DURATION + i * 10;

    highlightedGridBlocks.push(randomGridNeighbor);
    currentGridBlock = randomGridNeighbor;
  }
}

function updateGridHighlights() {
  const currentGridTime = Date.now();

  gridBlocks.forEach((gridBlock) => {
    if (
      gridBlock.highlightEndTime > 0 &&
      currentGridTime > gridBlock.highlightEndTime
    ) {
      gridBlock.element.classList.remove("highlight");
      gridBlock.highlightEndTime = 0;
    }
  });

  requestAnimationFrame(updateGridHighlights);
}
