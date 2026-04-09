"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { cn } from "@/lib/utils";
import {
  Palmtree,
  LayoutDashboard,
  CalendarPlus,
  History,
  CheckSquare,
  Users,
  Building2,
  Wallet,
  BarChart3,
  Shield,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

const roleNavItems: Record<
  string,
  { label: string; href: string; icon: React.ElementType }[]
> = {
  employee: [
    { label: "My Vacations", href: "/dashboard/employee", icon: LayoutDashboard },
    { label: "New Request", href: "/dashboard/employee/request", icon: CalendarPlus },
    { label: "History", href: "/dashboard/employee/history", icon: History },
  ],
  manager: [
    { label: "Approvals", href: "/dashboard/manager", icon: CheckSquare },
    { label: "Team Timeline", href: "/dashboard/manager/team", icon: BarChart3 },
  ],
  admin: [
    { label: "Overview", href: "/dashboard/admin", icon: Shield },
    { label: "Employees", href: "/dashboard/admin/employees", icon: Users },
    { label: "Departments", href: "/dashboard/admin/departments", icon: Building2 },
  ],
  accounts: [
    { label: "Leave Salary", href: "/dashboard/accounts", icon: Wallet },
  ],
};

export function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();
  const profile = useQuery(api.users.getMyProfile);

  if (!profile) return null;

  const navSections: { title: string; items: typeof roleNavItems.employee }[] =
    [];

  // Everyone gets employee section
  navSections.push({ title: "My Vacations", items: roleNavItems.employee });

  if (profile.role === "manager" || profile.role === "admin") {
    navSections.push({ title: "Management", items: roleNavItems.manager });
  }

  if (profile.role === "admin") {
    navSections.push({ title: "Administration", items: roleNavItems.admin });
  }

  if (profile.role === "accounts" || profile.role === "admin") {
    navSections.push({ title: "Finance", items: roleNavItems.accounts });
  }

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-border bg-sidebar text-sidebar-foreground transition-transform duration-300 lg:static lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between px-4">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <Palmtree className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <p className="text-sm font-semibold leading-tight">Vacation</p>
              <p className="text-xs text-muted-foreground">Tracker 2026</p>
            </div>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <Separator />

        {/* Navigation */}
        <ScrollArea className="flex-1 px-3 py-4">
          <nav className="space-y-6">
            {navSections.map((section) => (
              <div key={section.title}>
                <p className="mb-2 px-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {section.title}
                </p>
                <div className="space-y-1">
                  {section.items.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={onClose}
                        className={cn(
                          "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                          isActive
                            ? "bg-sidebar-accent text-sidebar-accent-foreground"
                            : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                        )}
                      >
                        <item.icon className="h-4 w-4" />
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </ScrollArea>

        {/* User info footer */}
        <Separator />
        <div className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
              {profile.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{profile.name}</p>
              <p className="text-xs text-muted-foreground capitalize">
                {profile.role}
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
