"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Loader2, AlertTriangle } from "lucide-react";
import { Id } from "../../../convex/_generated/dataModel";

export function VacationRequestForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [periodNumber, setPeriodNumber] = useState<"1" | "2">("1");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [replacementId, setReplacementId] = useState<string>("");

  const profile = useQuery(api.users.getMyProfile);
  const balance = useQuery(api.dashboard.getMyBalance);
  const colleagues = useQuery(
    api.users.listByDepartment,
    profile?.departmentId
      ? { departmentId: profile.departmentId, excludeUserId: profile._id }
      : "skip"
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate || !endDate) {
      toast.error("Please select start and end dates");
      return;
    }

    setIsSubmitting(true);
    try {
      await submit({
        periodNumber: Number(periodNumber) as 1 | 2,
        startDate,
        endDate,
        replacementId: replacementId
          ? (replacementId as Id<"users">)
          : undefined,
        year: new Date().getFullYear(),
      });
      toast.success("Vacation request submitted successfully!");
      setStartDate("");
      setEndDate("");
      setReplacementId("");
      setPeriodNumber("1");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to submit request"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate business days preview
  const businessDays =
    startDate && endDate ? calculatePreviewDays(startDate, endDate) : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>New Vacation Request</CardTitle>
        <CardDescription>
          Submit a vacation request for approval. You can have up to 2 vacation
          periods per year.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="period">Vacation Period</Label>
              <Select value={periodNumber} onValueChange={(v) => setPeriodNumber(v as "1" | "2")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Period 1</SelectItem>
                  <SelectItem value="2">Period 2</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="replacement">Replacement Person</Label>
              <Select value={replacementId} onValueChange={(v) => setReplacementId(v ?? "")}>
                <SelectTrigger>
                  <SelectValue placeholder="Select replacement..." />
                </SelectTrigger>
                <SelectContent>
                  {colleagues?.map((c) => (
                    <SelectItem key={c._id} value={c._id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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

          {businessDays > 0 && (
            <div className="flex items-center gap-3 rounded-lg border border-border/50 bg-muted/30 p-3">
              <div className="text-sm">
                <span className="text-muted-foreground">Business days: </span>
                <span className="font-semibold">{businessDays}</span>
              </div>
              {balance && (
                <>
                  <span className="text-muted-foreground">|</span>
                  <div className="text-sm">
                    <span className="text-muted-foreground">
                      Remaining after:{" "}
                    </span>
                    <span
                      className={`font-semibold ${
                        balance.remaining - businessDays < 0
                          ? "text-destructive"
                          : ""
                      }`}
                    >
                      {balance.remaining - businessDays} days
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
                  Your replacement has a vacation during{" "}
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

function calculatePreviewDays(start: string, end: string): number {
  const s = new Date(start);
  const e = new Date(end);
  if (s > e) return 0;
  let count = 0;
  const current = new Date(s);
  while (current <= e) {
    const day = current.getDay();
    if (day !== 0 && day !== 6) count++;
    current.setDate(current.getDate() + 1);
  }
  return count;
}
