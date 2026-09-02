import { StatusDot } from "@whatmatters/wmds";
import { EMPTY_GRID } from "@/lib/copy";

export function EmptyGrid() {
  return (
    <p>
      <StatusDot variant="info" besideLabel pulsing />
      {EMPTY_GRID}
    </p>
  );
}
