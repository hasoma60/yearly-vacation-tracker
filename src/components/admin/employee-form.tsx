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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
  } | null;
}

export function EmployeeForm({ open, onClose, editEmployee }: EmployeeFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [name, setName] = useState(editEmployee?.name || "");
  const [email, setEmail] = useState(editEmployee?.email || "");
  const [role, setRole] = useState<string>(editEmployee?.role || "employee");
  const [departmentId, setDepartmentId] = useState<string>(
    editEmployee?.departmentId || ""
  );
  const [allowance, setAllowance] = useState(
    String(editEmployee?.annualAllowance || 20)
  );
  const [password, setPassword] = useState("");

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
          departmentId: departmentId
            ? (departmentId as Id<"departments">)
            : undefined,
          annualAllowance: Number(allowance),
        });
        toast.success("Employee updated successfully");
      } else {
        await createEmployee({
          email,
          name,
          role: role as "admin" | "manager" | "employee" | "accounts",
          departmentId: departmentId
            ? (departmentId as Id<"departments">)
            : undefined,
          annualAllowance: Number(allowance),
        });
        toast.success("Employee created successfully");
      }
      onClose();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Operation failed"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {editEmployee ? "Edit Employee" : "Add Employee"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              required
            />
          </div>

          {!editEmployee && (
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john@company.com"
                required
              />
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={role} onValueChange={(v) => setRole(v ?? "employee")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="employee">Employee</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="accounts">Accounts</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Department</Label>
              <Select value={departmentId} onValueChange={(v) => setDepartmentId(v ?? "")}>
                <SelectTrigger>
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  {departments?.map((d) => (
                    <SelectItem key={d._id} value={d._id}>
                      {d.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="allowance">Annual Allowance (days)</Label>
            <Input
              id="allowance"
              type="number"
              min="0"
              max="365"
              value={allowance}
              onChange={(e) => setAllowance(e.target.value)}
              required
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {editEmployee ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
