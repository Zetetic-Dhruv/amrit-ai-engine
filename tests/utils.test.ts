import { describe, expect, it } from "vitest";
import { cosineSimilarity } from "@/lib/utils";

describe("cosineSimilarity", () => {
  it("ranks aligned vectors above orthogonal vectors", () => {
    expect(cosineSimilarity([1, 0], [1, 0])).toBeCloseTo(1);
    expect(cosineSimilarity([1, 0], [0, 1])).toBeCloseTo(0);
  });

  it("returns zero for incompatible vectors", () => {
    expect(cosineSimilarity([1], [1, 2])).toBe(0);
  });
});
