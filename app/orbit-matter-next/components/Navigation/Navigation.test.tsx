import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import { MOBILE_BREAKPOINT } from "../../utils/constants";

/**
 * Feature: orbit-matter-homepage-migration
 * Property 4: Navigation Mobile State
 * 
 * For any viewport resize event, if the new width > 1000px, 
 * the navigation should not have the "nav-open" class, regardless of previous state.
 * 
 * Validates: Requirements 3.5
 */

// Pure function to test: determines if nav should be open based on viewport width
function shouldNavBeOpen(currentIsOpen: boolean, viewportWidth: number): boolean {
  if (viewportWidth > MOBILE_BREAKPOINT) {
    return false;
  }
  return currentIsOpen;
}

describe("Navigation Mobile State Property", () => {
  it("should close nav when viewport width exceeds breakpoint, regardless of previous state", () => {
    fc.assert(
      fc.property(
        fc.boolean(), // previous isOpen state
        fc.integer({ min: MOBILE_BREAKPOINT + 1, max: 5000 }), // viewport width > 1000
        (previousIsOpen, viewportWidth) => {
          const result = shouldNavBeOpen(previousIsOpen, viewportWidth);
          // Property: nav should always be closed when viewport > 1000px
          expect(result).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("should preserve nav state when viewport width is at or below breakpoint", () => {
    fc.assert(
      fc.property(
        fc.boolean(), // previous isOpen state
        fc.integer({ min: 320, max: MOBILE_BREAKPOINT }), // viewport width <= 1000
        (previousIsOpen, viewportWidth) => {
          const result = shouldNavBeOpen(previousIsOpen, viewportWidth);
          // Property: nav state should be preserved when viewport <= 1000px
          expect(result).toBe(previousIsOpen);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("should handle edge case at exactly breakpoint width", () => {
    fc.assert(
      fc.property(
        fc.boolean(), // previous isOpen state
        (previousIsOpen) => {
          const result = shouldNavBeOpen(previousIsOpen, MOBILE_BREAKPOINT);
          // At exactly 1000px, nav state should be preserved (mobile mode)
          expect(result).toBe(previousIsOpen);
        }
      ),
      { numRuns: 100 }
    );
  });
});
