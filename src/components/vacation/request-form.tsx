"use client";

import { useState, useMemo } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, AlertTriangle, Info } from "lucide-react";
import { Id } from "../../../convex/_generated/dataModel";

const LEAVE_TYPES = [
  { value: "annual", label: "Annual Leave", description: "30 calendar days/year (UAE Labor Law Art. 29)" },
  { value: "sick", label: "Sick Leave", description: "90 days: 15 full + 30 half + 45 unpaid" },
  { value: "maternity", label: "Maternity Leave", description: "60 days: 45 full + 15 half pay" },
  { value: "paternity", label: "Paternity Leave", description: "5 working days (within 6 months of birth)" },
  { value: "bereavement", label: "Bereavement Leave", description: "5 days (spouse) or 3 days (family)" },
  { value: "hajj", label: "Hajj Leave", description: "Up to 30 days unpaid (once per employment)" },
  { value: "unpaid", label: "Unpaid Leave", description: "No pay" },
] as const;

type LeaveType = (typeof LEAVE_TYPES)[number]["value"];

export function VacationRequestForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [leaveType, setLeaveType] = useState<LeaveType>("annual");
  const [periodNumber, setPeriodNumber] = useState("1");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [replacementId, setReplacementId] = useState("");

  const profile = useQuery(api.users.getMyProfile);
  const balance = useQuery(api.dashboard.getMyBalance);
  const allEmployees = useQuery(
    api.users.listAllActive,
    profile ? { excludeUserId: profile._id } : "skip"
  );

  const overlapCheck = useQuery(
    api.vacationRequests.checkOverlap,
    replacementId && startDate && endDate
      ? {
          replacementId: replacementId as Id<"users">,
          startDate,
          endDate,
          year: new Date().getFullYear(),
        }
      : "skip"
  );

  const submit = useMutation(api.vacationRequests.submit);

  const selectedReplacementName = useMemo(() => {
    if (!replacementId || !allEmployees) return "";
    return allEmployees.find((e) => e._id === replacementId)?.name || "";
  }, [replacementId, allEmployees]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate || !endDate) {
      toast.error("Please select start and end dates");
      return;
    }

    setIsSubmitting(true);
    try {
      await submit({
        leaveType,
        periodNumber: Number(periodNumber) as 1 | 2 | 3 | 4,
        startDate,
        endDate,
        replacementId: replacementId
          ? (replacementId as Id<"users">)
          : undefined,
        year: new Date().getFullYear(),
      });
      toast.success("Leave request submitted successfully!");
      setStartDate("");
      setEndDate("");
      setReplacementId("");
      setPeriodNumber("1");
      setLeaveType("annual");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to submit request"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // UAE: Calendar days (all days count including weekends and public holidays)
  const calendarDays = startDate && endDate ? calculateCalendarDays(startDate, endDate) : 0;
  const selectedLeaveInfo = LEAVE_TYPES.find((t) => t.value === leaveType);

  return (
    <Card>
      <CardHeader>
        <CardTitle>New Leave Request</CardTitle>
        <CardDescription>
          Submit a leave request per UAE Federal Decree-Law No. 33/2021.
          Annual leave is counted in calendar days.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Leave Type</Label>
              <select
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                value={leaveType}
                onChange={(e) => setLeaveType(e.target.value as LeaveType)}
              >
                {LEAVE_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
              {selectedLeaveInfo && (
                <p className="text-xs text-muted-foreground flex items-start gap-1">
                  <Info className="h-3 w-3 mt-0.5 shrink-0" />
                  {selectedLeaveInfo.description}
                </p>
              )}
            </div>

            {leaveType === "annual" && (
              <div className="space-y-2">
                <Label>Period</Label>
                <select
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  value={periodNumber}
                  onChange={(e) => setPeriodNumber(e.target.value)}
                >
                  <option value="1">Period 1</option>
                  <option value="2">Period 2</option>
                  <option value="3">Period 3</option>
                  <option value="4">Period 4</option>
                </select>
              </div>
            )}

            <div className="space-y-2">
              <Label>Replacement Person</Label>
              <select
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                value={replacementId}
                onChange={(e) => setReplacementId(e.target.value)}
              >
                <option value="">Select replacement...</option>
                {allEmployees?.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate}
                required
              />
            </div>
          </div>

          {calendarDays > 0 && (
            <div className="flex items-center gap-3 rounded-lg border border-border/50 bg-muted/30 p-3">
              <div className="text-sm">
                <span className="text-muted-foreground">Calendar days: </span>
                <span className="font-semibold">{calendarDays}</span>
              </div>
              {leaveType === "annual" && balance && (
                <>
                  <span className="text-muted-foreground">|</span>
                  <div className="text-sm">
                    <span className="text-muted-foreground">Remaining after: </span>
                    <span
                      className={`font-semibold ${
                        balance.remaining - calendarDays < 0
                          ? "text-destructive"
                          : ""
                      }`}
                    >
                      {balance.remaining - calendarDays} days
                    </span>
                  </div>
                </>
              )}
            </div>
          )}

          {overlapCheck?.hasOverlap && (
            <div className="flex items-start gap-2 rounded-lg border border-yellow-500/30 bg-yellow-500/5 p-3">
              <AlertTriangle className="mt-0.5 h-4 w-4 text-yellow-500 shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-yellow-500">Overlap Detected</p>
                <p className="text-muted-foreground">
                  {selectedReplacementName} has leave during{" "}
                  {overlapCheck.conflictingRequest?.startDate} to{" "}
                  {overlapCheck.conflictingRequest?.endDate}. You can still
                  submit, but the manager will see this warning.
                </p>
              </div>
            </div>
          )}

          <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Request"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function calculateCalendarDays(start: string, end: string): number {
  const s = new Date(start);
  const e = new Date(end);
  if (s > e) return 0;
  return Math.floor((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)) + 1;
}
