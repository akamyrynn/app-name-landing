import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import { shouldTriggerTransition } from "./TransitionGrid";

/**
 * Feature: orbit-matter-homepage-migration
 * Property 7: Page Transition Link Filtering
 * 
 * For any clicked link, the page transition should only trigger if the link is internal,
 * not a hash link, not external (http/mailto/tel), and not pointing to the current page.
 * 
 * Validates: Requirements 12.5
 */

describe("Page Transition Link Filtering Property", () => {
  it("should not trigger transition for external http links", () => {
    fc.assert(
      fc.property(
        fc.webUrl(), // generates valid URLs like http://example.com
        fc.webPath(), // current path
        (href, currentPath) => {
          const result = shouldTriggerTransition(href, currentPath);
          expect(result).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("should not trigger transition for mailto links", () => {
    fc.assert(
      fc.property(
        fc.emailAddress().map((email) => `mailto:${email}`),
        fc.webPath(),
        (href, currentPath) => {
          const result = shouldTriggerTransition(href, currentPath);
          expect(result).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("should not trigger transition for tel links", () => {
    fc.assert(
      fc.property(
        fc.stringMatching(/^tel:\+?[0-9]{10,15}$/),
        fc.webPath(),
        (href, currentPath) => {
          const result = shouldTriggerTransition(href, currentPath);
          expect(result).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("should not trigger transition for hash links", () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 20 }).map((s) => `#${s.replace(/[^a-zA-Z0-9-_]/g, "")}`),
        fc.webPath(),
        (href, currentPath) => {
          const result = shouldTriggerTransition(href, currentPath);
          expect(result).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("should not trigger transition for null href", () => {
    fc.assert(
      fc.property(
        fc.webPath(),
        (currentPath) => {
          const result = shouldTriggerTransition(null, currentPath);
          expect(result).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("should not trigger transition when href equals current path", () => {
    fc.assert(
      fc.property(
        fc.constantFrom("/about", "/contact", "/expedition", "/traces", "/observatory"),
        (path) => {
          const result = shouldTriggerTransition(path, path);
          expect(result).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("should trigger transition for different internal paths", () => {
    fc.assert(
      fc.property(
        fc.constantFrom("/about", "/contact", "/expedition", "/traces", "/observatory"),
        fc.constantFrom("/", "/home", "/index"),
        (href, currentPath) => {
          // Only test when paths are actually different
          if (href !== currentPath && currentPath !== "/" && href !== "/") {
            const result = shouldTriggerTransition(href, currentPath);
            expect(result).toBe(true);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it("should handle index page variations correctly", () => {
    // All these should be treated as the same page (home)
    expect(shouldTriggerTransition("/", "/")).toBe(false);
    expect(shouldTriggerTransition("/index", "/")).toBe(false);
    expect(shouldTriggerTransition("/index.html", "/")).toBe(false);
    expect(shouldTriggerTransition("index.html", "/")).toBe(false);
    expect(shouldTriggerTransition("/", "/index")).toBe(false);
    
    // Different pages should trigger
    expect(shouldTriggerTransition("/about", "/")).toBe(true);
    expect(shouldTriggerTransition("/contact", "/index")).toBe(true);
  });
});
