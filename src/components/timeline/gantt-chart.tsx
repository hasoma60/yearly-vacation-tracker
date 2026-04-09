"use client";

import { useMemo } from "react";
import { Doc } from "../../../convex/_generated/dataModel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format, differenceInDays, startOfYear, endOfYear } from "date-fns";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

interface GanttChartProps {
  requests: (Doc<"vacationRequests"> & {
    employee?: Doc<"users"> | null;
    replacement?: Doc<"users"> | null;
  })[];
}

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const STATUS_COLORS = {
  approved: "bg-emerald-500",
  pending: "bg-yellow-500",
  rejected: "bg-red-500/40",
};

export function GanttChart({ requests }: GanttChartProps) {
  const year = new Date().getFullYear();
  const yearStart = startOfYear(new Date(year, 0, 1));
  const yearEnd = endOfYear(new Date(year, 0, 1));
  const totalDays = differenceInDays(yearEnd, yearStart) + 1;

  const employeeMap = useMemo(() => {
    const map = new Map<
      string,
      { name: string; requests: typeof requests }
    >();
    for (const req of requests) {
      const empId = req.employeeId;
      const empName = req.employee?.name || "Unknown";
      if (!map.has(empId)) {
        map.set(empId, { name: empName, requests: [] });
      }
      map.get(empId)!.requests.push(req);
    }
    return map;
  }, [requests]);

  const employees = Array.from(employeeMap.entries()).sort(([, a], [, b]) =>
    a.name.localeCompare(b.name)
  );

  if (requests.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-muted-foreground">
          No vacation data to display
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">
            Vacation Timeline {year}
          </CardTitle>
          <div className="flex gap-3">
            <div className="flex items-center gap-1.5 text-xs">
              <div className="h-2.5 w-2.5 rounded-sm bg-emerald-500" />
              <span className="text-muted-foreground">Approved</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs">
              <div className="h-2.5 w-2.5 rounded-sm bg-yellow-500" />
              <span className="text-muted-foreground">Pending</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="w-full">
          <div className="min-w-[900px]">
            {/* Month headers */}
            <div className="flex border-b border-border">
              <div className="w-40 shrink-0 border-r border-border px-3 py-2 text-xs font-medium text-muted-foreground">
                Employee
              </div>
              <div className="flex flex-1">
                {MONTHS.map((month, i) => (
                  <div
                    key={month}
                    className="flex-1 border-r border-border/50 px-1 py-2 text-center text-xs text-muted-foreground"
                  >
                    {month}
                  </div>
                ))}
              </div>
            </div>

            {/* Employee rows */}
            {employees.map(([empId, data]) => (
              <div
                key={empId}
                className="flex border-b border-border/50 hover:bg-accent/20 transition-colors"
              >
                <div className="w-40 shrink-0 border-r border-border px-3 py-2.5 text-sm font-medium truncate">
                  {data.name}
                </div>
                <div className="relative flex-1 py-1.5">
                  {/* Month grid lines */}
                  <div className="absolute inset-0 flex">
                    {MONTHS.map((_, i) => (
                      <div
                        key={i}
                        className="flex-1 border-r border-border/20"
                      />
                    ))}
                  </div>

                  {/* Vacation bars */}
                  {data.requests
                    .filter((r) => r.status !== "rejected")
                    .map((req) => {
                      const startOffset = differenceInDays(
                        new Date(req.startDate),
                        yearStart
                      );
                      const duration = differenceInDays(
                        new Date(req.endDate),
                        new Date(req.startDate)
                      ) + 1;

                      const leftPercent = (startOffset / totalDays) * 100;
                      const widthPercent = (duration / totalDays) * 100;

                      return (
                        <div
                          key={req._id}
                          className={`absolute top-1/2 -translate-y-1/2 h-5 rounded-sm ${STATUS_COLORS[req.status]} opacity-80 hover:opacity-100 transition-opacity cursor-default`}
                          style={{
                            left: `${leftPercent}%`,
                            width: `${Math.max(widthPercent, 0.5)}%`,
                          }}
                          title={`${data.name}: ${format(new Date(req.startDate), "MMM d")} - ${format(new Date(req.endDate), "MMM d")} (${req.daysUsed} days, P${req.periodNumber})`}
                        >
                          {widthPercent > 3 && (
                            <span className="absolute inset-0 flex items-center justify-center text-[9px] font-medium text-white truncate px-1">
                              {req.daysUsed}d
                            </span>
                          )}
                        </div>
                      );
                    })}
                </div>
              </div>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
