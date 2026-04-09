"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { RequestCard } from "@/components/vacation/request-card";
import { ApprovalActions } from "@/components/vacation/approval-actions";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, AlertTriangle } from "lucide-react";
import { format } from "date-fns";

export default function ManagerDashboard() {
  const pending = useQuery(api.vacationRequests.listPending);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Approvals</h1>
        <p className="text-muted-foreground">
          Review and manage vacation requests
        </p>
      </div>

      <StatsCards />

      <div>
        <h2 className="mb-3 text-lg font-semibold">
          Pending Requests
          {pending && pending.length > 0 && (
            <Badge variant="secondary" className="ml-2">
              {pending.length}
            </Badge>
          )}
        </h2>
        {pending === undefined ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : pending.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border p-8 text-center">
            <p className="text-muted-foreground">No pending requests</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pending.map((req) => (
              <Card key={req._id} className="transition-colors hover:bg-accent/30">
                <CardContent className="p-4">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-1.5">
                      <p className="font-semibold">
                        {req.employee?.name || "Unknown"}
                      </p>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span>
                          {format(new Date(req.startDate), "MMM d")} -{" "}
                          {format(new Date(req.endDate), "MMM d, yyyy")}
                        </span>
                        <Badge variant="secondary" className="text-xs">
                          {req.daysUsed} days
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          Period {req.periodNumber}
                        </Badge>
                      </div>
                      {req.replacement && (
                        <p className="text-xs text-muted-foreground">
                          Replacement: {req.replacement.name}
                        </p>
                      )}
                    </div>
                    <ApprovalActions
                      requestId={req._id}
                      employeeName={req.employee?.name || "Employee"}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
