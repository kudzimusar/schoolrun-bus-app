import { describe, it, expect } from "bun:test";
import { calculateDistance } from "./distance";

describe("calculateDistance", () => {
  it("returns 0 for identical coordinates", () => {
    const d = calculateDistance(0, 0, 0, 0);
    expect(d).toBeCloseTo(0, 6);
  });

  it("computes approximately 111.2 km per degree latitude", () => {
    const d = calculateDistance(0, 0, 1, 0);
    expect(d).toBeGreaterThan(110000);
    expect(d).toBeLessThan(112500);
  });

  it("is symmetric regardless of point order", () => {
    const d1 = calculateDistance(10, 20, -5, 80);
    const d2 = calculateDistance(-5, 80, 10, 20);
    expect(d1).toBeCloseTo(d2, 6);
  });
});