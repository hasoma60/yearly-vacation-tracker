"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Card, CardContent } from "@/components/ui/card";
import {
  Users,
  CheckCircle2,
  Clock,
  CalendarDays,
  AlertTriangle,
  BarChart3,
} from "lucide-react";

export function StatsCards() {
  const summary = useQuery(api.vacationRequests.getYearSummary, {});

  if (!summary) return null;

  const stats = [
    {
      label: "Total Employees",
      value: summary.totalEmployees,
      icon: Users,
      color: "text-blue-500",
    },
    {
      label: "Approved",
      value: summary.totalApproved,
      icon: CheckCircle2,
      color: "text-green-500",
    },
    {
      label: "Pending",
      value: summary.totalPending,
      icon: Clock,
      color: "text-yellow-500",
    },
    {
      label: "Total Days Used",
      value: summary.totalDaysUsed,
      icon: CalendarDays,
      color: "text-purple-500",
    },
    {
      label: "Avg Days/Person",
      value: summary.avgDaysPerPerson,
      icon: BarChart3,
      color: "text-cyan-500",
    },
    {
      label: "Overlaps Found",
      value: summary.overlapsFound,
      icon: AlertTriangle,
      color:
        summary.overlapsFound > 0 ? "text-red-500" : "text-muted-foreground",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {stats.map((stat) => (
        <Card key={stat.label}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <stat.icon className={`h-5 w-5 ${stat.color} shrink-0`} />
              <div>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
                <p className="text-xl font-bold">{stat.value}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
