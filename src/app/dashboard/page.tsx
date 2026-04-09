"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { redirect } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function DashboardPage() {
  const profile = useQuery(api.users.getMyProfile);

  if (profile === undefined) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Redirect based on role
  switch (profile.role) {
    case "admin":
      redirect("/dashboard/admin");
    case "manager":
      redirect("/dashboard/manager");
    case "accounts":
      redirect("/dashboard/accounts");
    default:
      redirect("/dashboard/employee");
  }
}
