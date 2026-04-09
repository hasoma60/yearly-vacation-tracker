"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { format } from "date-fns";
import { Loader2, Wallet, CheckCircle2, Clock } from "lucide-react";
import { Id } from "../../../../convex/_generated/dataModel";

export default function AccountsDashboard() {
  const [releaseOpen, setReleaseOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<Id<"leaveSalary"> | null>(null);
  const [amount, setAmount] = useState("");
  const [isReleasing, setIsReleasing] = useState(false);

  const pendingRecords = useQuery(api.leaveSalary.listPending);
  const releasedRecords = useQuery(api.leaveSalary.listReleased);
  const releaseMutation = useMutation(api.leaveSalary.release);

  const handleRelease = async () => {
    if (!selectedId) return;
    setIsReleasing(true);
    try {
      await releaseMutation({
        id: selectedId,
        totalAmount: amount ? Number(amount) : undefined,
      });
      toast.success("Leave salary released");
      setReleaseOpen(false);
      setAmount("");
      setSelectedId(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed");
    } finally {
      setIsReleasing(false);
    }
  };

  const pendingTotal = pendingRecords?.length || 0;
  const releasedTotal = releasedRecords?.length || 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Leave Salary</h1>
        <p className="text-muted-foreground">
          Manage and release leave salary for approved vacations
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <Clock className="h-5 w-5 text-yellow-500" />
            <div>
              <p className="text-xs text-muted-foreground">Pending Release</p>
              <p className="text-xl font-bold">{pendingTotal}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            <div>
              <p className="text-xs text-muted-foreground">Released</p>
              <p className="text-xl font-bold">{releasedTotal}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <Wallet className="h-5 w-5 text-purple-500" />
            <div>
              <p className="text-xs text-muted-foreground">Total Released (AED)</p>
              <p className="text-xl font-bold">
                AED {releasedRecords
                  ?.reduce((sum, r) => sum + (r.totalAmount || 0), 0)
                  .toLocaleString() || 0}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">
            Pending ({pendingTotal})
          </TabsTrigger>
          <TabsTrigger value="released">
            Released ({releasedTotal})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <Card>
            <CardContent className="p-0">
              {pendingRecords === undefined ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : pendingRecords.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  No pending leave salaries
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Leave Period</TableHead>
                      <TableHead className="text-center">Days</TableHead>
                      <TableHead className="text-center">Calculated (AED)</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingRecords.map((rec) => (
                      <TableRow key={rec._id}>
                        <TableCell className="font-medium">
                          {rec.employee?.name}
                        </TableCell>
                        <TableCell>
                          {rec.request && (
                            <span className="text-sm">
                              {format(new Date(rec.request.startDate), "MMM d")} -{" "}
                              {format(new Date(rec.request.endDate), "MMM d, yyyy")}
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {rec.request?.daysUsed}
                        </TableCell>
                        <TableCell className="text-center text-sm">
                          {rec.totalAmount ? `AED ${rec.totalAmount.toLocaleString()}` : "-"}
                          {rec.basicAmount ? (
                            <span className="block text-xs text-muted-foreground">
                              Basic: {rec.basicAmount.toLocaleString()} + Allow: {rec.allowancesAmount?.toLocaleString() || 0}
                            </span>
                          ) : null}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedId(rec._id);
                              setReleaseOpen(true);
                            }}
                          >
                            <Wallet className="mr-1.5 h-3.5 w-3.5" />
                            Release
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="released">
          <Card>
            <CardContent className="p-0">
              {releasedRecords === undefined ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : releasedRecords.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  No released records
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Vacation Period</TableHead>
                      <TableHead className="text-center">Amount (AED)</TableHead>
                      <TableHead>Released By</TableHead>
                      <TableHead>Released At</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {releasedRecords.map((rec) => (
                      <TableRow key={rec._id}>
                        <TableCell className="font-medium">
                          {rec.employee?.name}
                        </TableCell>
                        <TableCell>
                          {rec.request && (
                            <span className="text-sm">
                              {format(new Date(rec.request.startDate), "MMM d")} -{" "}
                              {format(new Date(rec.request.endDate), "MMM d, yyyy")}
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-center font-medium">
                          {rec.totalAmount ? `AED ${rec.totalAmount.toLocaleString()}` : "-"}
                        </TableCell>
                        <TableCell>{rec.releasedByUser?.name || "-"}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {rec.releasedAt
                            ? format(new Date(rec.releasedAt), "MMM d, yyyy")
                            : "-"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={releaseOpen} onOpenChange={setReleaseOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Release Leave Salary</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              UAE Labor Law: Leave salary = (Basic + Fixed Allowances) / 30 x Leave Days
            </p>
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Total Amount (AED) - Override if needed
              </label>
              <Input
                type="number"
                placeholder="Auto-calculated from salary..."
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReleaseOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleRelease} disabled={isReleasing}>
              {isReleasing && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Release Salary
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
