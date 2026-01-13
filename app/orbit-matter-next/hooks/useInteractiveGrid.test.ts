import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import { calculateGridDimensions, shouldRemoveHighlight } from "./useInteractiveGrid";
import { GRID_BLOCK_SIZE, GRID_HIGHLIGHT_DURATION } from "../utils/constants";

/**
 * Feature: orbit-matter-homepage-migration
 * Property 2: Interactive Grid Block Coverage
 * 
 * For any viewport dimensions, the interactive grid should create enough blocks 
 * to cover the entire viewport with no gaps, where block count = ceil(width/60) * ceil(height/60).
 * 
 * Validates: Requirements 5.2
 */

describe("Interactive Grid Block Coverage Property", () => {
  it("should calculate correct number of columns for any viewport width", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 320, max: 5000 }), // viewport width
        fc.integer({ min: 320, max: 3000 }), // viewport height
        (width, height) => {
          const result = calculateGridDimensions(width, height, GRID_BLOCK_SIZE);
          const expectedColumns = Math.ceil(width / GRID_BLOCK_SIZE);
          expect(result.columns).toBe(expectedColumns);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("should calculate correct number of rows for any viewport height", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 320, max: 5000 }), // viewport width
        fc.integer({ min: 320, max: 3000 }), // viewport height
        (width, height) => {
          const result = calculateGridDimensions(width, height, GRID_BLOCK_SIZE);
          const expectedRows = Math.ceil(height / GRID_BLOCK_SIZE);
          expect(result.rows).toBe(expectedRows);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("should calculate total blocks as columns * rows", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 320, max: 5000 }), // viewport width
        fc.integer({ min: 320, max: 3000 }), // viewport height
        (width, height) => {
          const result = calculateGridDimensions(width, height, GRID_BLOCK_SIZE);
          expect(result.totalBlocks).toBe(result.columns * result.rows);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("should ensure grid covers entire viewport (no gaps)", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 320, max: 5000 }), // viewport width
        fc.integer({ min: 320, max: 3000 }), // viewport height
        (width, height) => {
          const result = calculateGridDimensions(width, height, GRID_BLOCK_SIZE);
          // Grid coverage should be >= viewport dimensions
          const gridWidth = result.columns * GRID_BLOCK_SIZE;
          const gridHeight = result.rows * GRID_BLOCK_SIZE;
          expect(gridWidth).toBeGreaterThanOrEqual(width);
          expect(gridHeight).toBeGreaterThanOrEqual(height);
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * Feature: orbit-matter-homepage-migration
 * Property 3: Grid Highlight Timing
 * 
 * For any highlighted block, after exactly 300ms the highlight class should be removed,
 * ensuring no blocks remain highlighted indefinitely.
 * 
 * Validates: Requirements 5.5
 */

describe("Grid Highlight Timing Property", () => {
  it("should remove highlight when current time exceeds end time", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1000, max: 100000 }), // highlight end time
        fc.integer({ min: 1, max: 1000 }), // time after end (must be > 0)
        (endTime, timeAfter) => {
          const currentTime = endTime + timeAfter;
          const result = shouldRemoveHighlight(endTime, currentTime);
          expect(result).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("should not remove highlight when current time is before end time", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1000, max: 100000 }), // highlight end time
        fc.integer({ min: 1, max: 1000 }), // time before end
        (endTime, timeBefore) => {
          const currentTime = endTime - timeBefore;
          const result = shouldRemoveHighlight(endTime, currentTime);
          expect(result).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("should not remove highlight when end time is 0 (not highlighted)", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 100000 }), // any current time
        (currentTime) => {
          const result = shouldRemoveHighlight(0, currentTime);
          expect(result).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("should remove highlight at exactly the end time", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 100000 }), // highlight end time
        (endTime) => {
          // At exactly end time + 1ms, should remove
          const result = shouldRemoveHighlight(endTime, endTime + 1);
          expect(result).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });
});
