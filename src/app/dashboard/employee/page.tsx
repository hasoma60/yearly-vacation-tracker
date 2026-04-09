"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { BalanceCard } from "@/components/vacation/balance-card";
import { RequestCard } from "@/components/vacation/request-card";
import { Button } from "@/components/ui/button";
import { Loader2, CalendarPlus, X } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { Id } from "../../../../convex/_generated/dataModel";

export default function EmployeeDashboard() {
  const requests = useQuery(api.vacationRequests.listMine, {});
  const cancelRequest = useMutation(api.vacationRequests.cancel);

  const handleCancel = async (id: Id<"vacationRequests">) => {
    try {
      await cancelRequest({ id });
      toast.success("Request cancelled");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to cancel"
      );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Vacations</h1>
          <p className="text-muted-foreground">
            Your vacation balance and current requests
          </p>
        </div>
        <Link href="/dashboard/employee/request">
          <Button>
            <CalendarPlus className="mr-2 h-4 w-4" />
            New Request
          </Button>
        </Link>
      </div>

      <BalanceCard />

      <div>
        <h2 className="mb-3 text-lg font-semibold">Current Requests</h2>
        {requests === undefined ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : requests.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border p-8 text-center">
            <p className="text-muted-foreground">No vacation requests yet</p>
            <Link href="/dashboard/employee/request">
              <Button variant="outline" className="mt-3">
                Submit your first request
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {requests.map((req) => (
              <div key={req._id} className="relative">
                <RequestCard request={req} />
                {req.status === "pending" && (
                  <div className="absolute right-4 top-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => handleCancel(req._id)}
                    >
                      <X className="mr-1 h-3.5 w-3.5" />
                      Cancel
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
