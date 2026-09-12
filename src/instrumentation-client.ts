import { installFlightPerformanceMeasureGuard } from "@/lib/flight-performance-measure";

try {
  installFlightPerformanceMeasureGuard();
} catch {
  // Instrumentation must never block hydration.
}
