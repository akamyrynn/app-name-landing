import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import { calculateColoredChars } from "./IntroSection";

/**
 * Feature: orbit-matter-homepage-migration
 * Property 6: Intro Text Fill Progress
 * 
 * For any scroll position within the intro section, the number of colored characters 
 * should equal floor(scrollProgress * totalCharacters), ensuring smooth progressive fill.
 * 
 * Validates: Requirements 7.4
 */

describe("Intro Text Fill Progress Property", () => {
  it("should return floor(progress * totalChars) for any valid inputs", () => {
    fc.assert(
      fc.property(
        fc.float({ min: 0, max: 1, noNaN: true }), // progress 0-1
        fc.integer({ min: 1, max: 1000 }), // total chars
        (progress, totalChars) => {
          const result = calculateColoredChars(progress, totalChars);
          const expected = Math.floor(progress * totalChars);
          expect(result).toBe(expected);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("should return 0 when progress is 0", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 1000 }), // total chars
        (totalChars) => {
          const result = calculateColoredChars(0, totalChars);
          expect(result).toBe(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("should return totalChars when progress is 1", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 1000 }), // total chars
        (totalChars) => {
          const result = calculateColoredChars(1, totalChars);
          expect(result).toBe(totalChars);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("should always return value between 0 and totalChars inclusive", () => {
    fc.assert(
      fc.property(
        fc.float({ min: 0, max: 1, noNaN: true }), // progress 0-1
        fc.integer({ min: 1, max: 1000 }), // total chars
        (progress, totalChars) => {
          const result = calculateColoredChars(progress, totalChars);
          expect(result).toBeGreaterThanOrEqual(0);
          expect(result).toBeLessThanOrEqual(totalChars);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("should be monotonically increasing with progress", () => {
    fc.assert(
      fc.property(
        fc.float({ min: 0, max: 0.5, noNaN: true }), // progress1
        fc.float({ min: 0, max: 0.5, noNaN: true }), // delta (progress2 = progress1 + delta)
        fc.integer({ min: 1, max: 1000 }), // total chars
        (progress1, delta, totalChars) => {
          const progress2 = Math.min(progress1 + delta, 1);
          const result1 = calculateColoredChars(progress1, totalChars);
          const result2 = calculateColoredChars(progress2, totalChars);
          // result2 should be >= result1 (monotonically increasing)
          expect(result2).toBeGreaterThanOrEqual(result1);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("should handle edge case of single character", () => {
    expect(calculateColoredChars(0, 1)).toBe(0);
    expect(calculateColoredChars(0.5, 1)).toBe(0);
    expect(calculateColoredChars(1, 1)).toBe(1);
  });
});
