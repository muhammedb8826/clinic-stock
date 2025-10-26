"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { medicineApi, Medicine } from "@/lib/api";
import { useNotificationStats } from "@/hooks/use-notifications";
import { notificationService } from "@/lib/notification-service";
import {
  LayoutDashboard,
  Pill,
  FolderOpen,
  Truck,
  Users,
  User,
  ShoppingCart,
  BarChart3,
  FileText,
  Package,
  Settings,
  Plus,
  List,
  Bell,
  RefreshCcw,
  AlertTriangle,
  PackageMinus,
  CalendarClock,
  CalendarX2,
  ExternalLink,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuth } from "@/contexts/auth-context";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
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


/* ------------------------- Breadcrumb config ------------------------- */

interface CrumbItem { label: string; href?: string; }

const routeLabels: Record<string, string> = {
  dashboard: "Dashboard",
  medicines: "Products",
  categories: "Categories",
  suppliers: "Suppliers",
  customers: "Customers",
  users: "Users",
  "purchase-orders": "Purchase Orders",
  sales: "Sales",
  reports: "Reports",
  inventory: "Inventory",
  adjustments: "Adjustments",
  account: "Account",
  create: "Create",
  list: "List",
};

const routeIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  dashboard: LayoutDashboard,
  medicines: Pill,
  categories: FolderOpen,
  suppliers: Truck,
  customers: Users,
  users: User,
  "purchase-orders": ShoppingCart,
  sales: BarChart3,
  reports: FileText,
  inventory: Package,
  adjustments: Settings,
  account: User,
  create: Plus,
  list: List,
};

const getRouteLabel = (segment: string, ctx: string[]) => {
  if (segment === "create" && ctx.includes("purchase-orders")) return "Create Order";
  if (segment === "list" && ctx.includes("sales")) return "Sales History";
  return routeLabels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
};

const getRouteIcon = (segment: string, ctx: string[]) => {
  if (segment === "create" && ctx.includes("purchase-orders")) return Plus;
  if (segment === "list" && ctx.includes("sales")) return List;
  return routeIcons[segment] || null;
};

/* ----------------------- Notification helpers ------------------------ */

