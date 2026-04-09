"use client";

import { VacationRequestForm } from "@/components/vacation/request-form";
import { BalanceCard } from "@/components/vacation/balance-card";

export default function NewRequestPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">New Vacation Request</h1>
        <p className="text-muted-foreground">
          Submit a new vacation request for approval
        </p>
      </div>

      <BalanceCard />
      <VacationRequestForm />
    </div>
  );
}
