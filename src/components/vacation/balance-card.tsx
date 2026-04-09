"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Card, CardContent } from "@/components/ui/card";
import { CalendarDays, Clock, CheckCircle2, AlertCircle } from "lucide-react";

export function BalanceCard() {
  const balance = useQuery(api.dashboard.getMyBalance);

  if (!balance) return null;

  const usedPercent = Math.round((balance.used / balance.allowance) * 100);

  const stats = [
    {
      label: "Annual Allowance",
      value: balance.allowance,
      suffix: "days",
      icon: CalendarDays,
      color: "text-blue-500",
    },
    {
      label: "Days Used",
      value: balance.used,
      suffix: "days",
      icon: CheckCircle2,
      color: "text-green-500",
    },
    {
      label: "Pending",
      value: balance.pending,
      suffix: "days",
      icon: Clock,
      color: "text-yellow-500",
    },
    {
      label: "Remaining",
      value: balance.remaining,
      suffix: "days",
      icon: AlertCircle,
      color: balance.remaining <= 3 ? "text-red-500" : "text-emerald-500",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.label}>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground">
                  {stat.label}
                </p>
                <p className="mt-1.5 text-2xl font-bold">
                  {stat.value}
                  <span className="ml-1 text-sm font-normal text-muted-foreground">
                    {stat.suffix}
                  </span>
                </p>
              </div>
              <stat.icon className={`h-8 w-8 ${stat.color} opacity-80`} />
            </div>
            {stat.label === "Days Used" && (
              <div className="mt-3">
                <div className="h-1.5 w-full rounded-full bg-muted">
                  <div
                    className="h-1.5 rounded-full bg-primary transition-all"
                    style={{ width: `${Math.min(usedPercent, 100)}%` }}
                  />
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {usedPercent}% of allowance used
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
