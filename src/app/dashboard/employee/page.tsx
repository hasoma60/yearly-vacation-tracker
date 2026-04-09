"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { BalanceCard } from "@/components/vacation/balance-card";
import { RequestCard } from "@/components/vacation/request-card";
import { Button } from "@/components/ui/button";
import { Loader2, CalendarPlus } from "lucide-react";
import Link from "next/link";

export default function EmployeeDashboard() {
  const requests = useQuery(api.vacationRequests.listMine, {});

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
              <RequestCard key={req._id} request={req} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
