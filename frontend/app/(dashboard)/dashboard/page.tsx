"use client";

import { useEffect, useMemo, useState } from "react";
import { dashboardApi, DashboardStats, Sale } from "@/lib/api";
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
  ResponsiveContainer
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
  Download,
} from "lucide-react";
import { toast } from "sonner";

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [salesPage, setSalesPage] = useState(1);
  const [allSalesPage, setAllSalesPage] = useState(1);
  const itemsPerPage = 5;

  // Load stats
  const loadStats = async () => {
    try {
      const data = await dashboardApi.getStats();
      setStats(data);
    } catch (error) {
      console.error("Failed to load dashboard stats:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Helpers
  const formatPrice = (price: number | undefined | null) => {
    const n = typeof price === "number" && !Number.isNaN(price) ? price : 0;
    return new Intl.NumberFormat("en-ET", {
      style: "currency",
      currency: "ETB",
      maximumFractionDigits: 2,
    }).format(n);
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-ET");

  const getCurrentPageItems = <T,>(items: T[], page: number) => {
    const startIndex = (page - 1) * itemsPerPage;
    return items.slice(startIndex, startIndex + itemsPerPage);
  };

  const getTotalPages = (items: any[]) =>
    Math.ceil((items?.length ?? 0) / itemsPerPage);

  const mm = stats?.monthlySales ?? [];
  const monthChange = useMemo(() => {
    if (mm.length < 2) return null;
    const cur = Number(mm[mm.length - 1]?.sales ?? 0);
    const prev = Number(mm[mm.length - 2]?.sales ?? 0);
    if (prev === 0) return null;
    const pct = ((cur - prev) / prev) * 100;
    return Number.isFinite(pct) ? pct : null;
  }, [mm]);

  // Loading skeleton
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
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
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
          title="All Medicines"
          value={stats.totalMedicines ?? 0}
          subtitle="Total in inventory"
          icon={<Package className="h-5 w-5 text-emerald-600" />}
        />
        <KpiCard
          title="Low Stock"
          value={stats.lowStockCount ?? 0}
          subtitle="Below threshold"
          icon={<AlertTriangle className="h-5 w-5 text-amber-600" />}
          accent="amber"
        />
        <KpiCard
          title="Expired"
          value={stats.expiredCount ?? 0}
          subtitle="Need removal"
          icon={<ShieldAlert className="h-5 w-5 text-red-600" />}
          accent="red"
        />
        <KpiCard
          title="Sales This Month"
          value={stats.currentMonthSales?.count ?? 0}
          subtitle={`${formatPrice(stats.currentMonthSales?.amount)} total`}
          icon={<ShoppingBag className="h-5 w-5 text-blue-600" />}
          trend={monthChange}
        />
      </div>

      {/* Revenue Chart */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Revenue by Month</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => toast.info("Export coming soon")}
            >
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[320px]">
            {stats.monthlySales?.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <RBarChart data={stats.monthlySales} barSize={32}>
                  <defs>
                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" />{/* emerald-500 */}
                      <stop offset="100%" stopColor="#2563eb" />{/* blue-600 */}
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" tick={{ fill: "#6b7280", fontSize: 12 }} />
                  <YAxis tick={{ fill: "#6b7280", fontSize: 12 }} />
                  <Tooltip
                    formatter={(v: any) => formatPrice(Number(v))}
                    contentStyle={{ borderRadius: 12, borderColor: "#e5e7eb" }}
                  />
                  <Bar dataKey="sales" fill="url(#revGrad)" radius={[8, 8, 0, 0]} />
                </RBarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-gray-500">
                No sales data available for chart
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Totals Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <TotalCard
          title="Total Sales"
          value={stats.totalSales ?? 0}
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
              {(getCurrentPageItems(stats.topSellingMedicines || [], currentPage)).map((m) => (
                <TableRow key={m.id}>
                  <TableCell className="font-medium">{m.name}</TableCell>
                  <TableCell className="text-right">{m.quantitySold}</TableCell>
                  <TableCell className="text-right">{formatPrice(m.totalRevenue)}</TableCell>
                </TableRow>
              ))}
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

      {/* Current Month Sales */}
      <Card>
        <CardHeader>
          <CardTitle>Current Month Sales</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Sale #</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">Profit</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {getCurrentPageItems(stats.currentMonthSales?.sales || [], salesPage).map((sale: Sale) => (
                <TableRow key={sale.id}>
                  <TableCell className="font-medium">{sale.saleNumber}</TableCell>
                  <TableCell>{sale.customerName || "Walk-in"}</TableCell>
                  <TableCell>{formatDate(sale.saleDate)}</TableCell>
                  <TableCell className="text-right">{formatPrice(Number(sale.totalAmount))}</TableCell>
                  <TableCell className="text-right">
                    <ProfitBadge value={sale.calculatedProfit ?? 0} />
                  </TableCell>
                </TableRow>
              ))}
              {!stats.currentMonthSales?.sales?.length && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-gray-500">
                    No sales this month
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {getTotalPages(stats.currentMonthSales?.sales || []) > 1 && (
            <Pager
              page={salesPage}
              totalPages={getTotalPages(stats.currentMonthSales?.sales || [])}
              onPrev={() => setSalesPage((p) => Math.max(1, p - 1))}
              onNext={() =>
                setSalesPage((p) =>
                  Math.min(getTotalPages(stats.currentMonthSales?.sales || []), p + 1)
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
  accent?: "amber" | "red";
}) {
  const isUp = (trend ?? 0) >= 0;
  return (
    <Card className="overflow-hidden">
      {/* Gradient accent */}
      <div className="h-1 w-full bg-gradient-to-r from-emerald-400 via-blue-500 to-emerald-400" />
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <div
            className={`h-8 w-8 rounded-lg grid place-items-center ${
              accent === "amber"
                ? "bg-amber-50 text-amber-700"
                : accent === "red"
                ? "bg-red-50 text-red-700"
                : "bg-emerald-50 text-emerald-700"
            }`}
          >
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

function ProfitBadge({ value }: { value: number }) {
  const positive = value >= 0;
  return (
    <Badge
      variant={positive ? "default" : "destructive"}
      className={positive ? "bg-emerald-50 text-emerald-700 border-emerald-200" : ""}
    >
      {positive ? "+" : ""}
      {new Intl.NumberFormat("en-ET", {
        style: "currency",
        currency: "ETB",
        maximumFractionDigits: 2,
      }).format(value)}
    </Badge>
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
