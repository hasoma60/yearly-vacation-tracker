"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { Id } from "../../../convex/_generated/dataModel";

interface ApprovalActionsProps {
  requestId: Id<"vacationRequests">;
  employeeName: string;
  onComplete?: () => void;
}

export function ApprovalActions({
  requestId,
  employeeName,
  onComplete,
}: ApprovalActionsProps) {
  const [note, setNote] = useState("");
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [action, setAction] = useState<"approve" | "reject">("approve");

  const approve = useMutation(api.vacationRequests.approve);
  const reject = useMutation(api.vacationRequests.reject);

  const handleAction = async () => {
    const setLoading = action === "approve" ? setIsApproving : setIsRejecting;
    setLoading(true);
    try {
      if (action === "approve") {
        await approve({ id: requestId, note: note || undefined });
        toast.success(`${employeeName}'s request approved`);
      } else {
        await reject({ id: requestId, note: note || undefined });
        toast.success(`${employeeName}'s request rejected`);
      }
      setDialogOpen(false);
      setNote("");
      onComplete?.();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Action failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="outline"
          className="border-green-500/30 text-green-500 hover:bg-green-500/10"
          onClick={() => {
            setAction("approve");
            setDialogOpen(true);
          }}
        >
          <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
          Approve
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="border-red-500/30 text-red-500 hover:bg-red-500/10"
          onClick={() => {
            setAction("reject");
            setDialogOpen(true);
          }}
        >
          <XCircle className="mr-1.5 h-3.5 w-3.5" />
          Reject
        </Button>
      </div>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {action === "approve" ? "Approve" : "Reject"} Vacation Request
          </DialogTitle>
          <DialogDescription>
            {action === "approve"
              ? `Approve ${employeeName}'s vacation request?`
              : `Reject ${employeeName}'s vacation request? Consider adding a reason.`}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Textarea
            placeholder="Add a note (optional)..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
          />
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setDialogOpen(false)}
          >
            Cancel
          </Button>
          <Button
            onClick={handleAction}
            disabled={isApproving || isRejecting}
            variant={action === "approve" ? "default" : "destructive"}
          >
            {(isApproving || isRejecting) && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {action === "approve" ? "Approve" : "Reject"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
