"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Id } from "../../../convex/_generated/dataModel";

interface EmployeeFormProps {
  open: boolean;
  onClose: () => void;
  editEmployee?: {
    _id: Id<"users">;
    name: string;
    email: string;
    role: "admin" | "manager" | "employee" | "accounts";
    departmentId?: Id<"departments">;
    annualAllowance: number;
    joinDate?: string;
    basicSalary?: number;
    fixedAllowances?: number;
    carryForwardDays?: number;
  } | null;
}

export function EmployeeForm({ open, onClose, editEmployee }: EmployeeFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [name, setName] = useState(editEmployee?.name || "");
  const [email, setEmail] = useState(editEmployee?.email || "");
  const [role, setRole] = useState<string>(editEmployee?.role || "employee");
  const [departmentId, setDepartmentId] = useState(editEmployee?.departmentId || "");
  const [allowance, setAllowance] = useState(String(editEmployee?.annualAllowance || 30));
  const [joinDate, setJoinDate] = useState(editEmployee?.joinDate || "");
  const [basicSalary, setBasicSalary] = useState(String(editEmployee?.basicSalary || ""));
  const [fixedAllowances, setFixedAllowances] = useState(String(editEmployee?.fixedAllowances || ""));
  const [carryForward, setCarryForward] = useState(String(editEmployee?.carryForwardDays || 0));

  const departments = useQuery(api.departments.list);
  const createEmployee = useMutation(api.users.createEmployee);
  const updateEmployee = useMutation(api.users.updateEmployee);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (editEmployee) {
        await updateEmployee({
          id: editEmployee._id,
          name,
          role: role as "admin" | "manager" | "employee" | "accounts",
          departmentId: departmentId ? (departmentId as Id<"departments">) : undefined,
          annualAllowance: Number(allowance),
          joinDate: joinDate || undefined,
          basicSalary: basicSalary ? Number(basicSalary) : undefined,
          fixedAllowances: fixedAllowances ? Number(fixedAllowances) : undefined,
          carryForwardDays: Number(carryForward),
        });
        toast.success("Employee updated successfully");
      } else {
        await createEmployee({
          email,
          name,
          role: role as "admin" | "manager" | "employee" | "accounts",
          departmentId: departmentId ? (departmentId as Id<"departments">) : undefined,
          annualAllowance: Number(allowance),
          joinDate: joinDate || undefined,
          basicSalary: basicSalary ? Number(basicSalary) : undefined,
          fixedAllowances: fixedAllowances ? Number(fixedAllowances) : undefined,
        });
        toast.success("Employee created successfully");
      }
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Operation failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectClass = "flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring";

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editEmployee ? "Edit Employee" : "Add Employee"}</DialogTitle>
          <DialogDescription>
            UAE Labor Law: 30 calendar days annual leave after 1 year of service.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" required />
          </div>

          {!editEmployee && (
            <div className="space-y-2">
              <Label htmlFor="email">Email / Username</Label>
              <Input id="email" type="text" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email or username" required />
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Role</Label>
              <select className={selectClass} value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="employee">Employee</option>
                <option value="manager">Manager</option>
                <option value="accounts">Accounts</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>Department</Label>
              <select className={selectClass} value={departmentId} onChange={(e) => setDepartmentId(e.target.value)}>
                <option value="">Select...</option>
                {departments?.map((d) => (
                  <option key={d._id} value={d._id}>{d.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="joinDate">Join Date</Label>
              <Input id="joinDate" type="date" value={joinDate} onChange={(e) => setJoinDate(e.target.value)} />
              <p className="text-xs text-muted-foreground">For service length & entitlement calc</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="allowance">Annual Allowance (calendar days)</Label>
              <Input id="allowance" type="number" min="0" max="365" value={allowance} onChange={(e) => setAllowance(e.target.value)} required />
              <p className="text-xs text-muted-foreground">UAE: 30 days after 1yr, 2/month for 6-12mo</p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="basicSalary">Basic Salary (AED)</Label>
              <Input id="basicSalary" type="number" min="0" value={basicSalary} onChange={(e) => setBasicSalary(e.target.value)} placeholder="e.g. 5000" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fixedAllowances">Fixed Allowances (AED)</Label>
              <Input id="fixedAllowances" type="number" min="0" value={fixedAllowances} onChange={(e) => setFixedAllowances(e.target.value)} placeholder="Housing + Transport" />
            </div>
          </div>

          {editEmployee && (
            <div className="space-y-2">
              <Label htmlFor="carryForward">Carry-Forward Days (max 15)</Label>
              <Input id="carryForward" type="number" min="0" max="15" value={carryForward} onChange={(e) => setCarryForward(e.target.value)} />
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editEmployee ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
