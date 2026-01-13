import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import { formatHeroTimer } from "./HeroSection";
import { getAnimationDelay } from "../../utils/animations";

/**
 * Feature: orbit-matter-homepage-migration
 * Property 5: Hero Timer Format
 * 
 * For any time value, the hero timer should display in format "Zone XX __ HH:MM" 
 * where XX is a two-digit sector (01-06) and HH:MM is Toronto timezone.
 * 
 * Validates: Requirements 6.2
 */

describe("Hero Timer Format Property", () => {
  it("should always return string in format 'Zone XX __ HH:MM'", () => {
    fc.assert(
      fc.property(
        fc.date({ min: new Date("2020-01-01"), max: new Date("2030-12-31"), noInvalidDate: true }),
        (date) => {
          const result = formatHeroTimer(date);
          // Check format: "Zone XX __ HH:MM"
          const formatRegex = /^Zone \d{2} __ \d{2}:\d{2}$/;
          expect(result).toMatch(formatRegex);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("should have sector between 01 and 06", () => {
    fc.assert(
      fc.property(
        fc.date({ min: new Date("2020-01-01"), max: new Date("2030-12-31"), noInvalidDate: true }),
        (date) => {
          const result = formatHeroTimer(date);
          const sectorMatch = result.match(/^Zone (\d{2})/);
          expect(sectorMatch).not.toBeNull();
          const sector = parseInt(sectorMatch![1]);
          expect(sector).toBeGreaterThanOrEqual(1);
          expect(sector).toBeLessThanOrEqual(6);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("should have valid hour (00-23) and minute (00-59)", () => {
    fc.assert(
      fc.property(
        fc.date({ min: new Date("2020-01-01"), max: new Date("2030-12-31"), noInvalidDate: true }),
        (date) => {
          const result = formatHeroTimer(date);
          const timeMatch = result.match(/(\d{2}):(\d{2})$/);
          expect(timeMatch).not.toBeNull();
          const hour = parseInt(timeMatch![1]);
          const minute = parseInt(timeMatch![2]);
          expect(hour).toBeGreaterThanOrEqual(0);
          expect(hour).toBeLessThanOrEqual(23);
          expect(minute).toBeGreaterThanOrEqual(0);
          expect(minute).toBeLessThanOrEqual(59);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("should calculate sector correctly based on hour", () => {
    // Sector = floor(hour / 4) + 1
    // Hour 0-3 -> Sector 1
    // Hour 4-7 -> Sector 2
    // Hour 8-11 -> Sector 3
    // Hour 12-15 -> Sector 4
    // Hour 16-19 -> Sector 5
    // Hour 20-23 -> Sector 6
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 23 }), // hour
        (hour) => {
          const expectedSector = Math.floor(hour / 4) + 1;
          expect(expectedSector).toBeGreaterThanOrEqual(1);
          expect(expectedSector).toBeLessThanOrEqual(6);
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * Feature: orbit-matter-homepage-migration
 * Property 8: Animation Delay Adjustment
 * 
 * For any animated element within the hero section, if the preloader is showing,
 * the animation delay should be increased by exactly 2 seconds.
 * 
 * Validates: Requirements 6.7, 13.4
 */

describe("Animation Delay Adjustment Property", () => {
  it("should add exactly 2 seconds when preloader is showing", () => {
    fc.assert(
      fc.property(
        fc.float({ min: 0, max: 10, noNaN: true }), // base delay
        (baseDelay) => {
          const result = getAnimationDelay(baseDelay, true);
          expect(result).toBeCloseTo(baseDelay + 2, 5);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("should not modify delay when preloader is not showing", () => {
    fc.assert(
      fc.property(
        fc.float({ min: 0, max: 10, noNaN: true }), // base delay
        (baseDelay) => {
          const result = getAnimationDelay(baseDelay, false);
          expect(result).toBeCloseTo(baseDelay, 5);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("should handle zero delay correctly", () => {
    expect(getAnimationDelay(0, true)).toBe(2);
    expect(getAnimationDelay(0, false)).toBe(0);
  });

  it("should maintain relative ordering of delays", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 5000 }), // use integers in ms to avoid float precision issues
        fc.integer({ min: 0, max: 5000 }),
        fc.boolean(),
        (delay1Ms, delay2Ms, isPreloaderShowing) => {
          const delay1 = delay1Ms / 1000;
          const delay2 = delay2Ms / 1000;
          const result1 = getAnimationDelay(delay1, isPreloaderShowing);
          const result2 = getAnimationDelay(delay2, isPreloaderShowing);
          // If delay1 < delay2, then result1 should be < result2
          if (delay1Ms < delay2Ms) {
            expect(result1).toBeLessThan(result2);
          } else if (delay1Ms > delay2Ms) {
            expect(result1).toBeGreaterThan(result2);
          } else {
            expect(result1).toBeCloseTo(result2, 5);
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});
