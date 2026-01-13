import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import { shouldShowPreloader } from "./usePreloader";

/**
 * Feature: orbit-matter-homepage-migration
 * Property 1: Preloader Session State Consistency
 * 
 * For any page load, if sessionStorage contains "preloaderSeen" = "true", 
 * then the preloader component should not render and Lenis scroll should be immediately enabled.
 * 
 * Validates: Requirements 4.6, 4.7, 4.8
 */

describe("Preloader Session State Property", () => {
  it("should not show preloader when sessionStorage has 'true' value", () => {
    fc.assert(
      fc.property(
        fc.constant("true"), // sessionStorage value is "true"
        (sessionValue) => {
          const result = shouldShowPreloader(sessionValue);
          // Property: preloader should NOT be visible when session says it was seen
          expect(result).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("should show preloader when sessionStorage is null (first visit)", () => {
    fc.assert(
      fc.property(
        fc.constant(null), // sessionStorage returns null
        (sessionValue) => {
          const result = shouldShowPreloader(sessionValue);
          // Property: preloader should be visible on first visit
          expect(result).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("should show preloader for any value other than 'true'", () => {
    fc.assert(
      fc.property(
        fc.string().filter((s) => s !== "true"), // any string except "true"
        (sessionValue) => {
          const result = shouldShowPreloader(sessionValue);
          // Property: preloader should be visible for any non-"true" value
          expect(result).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("should handle edge cases consistently", () => {
    // Test specific edge cases
    expect(shouldShowPreloader("")).toBe(true);
    expect(shouldShowPreloader("false")).toBe(true);
    expect(shouldShowPreloader("TRUE")).toBe(true); // case sensitive
    expect(shouldShowPreloader("True")).toBe(true);
    expect(shouldShowPreloader("true")).toBe(false);
    expect(shouldShowPreloader(null)).toBe(true);
  });
});
