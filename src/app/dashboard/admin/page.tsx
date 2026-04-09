"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { GanttChart } from "@/components/timeline/gantt-chart";
import { RequestCard } from "@/components/vacation/request-card";
import { Loader2 } from "lucide-react";

export default function AdminDashboard() {
  const requests = useQuery(api.vacationRequests.listAll, {});
  const allVisible = useQuery(api.vacationRequests.listVisible, {});

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Admin Overview</h1>
        <p className="text-muted-foreground">
          System-wide vacation tracking dashboard
        </p>
      </div>

      <StatsCards />

      {allVisible !== undefined && (
        <div>
          <h2 className="mb-3 text-lg font-semibold">Vacation Timeline</h2>
          <GanttChart requests={allVisible} />
        </div>
      )}

      <div>
        <h2 className="mb-3 text-lg font-semibold">All Requests</h2>
        {requests === undefined ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : requests.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border p-8 text-center">
            <p className="text-muted-foreground">No requests yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {requests.map((req) => (
              <RequestCard
                key={req._id}
                request={req}
                showEmployee
                showConfidential
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
