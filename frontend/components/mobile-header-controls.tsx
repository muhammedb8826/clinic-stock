"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import {
  Bell,
  RefreshCcw,
  AlertTriangle,
  PackageMinus,
  CalendarClock,
  CalendarX2,
  ExternalLink,
  User,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuth } from "@/contexts/auth-context";
import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
import { useNotificationStats } from "@/hooks/use-notifications";
import { notificationService } from "@/lib/notification-service";
import { medicineApi, Medicine } from "@/lib/api";
import Link from "next/link";

function Section({
  title,
  count,
  icon,
  emptyText,
  items,
}: {
  title: string;
  count: number;
  icon: React.ReactNode;
  emptyText: string;
  items: Medicine[];
}) {
  if (items.length === 0) {
    return (
      <div className="px-3 py-2 text-xs text-gray-500 border-b last:border-b-0">
        <div className="flex items-center gap-2">
          {icon}
          <span className="font-medium">{title}</span>
          <Badge variant="secondary" className="ml-auto text-xs">
            {count}
          </Badge>
        </div>
        <div className="mt-1 ml-6">{emptyText}</div>
      </div>
    );
  }

  return (
    <div className="border-b last:border-b-0">
      <div className="px-3 py-2 flex items-center gap-2">
        {icon}
        <span className="text-xs font-semibold">{title}</span>
        <Badge variant="secondary" className="ml-auto text-xs">
          {count}
        </Badge>
      </div>
      <div className="divide-y">
        {items.map((med) => (
          <Link
            key={med.id}
            href="/medicines"
            className="block px-3 py-2 hover:bg-gray-50 transition-colors"
          >
            <div className="font-medium text-sm">{med.name}</div>
            <div className="text-xs text-gray-500">
              Stock: {med.quantity || 0} units
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export function MobileHeaderControls() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const { stats: realTimeStats } = useNotificationStats();

  const [meds, setMeds] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshedAt, setRefreshedAt] = useState<Date | null>(null);
  const [open, setOpen] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const response = await medicineApi.getAll();
      setMeds(response.medicines || []);
      setRefreshedAt(new Date());
    } catch (error) {
      console.error("Failed to load medicines:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    if (!notificationService.isSocketConnected()) {
      notificationService.connect().catch(console.error);
    }
  }, []);

  const buckets = useMemo(() => {
    const out: Medicine[] = [];
    const low: Medicine[] = [];
    const soon: Medicine[] = [];
    const expired: Medicine[] = [];

    meds.forEach((m) => {
      const qty = m.quantity || 0;
      const exp = m.expiryDate ? new Date(m.expiryDate) : null;
      if (!exp) return;

      const d = Math.floor((exp.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

      if (qty === 0) out.push(m);
      else if (qty > 0 && qty <= 10) low.push(m);

      if (d < 0) expired.push(m);
      else if (d <= 30) soon.push(m);
    });

    return { out, low, soon, expired };
  }, [meds]);

  const totalCount = realTimeStats
    ? realTimeStats.expired + realTimeStats.expiringSoon + realTimeStats.lowStock + realTimeStats.outOfStock
    : buckets.out.length + buckets.low.length + buckets.soon.length + buckets.expired.length;

  return (
    <div className="flex items-center gap-1">
      {/* Theme toggle */}
      <ThemeToggle />

      {/* Notification bell */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="relative h-9 w-9"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
            <Badge
              className="absolute -right-1 -top-1 h-5 min-w-[18px] px-1 rounded-full bg-red-600 text-white text-xs"
              variant="default"
            >
              {totalCount}
            </Badge>
            {notificationService.isSocketConnected() && (
              <div className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 bg-green-500 rounded-full border border-white" />
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0 overflow-hidden" align="end">
          <div className="h-1 w-full bg-gradient-to-r from-emerald-400 via-blue-500 to-emerald-400" />
          <div className="p-3 flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold">Inventory Alerts</div>
              <div className="text-xs text-gray-500">
                {refreshedAt ? `Updated ${refreshedAt.toLocaleTimeString()}` : "—"}
                {notificationService.isSocketConnected() && (
                  <span className="ml-2 text-green-600">• Live</span>
                )}
              </div>
            </div>
            <Button size="sm" variant="outline" onClick={load} disabled={loading} className="h-8">
              <RefreshCcw className="h-3.5 w-3.5 mr-2" />
              {loading ? "Refreshing…" : "Refresh"}
            </Button>
          </div>

          <ScrollArea className="max-h-[360px]">
            <Section
              title="Out of Stock"
              count={buckets.out.length}
              icon={<PackageMinus className="h-4 w-4 text-red-600" />}
              emptyText="No items out of stock."
              items={buckets.out}
            />
            <Section
              title="Low Stock (≤ 10)"
              count={buckets.low.length}
              icon={<AlertTriangle className="h-4 w-4 text-amber-600" />}
              emptyText="No low stock items."
              items={buckets.low}
            />
            <Section
              title="Expiring Soon (≤ 30 days)"
              count={buckets.soon.length}
              icon={<CalendarClock className="h-4 w-4 text-amber-700" />}
              emptyText="No items expiring soon."
              items={buckets.soon}
            />
            <Section
              title="Expired"
              count={buckets.expired.length}
              icon={<CalendarX2 className="h-4 w-4 text-red-600" />}
              emptyText="No expired items."
              items={buckets.expired}
            />
          </ScrollArea>

          <div className="p-3 border-t flex items-center justify-between">
            <div className="text-xs text-gray-500">
              Total alerts: <span className="font-medium">{totalCount}</span>
            </div>
            <Link href="/medicines" onClick={() => setOpen(false)}>
              <Button size="sm" variant="ghost" className="text-emerald-700 hover:bg-emerald-50">
                Go to Medicines <ExternalLink className="h-3.5 w-3.5 ml-1.5" />
              </Button>
            </Link>
          </div>
        </PopoverContent>
      </Popover>

      {/* Profile dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="relative h-9 w-9 rounded-full">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-gradient-to-br from-emerald-400 to-blue-600 text-white text-sm font-medium">
                {user?.name?.charAt(0)?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="min-w-48 rounded-lg">
          <DropdownMenuLabel className="text-sm font-medium">
            {user?.name || "User"}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={() => router.push("/account")}>
              <User className="h-4 w-4 mr-2" />
              Account
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => {
              logout();
              router.push("/login");
            }}
            className="text-red-600 focus:text-red-700"
          >
            <ExternalLink className="h-4 w-4 mr-2 rotate-180" />
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