const daysUntil = (iso?: string) => {
  if (!iso) return Infinity;
  const d = new Date(iso);
  if (isNaN(d.getTime())) return Infinity;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.ceil((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
};

export function AppBreadcrumb() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const router = useRouter();

  // Use real-time notification stats
  const { stats: realTimeStats } = useNotificationStats();

  // Local UI & data state
  const [meds, setMeds] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshedAt, setRefreshedAt] = useState<Date | null>(null);
  const [open, setOpen] = useState(false);

  // --------------------- Breadcrumb generation --------------------- //
  const generateBreadcrumbs = (): CrumbItem[] => {
    const segments = pathname.split("/").filter(Boolean);
    const crumbs: CrumbItem[] = [];

    if (pathname === "/login") return [];
    if (pathname === "/dashboard" || pathname === "/dashboard/") {
      return [{ label: "Dashboard" }];
    }

    if (segments.length > 0) {
      crumbs.push({ label: "Dashboard", href: "/dashboard" });
    }

    let currentPath = "";
    segments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      if (segment === "dashboard" && index === 0) return;

      const label = getRouteLabel(segment, segments);
      const isLast = index === segments.length - 1;
      crumbs.push({ label, href: isLast ? undefined : currentPath });
    });

    return crumbs;
  };

  const crumbs = generateBreadcrumbs();

  const load = async () => {
    setLoading(true);
    try {
      const res = await medicineApi.getAll({ page: 1, limit: 1000 });
      setMeds(res.medicines || []);
      setRefreshedAt(new Date());
    } catch (e) {
      console.error(e);
      toast.error("Failed to fetch notifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    load(); 
    
    // Initialize notification service connection
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
      const qty = m.quantity ?? 0;
      const d = daysUntil(m.expiryDate);

      if (qty <= 0) out.push(m);
      else if (qty > 0 && qty <= 10) low.push(m);

      if (d < 0) expired.push(m);
      else if (d <= 30) soon.push(m);
    });

    return { out, low, soon, expired };
  }, [meds]);

  // Use real-time stats if available, otherwise fall back to local calculation
  const totalCount = realTimeStats 
    ? realTimeStats.expired + realTimeStats.expiringSoon + realTimeStats.lowStock + realTimeStats.outOfStock
    : buckets.out.length + buckets.low.length + buckets.soon.length + buckets.expired.length;

  // ------------------------------ UI ---------------------------------- //
  const segs = pathname.split("/").filter(Boolean);
  
  if (pathname === "/login" || crumbs.length === 0) return null;

  return (
    <div className="mb-6 flex items-center justify-between gap-4">
      {/* Left: Breadcrumbs */}
      <Breadcrumb>
        <BreadcrumbList>
          {crumbs.map((item, index) => {
            const IconComponent = getRouteIcon(segs[index] || "", segs);
            return (
              <div key={index} className="flex items-center">
                <BreadcrumbItem>
                  {item.href ? (
                    <BreadcrumbLink asChild>
                      <Link href={item.href} className="flex items-center gap-2">
                        {IconComponent && <IconComponent className="h-4 w-4" />}
                        {item.label}
                      </Link>
                    </BreadcrumbLink>
                  ) : (
                    <BreadcrumbPage className="flex items-center gap-2">
                      {IconComponent && <IconComponent className="h-4 w-4" />}
                      {item.label}
                    </BreadcrumbPage>
                  )}
                </BreadcrumbItem>
                {index < crumbs.length - 1 && <BreadcrumbSeparator />}
              </div>
            );
          })}
        </BreadcrumbList>
      </Breadcrumb>

      {/* Right controls: Theme, Bell, Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* 1) Theme toggle (icon only) */}
        <ThemeToggle />

        {/* 2) Notification bell with red badge */}
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="relative h-9 w-9 border-emerald-200 hover:bg-emerald-50"
              aria-label="Notifications"
            >
              <Bell className="h-4 w-4 text-emerald-700" />
              <Badge
                className="absolute -right-1.5 -top-1.5 h-5 min-w-[20px] px-1 rounded-full bg-red-600 text-white"
                variant="default"
              >
                {totalCount}
              </Badge>
              {/* Real-time connection indicator */}
              {notificationService.isSocketConnected() && (
                <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-green-500 rounded-full border-2 border-white" />
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-96 p-0 overflow-hidden" align="end">
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
              <Section title="Out of Stock" count={buckets.out.length} icon={<PackageMinus className="h-4 w-4 text-red-600" />} emptyText="No items out of stock." items={buckets.out} />
              <Section title="Low Stock (≤ 10)" count={buckets.low.length} icon={<AlertTriangle className="h-4 w-4 text-amber-600" />} emptyText="No low stock items." items={buckets.low} />
              <Section title="Expiring Soon (≤ 30 days)" count={buckets.soon.length} icon={<CalendarClock className="h-4 w-4 text-amber-700" />} emptyText="No items expiring soon." items={buckets.soon} />
              <Section title="Expired" count={buckets.expired.length} icon={<CalendarX2 className="h-4 w-4 text-red-600" />} emptyText="No expired items." items={buckets.expired} />
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

        {/* 3) Profile dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" className="relative h-9 w-9 rounded-full">
              {(user as any)?.avatar ? (
                <Avatar className="h-8 w-8">
                  <AvatarImage src={(user as any).avatar} alt={user?.name} />
                  <AvatarFallback>{user?.name?.slice(0, 2)?.toUpperCase() || "US"}</AvatarFallback>
                </Avatar>
              ) : (
                <User className="h-5 w-5 text-gray-900" />
              )}
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="min-w-48 rounded-lg">
            <DropdownMenuLabel className="text-sm font-medium">{user?.name || "User"}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => router.push("/account")}>
                <User className="h-4 w-4 mr-2" />
                Account
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => { logout(); router.push("/login"); }}
              className="text-red-600 focus:text-red-700"
            >
              <ExternalLink className="h-4 w-4 mr-2 rotate-180" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

/* --------------------------- Small pieces ---------------------------- */

function ItemRow({ m }: { m: Medicine }) {
  const d = daysUntil(m.expiryDate);
  return (
    <div className="flex items-center justify-between gap-3 rounded-md border p-2">
      <div className="min-w-0">
        <div className="truncate text-sm font-medium">{m.name}</div>
        <div className="text-[11px] text-gray-500">
          {m.category?.name ? `${m.category.name} • ` : ""}
          Qty: <span className="font-medium">{m.quantity ?? 0}</span>
          {isFinite(d) && (
            <>
              {" "}
              • Exp:{" "}
              <span className={d < 0 ? "text-red-600" : d <= 30 ? "text-amber-700" : "text-gray-600"}>
                {new Date(m.expiryDate!).toLocaleDateString()}
              </span>
            </>
          )}
        </div>
      </div>
      <Link href="/medicines" className="shrink-0">
        <Button size="icon" variant="ghost" className="h-8 w-8" aria-label="Open">
          <ExternalLink className="h-4 w-4" />
        </Button>
      </Link>
    </div>
  );
}

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
  return (
    <div className="px-3 pb-3">
      <div className="mb-2 mt-1 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {icon}
          <div className="text-xs font-semibold">{title}</div>
        </div>
        <Badge variant="outline" className="text-xs">{count}</Badge>
      </div>
      {count === 0 ? (
        <div className="mb-2 rounded-md bg-gray-50 px-3 py-2 text-xs text-gray-500">{emptyText}</div>
      ) : (
        <div className="space-y-2">
          {items.slice(0, 6).map((m) => (
            <ItemRow key={m.id} m={m} />
          ))}
          {items.length > 6 && (
            <div className="text-right">
              <Link href="/medicines" className="text-xs text-emerald-700 hover:underline">
                View all {title.toLowerCase()}
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
