"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { GanttChart } from "@/components/timeline/gantt-chart";
import { Loader2 } from "lucide-react";

export default function TeamTimelinePage() {
  const requests = useQuery(api.vacationRequests.listVisible, {});

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Team Timeline</h1>
        <p className="text-muted-foreground">
          Visual overview of all team vacations
        </p>
      </div>

      {requests === undefined ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <GanttChart requests={requests} />
      )}
    </div>
  );
}
