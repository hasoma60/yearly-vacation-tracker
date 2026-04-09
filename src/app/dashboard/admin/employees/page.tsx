"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { EmployeeForm } from "@/components/admin/employee-form";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Plus, Pencil } from "lucide-react";
import { Id } from "../../../../../convex/_generated/dataModel";

export default function EmployeesPage() {
  const [formOpen, setFormOpen] = useState(false);
  const [editEmployee, setEditEmployee] = useState<any>(null);

  const employees = useQuery(api.users.listEmployees, { activeOnly: false });
  const deactivate = useMutation(api.users.deactivateEmployee);
  const reactivate = useMutation(api.users.reactivateEmployee);

  const handleToggleActive = async (id: Id<"users">, isActive: boolean) => {
    try {
      if (isActive) {
        await deactivate({ id });
        toast.success("Employee deactivated");
      } else {
        await reactivate({ id });
        toast.success("Employee reactivated");
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Action failed"
      );
    }
  };

  const roleColors: Record<string, string> = {
    admin: "bg-red-500/10 text-red-500 border-red-500/20",
    manager: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    employee: "bg-green-500/10 text-green-500 border-green-500/20",
    accounts: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Employees</h1>
          <p className="text-muted-foreground">Manage employee accounts and roles</p>
        </div>
        <Button
          onClick={() => {
            setEditEmployee(null);
            setFormOpen(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Employee
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {employees === undefined ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead className="text-center">Allowance</TableHead>
                  <TableHead className="text-center">Active</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employees.map((emp) => (
                  <TableRow key={emp._id} className={!emp.isActive ? "opacity-50" : ""}>
                    <TableCell className="font-medium">{emp.name}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {emp.email}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`capitalize ${roleColors[emp.role] || ""}`}
                      >
                        {emp.role}
                      </Badge>
                    </TableCell>
                    <TableCell>{emp.department?.name || "-"}</TableCell>
                    <TableCell className="text-center">
                      {emp.annualAllowance}
                    </TableCell>
                    <TableCell className="text-center">
                      <Switch
                        checked={emp.isActive}
                        onCheckedChange={() =>
                          handleToggleActive(emp._id, emp.isActive)
                        }
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setEditEmployee(emp);
                          setFormOpen(true);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <EmployeeForm
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditEmployee(null);
        }}
        editEmployee={editEmployee}
      />
    </div>
  );
}
