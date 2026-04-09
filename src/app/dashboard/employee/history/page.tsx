"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { RequestCard } from "@/components/vacation/request-card";
import { Loader2 } from "lucide-react";

export default function HistoryPage() {
  const requests = useQuery(api.vacationRequests.listMine, {});

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Request History</h1>
        <p className="text-muted-foreground">
          All your vacation requests and their status
        </p>
      </div>

      {requests === undefined ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : requests.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border p-8 text-center">
          <p className="text-muted-foreground">No request history</p>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map((req) => (
            <RequestCard key={req._id} request={req} />
          ))}
        </div>
      )}
    </div>
  );
}
