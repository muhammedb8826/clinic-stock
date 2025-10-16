"use client";

import { useEffect, useMemo, useState } from "react";
import { dashboardApi, DashboardStats } from "@/lib/api";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  BarChart as RBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend
} from "recharts";
import {
  Package,
  AlertTriangle,
  ShieldAlert,
  ShoppingBag,
  TrendingUp,
  TrendingDown,
  RefreshCcw,
  CalendarRange,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";
import { toast } from "sonner";

/* ----------------------- helpers ----------------------- */

const n = (v: any, d = 0) => {
  const num = Number(v);
  return Number.isFinite(num) ? num : d;
};

const formatPrice = (price: number | undefined | null) =>
  new Intl.NumberFormat("en-ET", {
    style: "currency",
    currency: "ETB",
    maximumFractionDigits: 2,
  }).format(n(price));

const getCategoryColor = (index: number) => {
  const colors = [
    "#10b981", // emerald-500
    "#2563eb", // blue-600
    "#f59e0b", // amber-500
    "#ef4444", // red-500
    "#8b5cf6", // violet-500
    "#06b6d4", // cyan-500
    "#f97316", // orange-500
    "#ec4899", // pink-500
  ];
  return colors[index % colors.length];
};

/** Normalize API payload so charts/cards never see null/strings */
function normalizeStats(raw: any): DashboardStats & {
  stockStatusOverview: { name: string; inStock: number; outOfStock: number; lowStock: number; expiringSoon: number };
  monthlySales: Array<{ month: string; sales: number }>;
  medicineByCategory: Array<{ name: string; count: number }>;
  topSellingMedicines: Array<{ id: number; name: string; quantitySold: number; totalRevenue: number }>;
  currentMonthSales?: { count: number; amount: number };
} {
  const inStockCount = n(raw?.inStockCount);
  const outOfStockCount = n(raw?.outOfStockCount);
  const lowStockCount = n(raw?.lowStockCount);
  const expiringSoonCount = n(raw?.expiringSoonCount);

  const stockStatusOverview = raw?.stockStatusOverview ?? {
    name: "Stock",
    inStock: inStockCount,
    outOfStock: outOfStockCount,
    lowStock: lowStockCount,
    expiringSoon: expiringSoonCount,
  };

  const monthlySales = Array.isArray(raw?.monthlySales)
    ? raw.monthlySales.map((m: any) => ({
        month: String(m?.month ?? ""),
        sales: n(m?.sales ?? m?.amount),
      }))
    : [];

  const medicineByCategory = Array.isArray(raw?.medicineByCategory)
    ? raw.medicineByCategory.map((c: any) => ({
        name: String(c?.name ?? c?.category ?? "—"),
        count: n(c?.count),
      }))
    : [];

  const topSellingMedicines = Array.isArray(raw?.topSellingMedicines)
    ? raw.topSellingMedicines.map((t: any) => ({
        id: n(t?.id),
        name: String(t?.name ?? "—"),
        quantitySold: n(t?.quantitySold ?? t?.qty),
        totalRevenue: n(t?.totalRevenue ?? t?.revenue),
      }))
    : [];

  const currentMonthSales = raw?.currentMonthSales
    ? { count: n(raw.currentMonthSales.count), amount: n(raw.currentMonthSales.amount) }
    : undefined;

  return {
    ...raw,
    inStockCount,
    outOfStockCount,
    lowStockCount,
    expiringSoonCount,
    stockStatusOverview,
    monthlySales,
    medicineByCategory,
    topSellingMedicines,
    totalMedicines: n(raw?.totalMedicines),
    totalSales: n(raw?.totalSales),
    totalSalesAmount: n(raw?.totalSalesAmount),
    currentMonthProfit: n(raw?.currentMonthProfit),
    totalProfit: n(raw?.totalProfit),
    currentMonthSales,
  };
}

/* ----------------------- page ----------------------- */

export default function DashboardPage() {
  const [stats, setStats] = useState<ReturnType<typeof normalizeStats> | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const loadStats = async () => {
    setLoading(true);
    try {
      const data = await dashboardApi.getStats();
      setStats(normalizeStats(data));
    } catch (error) {
      console.error("Failed to load dashboard stats:", error);
      toast.error("Failed to load dashboard data");
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const monthChange = useMemo(() => {
    const mm = stats?.monthlySales ?? [];
    if (mm.length < 2) return null;
    const cur = n(mm[mm.length - 1]?.sales);
    const prev = n(mm[mm.length - 2]?.sales);
    if (prev === 0) return null;
    const pct = ((cur - prev) / prev) * 100;
    return Number.isFinite(pct) ? pct : null;
  }, [stats?.monthlySales]);

  const getCurrentPageItems = <T,>(items: T[], page: number) => {
    const startIndex = (page - 1) * itemsPerPage;
    return items.slice(startIndex, startIndex + itemsPerPage);
  };

  const getTotalPages = (items: any[]) => Math.ceil((items?.length ?? 0) / itemsPerPage);

  /* ----------------------- render ----------------------- */

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-gray-100 rounded animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <div className="h-1 w-full bg-gradient-to-r from-emerald-400 via-blue-500 to-emerald-400" />
              <CardHeader className="animate-pulse">
                <div className="h-4 w-24 bg-gray-100 rounded mb-2" />
                <div className="h-6 w-16 bg-gray-100 rounded" />
              </CardHeader>
              <CardContent className="animate-pulse">
                <div className="h-4 w-32 bg-gray-100 rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card className="h-[340px] animate-pulse" />
        <Card className="h-[340px] animate-pulse" />
        <Card className="h-[340px] animate-pulse" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-8 text-gray-500">
        Failed to load dashboard data
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pharmacy Dashboard</h1>
          <p className="text-sm text-gray-500">
            Last updated: {new Date().toLocaleString("en-ET")}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <CalendarRange className="h-4 w-4 mr-2" />
            Last 12 months
          </Button>
          <Button variant="outline" size="sm" onClick={loadStats}>
            <RefreshCcw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="All Products"
          value={stats.totalMedicines}
          subtitle="Total in inventory"
          icon={<Package className="h-5 w-5 text-emerald-600" />}
        />
        <KpiCard
          title="In Stock"
          value={stats.inStockCount}
          subtitle="Available products"
          icon={<CheckCircle className="h-5 w-5 text-green-600" />}
          accent="green"
        />
        <KpiCard
          title="Out of Stock"
          value={stats.outOfStockCount}
          subtitle="Zero quantity"
          icon={<XCircle className="h-5 w-5 text-red-600" />}
          accent="red"
        />
        <KpiCard
          title="Low Stock"
          value={stats.lowStockCount}
          subtitle="Below threshold"
          icon={<AlertTriangle className="h-5 w-5 text-amber-600" />}
          accent="amber"
        />
        <KpiCard
          title="Expired"
          value={stats.expiredCount}
          subtitle="Need removal"
          icon={<ShieldAlert className="h-5 w-5 text-red-600" />}
          accent="red"
        />
        <KpiCard
          title="Expire Soon"
          value={stats.expiringSoonCount}
          subtitle="Within 6 months"
          icon={<Clock className="h-5 w-5 text-orange-600" />}
          accent="orange"
        />
        <KpiCard
          title="Sales This Month"
          value={stats.currentMonthSales?.count ?? 0}
          subtitle={`${formatPrice(stats.currentMonthSales?.amount)} total`}
          icon={<ShoppingBag className="h-5 w-5 text-blue-600" />}
          trend={monthChange}
        />
        <TotalCard
          title="Total Sales"
          value={stats.totalSales}
          sub={`${formatPrice(stats.totalSalesAmount)}`}
        />
        <TotalCard
          title="Profit This Month"
          value={formatPrice(stats.currentMonthProfit)}
          positive
        />
        <TotalCard
          title="Total Profit"
          value={formatPrice(stats.totalProfit)}
          positive
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Medicine by Category Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Medicine by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[320px]">
              {stats.medicineByCategory.length ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.medicineByCategory}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) =>
                        `${name} ${(percent * 100).toFixed(0)}%`
                      }
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {stats.medicineByCategory.map((_: any, i: number) => (
                        <Cell key={i} fill={getCategoryColor(i)} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-gray-500">
                  No category data available
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Monthly Sales Trend Line Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Sales Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[320px]">
              {stats.monthlySales.length ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={stats.monthlySales}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="month" tick={{ fill: "#6b7280", fontSize: 12 }} />
                    <YAxis tick={{ fill: "#6b7280", fontSize: 12 }} />
                    <Tooltip
                      formatter={(v: any) => formatPrice(Number(v))}
                      contentStyle={{ borderRadius: 12, borderColor: "#e5e7eb" }}
                    />
                    <Line
                      type="monotone"
                      dataKey="sales"
                      stroke="#10b981"
                      strokeWidth={3}
                      dot={{ fill: "#10b981", strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-gray-500">
                  No sales trend data available
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stock Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Stock Status Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[320px]">
            {stats.stockStatusOverview ? (
              <ResponsiveContainer width="100%" height="100%">
                <RBarChart data={[stats.stockStatusOverview]} barSize={60}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" tick={{ fill: "#6b7280", fontSize: 12 }} />
                  <YAxis tick={{ fill: "#6b7280", fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="inStock" fill="#10b981" name="In Stock" />
                  <Bar dataKey="outOfStock" fill="#ef4444" name="Out of Stock" />
                  <Bar dataKey="lowStock" fill="#f59e0b" name="Low Stock" />
                  <Bar dataKey="expiringSoon" fill="#f97316" name="Expiring Soon" />
                </RBarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-gray-500">
                No stock status data available
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Top Selling */}
      <Card>
        <CardHeader>
          <CardTitle>Top Selling Products</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Medicine</TableHead>
                <TableHead className="text-right">Qty Sold</TableHead>
                <TableHead className="text-right">Revenue</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {getCurrentPageItems(stats.topSellingMedicines || [], currentPage).map(
                (m) => (
                  <TableRow key={m.id}>
                    <TableCell className="font-medium">{m.name}</TableCell>
                    <TableCell className="text-right">{m.quantitySold}</TableCell>
                    <TableCell className="text-right">
                      {formatPrice(m.totalRevenue)}
                    </TableCell>
                  </TableRow>
                )
              )}
              {!stats.topSellingMedicines?.length && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-gray-500">
                    No top sellers found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {getTotalPages(stats.topSellingMedicines || []) > 1 && (
            <Pager
              page={currentPage}
              totalPages={getTotalPages(stats.topSellingMedicines || [])}
              onPrev={() => setCurrentPage((p) => Math.max(1, p - 1))}
              onNext={() =>
                setCurrentPage((p) =>
                  Math.min(getTotalPages(stats.topSellingMedicines || []), p + 1)
                )
              }
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

/* ======== Components ======== */

function KpiCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  accent,
}: {
  title: string;
  value: number | string;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: number | null;
  accent?: "amber" | "red" | "green" | "orange" | "purple";
}) {
  const isUp = (trend ?? 0) >= 0;

  const getAccentStyles = (accent?: string) => {
    switch (accent) {
      case "amber":
        return "bg-amber-50 text-amber-700";
      case "red":
        return "bg-red-50 text-red-700";
      case "green":
        return "bg-green-50 text-green-700";
      case "orange":
        return "bg-orange-50 text-orange-700";
      case "purple":
        return "bg-purple-50 text-purple-700";
      default:
        return "bg-emerald-50 text-emerald-700";
    }
  };

  return (
    <Card className="overflow-hidden">
      <div className="h-1 w-full bg-gradient-to-r from-emerald-400 via-blue-500 to-emerald-400" />
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <div className={`h-8 w-8 rounded-lg grid place-items-center ${getAccentStyles(accent)}`}>
            {icon}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
        {typeof trend === "number" && (
          <div className="mt-2 inline-flex items-center gap-1 text-xs">
            {isUp ? (
              <TrendingUp className="h-3.5 w-3.5 text-emerald-600" />
            ) : (
              <TrendingDown className="h-3.5 w-3.5 text-red-600" />
            )}
            <span className={isUp ? "text-emerald-700" : "text-red-700"}>
              {isUp ? "+" : ""}
              {Math.abs(trend).toFixed(1)}% vs prev. month
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function TotalCard({
  title,
  value,
  sub,
  positive,
}: {
  title: string;
  value: number | string;
  sub?: string;
  positive?: boolean;
}) {
  return (
    <Card className="overflow-hidden">
      <div className="h-1 w-full bg-gradient-to-r from-emerald-400 via-blue-500 to-emerald-400" />
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${positive ? "text-emerald-700" : ""}`}>
          {value}
        </div>
        {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
      </CardContent>
    </Card>
  );
}

function Pager({
  page,
  totalPages,
  onPrev,
  onNext,
}: {
  page: number;
  totalPages: number;
  onPrev: () => void;
  onNext: () => void;
}) {
  return (
    <div className="mt-4 flex items-center justify-between">
      <Button variant="outline" size="sm" onClick={onPrev} disabled={page === 1}>
        <ChevronLeft className="h-4 w-4 mr-1" />
        Previous
      </Button>
      <span className="text-sm text-gray-600">
        Page <span className="font-medium text-gray-800">{page}</span> of{" "}
        <span className="font-medium text-gray-800">{totalPages}</span>
      </span>
      <Button
        variant="outline"
        size="sm"
        onClick={onNext}
        disabled={page === totalPages}
      >
        Next
        <ChevronRight className="h-4 w-4 ml-1" />
      </Button>
    </div>
  );
}
