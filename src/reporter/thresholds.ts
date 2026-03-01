export function getComplianceLevel(pct: number): "green" | "yellow" | "red" {
  if (pct >= 80) return "green";
  if (pct >= 60) return "yellow";
  return "red";
}
