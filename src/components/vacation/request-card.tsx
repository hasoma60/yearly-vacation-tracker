"use client";

import { Doc } from "../../../convex/_generated/dataModel";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { CalendarDays, User, Eye, EyeOff } from "lucide-react";

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
  pending: { label: "Pending", className: "border-yellow-500/50 text-yellow-500" },
  approved: { label: "Approved", className: "border-green-500/50 text-green-500" },
  rejected: { label: "Rejected", className: "border-red-500/50 text-red-500" },
};

const leaveTypeLabels: Record<string, { label: string; color: string }> = {
  annual: { label: "Annual", color: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
  sick: { label: "Sick", color: "bg-orange-500/10 text-orange-500 border-orange-500/20" },
  maternity: { label: "Maternity", color: "bg-pink-500/10 text-pink-500 border-pink-500/20" },
  paternity: { label: "Paternity", color: "bg-cyan-500/10 text-cyan-500 border-cyan-500/20" },
  bereavement: { label: "Bereavement", color: "bg-gray-500/10 text-gray-400 border-gray-500/20" },
  hajj: { label: "Hajj", color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" },
  unpaid: { label: "Unpaid", color: "bg-red-500/10 text-red-400 border-red-500/20" },
};

export function RequestCard({
  request,
  showEmployee = false,
  showConfidential = false,
}: RequestCardProps) {
  const status = statusConfig[request.status];
  const leaveInfo = leaveTypeLabels[request.leaveType] || leaveTypeLabels.annual;

  return (
    <Card className="transition-colors hover:bg-accent/30">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-2">
            {showEmployee && request.employee && (
              <p className="text-sm font-semibold">{request.employee.name}</p>
            )}
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <Badge variant="outline" className={leaveInfo.color}>
                {leaveInfo.label}
              </Badge>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <CalendarDays className="h-3.5 w-3.5" />
                <span>
                  {format(new Date(request.startDate), "MMM d")} -{" "}
                  {format(new Date(request.endDate), "MMM d, yyyy")}
                </span>
              </div>
              <span className="text-muted-foreground">
                {request.daysUsed} calendar days
              </span>
              {request.leaveType === "annual" && (
                <Badge variant="secondary" className="text-xs">
                  Period {request.periodNumber}
                </Badge>
              )}
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
            <Badge variant="outline" className={status.className}>
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
