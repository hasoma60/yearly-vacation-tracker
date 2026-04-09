"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Card, CardContent } from "@/components/ui/card";
import { CalendarDays, Clock, CheckCircle2, AlertCircle, ArrowRight } from "lucide-react";

export function BalanceCard() {
  const balance = useQuery(api.dashboard.getMyBalance);

  if (!balance) return null;

  const usedPercent = Math.round((balance.used / balance.allowance) * 100);

  const stats = [
    {
      label: "Annual Entitlement",
      value: balance.allowance,
      suffix: "calendar days",
      icon: CalendarDays,
      color: "text-blue-500",
      detail: "Per UAE Labor Law Art. 29",
    },
    {
      label: "Days Used",
      value: balance.used,
      suffix: "days",
      icon: CheckCircle2,
      color: "text-green-500",
    },
    {
      label: "Pending Approval",
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
      color: balance.remaining <= 5 ? "text-red-500" : "text-emerald-500",
    },
  ];

  if (balance.carryForward > 0) {
    stats.push({
      label: "Carry Forward",
      value: balance.carryForward,
      suffix: "days (max 15)",
      icon: ArrowRight,
      color: "text-purple-500",
    });
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
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
                  <span className="ml-1 text-xs font-normal text-muted-foreground">
                    {stat.suffix}
                  </span>
                </p>
                {"detail" in stat && stat.detail && (
                  <p className="mt-0.5 text-[10px] text-muted-foreground">
                    {stat.detail}
                  </p>
                )}
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
                  {usedPercent}% of entitlement used
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
