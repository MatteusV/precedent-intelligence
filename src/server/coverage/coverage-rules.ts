import { COVERAGE_THRESHOLD } from "@/lib/constants";

export function shouldTriggerIngest(count: number): boolean {
  return count < COVERAGE_THRESHOLD;
}
