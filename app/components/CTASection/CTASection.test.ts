import { describe, it, expect } from "vitest";
import { calculateCardTransform, PARALLAX_VALUES } from "./CTASection";

describe("CTASection", () => {
  describe("calculateCardTransform", () => {
    it("should return zero transform at progress 0", () => {
      const result = calculateCardTransform(0, 0, true);
      expect(result.x).toBeCloseTo(0);
      expect(result.y).toBeCloseTo(0);
      expect(result.rotation).toBeCloseTo(0);
    });

    it("should return full transform at progress 1 for left card", () => {
      const result = calculateCardTransform(1, 0, true);
      expect(result.x).toBe(PARALLAX_VALUES.leftX[0]);
      expect(result.y).toBe(PARALLAX_VALUES.y[0]);
      expect(result.rotation).toBe(PARALLAX_VALUES.leftRotation[0]);
    });

    it("should return full transform at progress 1 for right card", () => {
      const result = calculateCardTransform(1, 0, false);
      expect(result.x).toBe(PARALLAX_VALUES.rightX[0]);
      expect(result.y).toBe(PARALLAX_VALUES.y[0]);
      expect(result.rotation).toBe(PARALLAX_VALUES.rightRotation[0]);
    });

    it("should return half transform at progress 0.5", () => {
      const result = calculateCardTransform(0.5, 1, true);
      expect(result.x).toBe(PARALLAX_VALUES.leftX[1] * 0.5);
      expect(result.y).toBe(PARALLAX_VALUES.y[1] * 0.5);
      expect(result.rotation).toBe(PARALLAX_VALUES.leftRotation[1] * 0.5);
    });

    it("should use different values for different row indices", () => {
      const row0 = calculateCardTransform(1, 0, true);
      const row1 = calculateCardTransform(1, 1, true);
      const row2 = calculateCardTransform(1, 2, true);

      expect(row0.x).not.toBe(row1.x);
      expect(row1.x).not.toBe(row2.x);
    });

    it("should handle out of bounds row index gracefully", () => {
      const result = calculateCardTransform(1, 10, true);
      // Should use last available index
      expect(result.x).toBe(PARALLAX_VALUES.leftX[2]);
    });

    it("should produce opposite x directions for left and right cards", () => {
      const left = calculateCardTransform(1, 0, true);
      const right = calculateCardTransform(1, 0, false);
      
      expect(left.x).toBeLessThan(0);
      expect(right.x).toBeGreaterThan(0);
    });

    it("should produce opposite rotations for left and right cards", () => {
      const left = calculateCardTransform(1, 0, true);
      const right = calculateCardTransform(1, 0, false);
      
      expect(left.rotation).toBeLessThan(0);
      expect(right.rotation).toBeGreaterThan(0);
    });
  });
});
