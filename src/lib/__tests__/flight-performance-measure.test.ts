import { afterEach, describe, expect, it, vi } from "vitest";
import {
  installFlightPerformanceMeasureGuard,
  isFlightNegativeTimestampError,
} from "@/lib/flight-performance-measure";

describe("isFlightNegativeTimestampError", () => {
  it("matches the Chrome Flight measure wording", () => {
    expect(
      isFlightNegativeTimestampError(
        new TypeError(
          "Failed to execute 'measure' on 'Performance': 'OfficeLayoutShell [Prerender]' cannot have a negative time stamp.",
        ),
      ),
    ).toBe(true);
  });

  it("matches the Firefox Flight measure wording", () => {
    expect(
      isFlightNegativeTimestampError(
        new TypeError("Performance.measure: Given attribute end cannot be negative"),
      ),
    ).toBe(true);
  });

  it("leaves unrelated measure errors alone", () => {
    expect(
      isFlightNegativeTimestampError(new Error("Failed to execute 'measure' on 'Performance'")),
    ).toBe(false);
  });
});

describe("installFlightPerformanceMeasureGuard", () => {
  const originalMeasure = performance.measure.bind(performance);

  afterEach(() => {
    performance.measure = originalMeasure;
  });

  it("swallows the Flight negative timestamp throw", () => {
    performance.measure = vi.fn(() => {
      throw new TypeError(
        "Failed to execute 'measure' on 'Performance': 'OfficeLayoutShell [Prerender]' cannot have a negative time stamp.",
      );
    }) as typeof performance.measure;

    installFlightPerformanceMeasureGuard();

    expect(() => {
      performance.measure("OfficeLayoutShell [Prerender]");
    }).not.toThrow();
  });

  it("rethrows other measure failures", () => {
    performance.measure = vi.fn(() => {
      throw new TypeError("Failed to execute 'measure' on 'Performance': Invalid mark");
    }) as typeof performance.measure;

    installFlightPerformanceMeasureGuard();

    expect(() => {
      performance.measure("other");
    }).toThrow(/Invalid mark/);
  });
});
