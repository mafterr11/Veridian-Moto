import type { Availability } from "@/data/catalogue";
import { availabilityLabels } from "@/data/catalogue";
import { cn } from "@/lib/utils";

export function AvailabilityBadge({ status }: { status: Availability }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 text-xs font-bold tracking-wide uppercase",
        status === "available" && "text-primary",
        status === "incoming" && "text-signal-amber",
        status === "order" && "text-muted-foreground",
      )}
    >
      <span
        className={cn(
          "size-1.5 rounded-full",
          status === "available" && "bg-primary",
          status === "incoming" && "bg-signal-amber",
          status === "order" && "bg-muted-foreground",
        )}
        aria-hidden="true"
      />
      {availabilityLabels[status]}
    </span>
  );
}
