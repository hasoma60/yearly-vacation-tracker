"use client";

import { Doc } from "../../../convex/_generated/dataModel";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import {
  CalendarDays,
  User,
  ShieldAlert,
  Eye,
  EyeOff,
} from "lucide-react";

interface RequestCardProps {
  request: Doc<"vacationRequests"> & {
    employee?: Doc<"users"> | null;
    replacement?: Doc<"users"> | null;
    reviewer?: Doc<"users"> | null;
  };
  showEmployee?: boolean;
  showConfidential?: boolean;
}

const statusConfig = {
  pending: { label: "Pending", variant: "outline" as const, className: "border-yellow-500/50 text-yellow-500" },
  approved: { label: "Approved", variant: "outline" as const, className: "border-green-500/50 text-green-500" },
  rejected: { label: "Rejected", variant: "outline" as const, className: "border-red-500/50 text-red-500" },
};

export function RequestCard({
  request,
  showEmployee = false,
  showConfidential = false,
}: RequestCardProps) {
  const status = statusConfig[request.status];

  return (
    <Card className="transition-colors hover:bg-accent/30">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-2">
            {showEmployee && request.employee && (
              <p className="text-sm font-semibold">{request.employee.name}</p>
            )}
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <CalendarDays className="h-3.5 w-3.5" />
                <span>
                  {format(new Date(request.startDate), "MMM d")} -{" "}
                  {format(new Date(request.endDate), "MMM d, yyyy")}
                </span>
              </div>
              <Badge variant="secondary" className="text-xs">
                Period {request.periodNumber}
              </Badge>
              <span className="text-muted-foreground">
                {request.daysUsed} days
              </span>
            </div>
            {request.replacement && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <User className="h-3 w-3" />
                <span>Replacement: {request.replacement.name}</span>
              </div>
            )}
            {request.reviewNote && (
              <p className="text-xs text-muted-foreground italic">
                Note: {request.reviewNote}
              </p>
            )}
          </div>
          <div className="flex flex-col items-end gap-2">
            <Badge variant={status.variant} className={status.className}>
              {status.label}
            </Badge>
            {showConfidential && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                {request.isConfidential ? (
                  <>
                    <EyeOff className="h-3 w-3" />
                    <span>Confidential</span>
                  </>
                ) : (
                  <>
                    <Eye className="h-3 w-3" />
                    <span>Visible</span>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
