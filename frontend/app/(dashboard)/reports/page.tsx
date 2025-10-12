"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { salesApi, medicineApi, Medicine, Sale } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { Download, CalendarRange, TrendingUp, DollarSign, RefreshCcw, Filter } from "lucide-react";
import { toast } from "sonner";

/* ----------------------------- Types ----------------------------- */

type QuickRange =
  | "today"
  | "yesterday"
  | "thisWeek"
  | "lastWeek"
  | "thisMonth"
  | "thisYear"
  | "custom";

type ChartPoint = { label: string; total: number };

type ProductRow = {
  medicineId: number;
  name: string;
  qty: number;
  revenue: number;
  profit: number;
};

/* ----------------------------- Helpers --------------------------- */

const formatPrice = (price: number) =>
  new Intl.NumberFormat("en-ET", {
    style: "currency",
    currency: "ETB",
    maximumFractionDigits: 2,
  }).format(price || 0);

const parseISO = (s?: string) => (s ? new Date(s) : null);

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const endOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);

const startOfWeek = (d: Date) => {
  const day = d.getDay(); // 0 = Sun
  const diff = (day + 6) % 7; // make Monday=0
  const s = new Date(d);
  s.setDate(d.getDate() - diff);
  return startOfDay(s);
};
const endOfWeek = (d: Date) => {
  const s = startOfWeek(d);
  const e = new Date(s);
  e.setDate(s.getDate() + 6);
  return endOfDay(e);
};

const startOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1);
const endOfMonth = (d: Date) => endOfDay(new Date(d.getFullYear(), d.getMonth() + 1, 0));
const startOfYear = (d: Date) => new Date(d.getFullYear(), 0, 1);
const endOfYear = (d: Date) => endOfDay(new Date(d.getFullYear(), 12, 0));

const fmtDay = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const weekLabel = (d: Date) => {
  const s = startOfWeek(d);
  const e = endOfWeek(d);
  return `${fmtDay(s)} → ${fmtDay(e)}`;
};
const monthLabel = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;

const daysBetween = (a: Date, b: Date) => Math.ceil((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));

/* Auto granularity (UI-removed): <=31 days -> daily, <=180 -> weekly, else monthly */
type Granularity = "daily" | "weekly" | "monthly";
const autoGranularity = (startISO: string, endISO: string): Granularity => {
  const s = new Date(startISO + "T00:00:00");
  const e = new Date(endISO + "T23:59:59");
  const d = daysBetween(s, e);
  if (d <= 31) return "daily";
  if (d <= 180) return "weekly";
  return "monthly";
};

/* ----------------------------- Component ------------------------- */

export default function ReportsPage() {
  const [loading, setLoading] = useState(false);

  // data
  const [allSales, setAllSales] = useState<Sale[]>([]);
  const [meds, setMeds] = useState<Medicine[]>([]);

  // controls
  const [quickRange, setQuickRange] = useState<QuickRange>("thisMonth");
  const [dateRange, setDateRange] = useState({
    start: fmtDay(startOfMonth(new Date())),
    end: fmtDay(new Date()),
  });

  // load once; we filter client-side
  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [sales, medsRes] = await Promise.all([
        salesApi.list(),
        medicineApi.getAll({ page: 1, limit: 1000 }),
      ]);
      setAllSales(sales || []);
      setMeds(medsRes.medicines || []);
    } catch (e) {
      console.error(e);
      toast.error("Failed to load report data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  /* ---------- Quick range -> update dateRange ---------- */

  useEffect(() => {
    if (quickRange === "custom") return;
    const now = new Date();
    let s = startOfDay(now);
    let e = endOfDay(now);

    switch (quickRange) {
      case "today":
        break;
      case "yesterday": {
        const y = new Date(now);
        y.setDate(now.getDate() - 1);
        s = startOfDay(y);
        e = endOfDay(y);
        break;
      }
      case "thisWeek":
        s = startOfWeek(now);
        e = endOfWeek(now);
        break;
      case "lastWeek": {
        const last = new Date(now);
        last.setDate(now.getDate() - 7);
        s = startOfWeek(last);
        e = endOfWeek(last);
        break;
      }
      case "thisMonth":
        s = startOfMonth(now);
        e = endOfMonth(now);
        break;
      case "thisYear":
        s = startOfYear(now);
        e = endOfYear(now);
        break;
    }

    setDateRange({ start: fmtDay(s), end: fmtDay(e) });
  }, [quickRange]);

  /* ---------- Filtered sales in range ---------- */

  const filteredSales = useMemo(() => {
    const s = new Date(dateRange.start + "T00:00:00");
    const e = new Date(dateRange.end + "T23:59:59");
    return (allSales || []).filter((sa) => {
      const d = parseISO(sa.saleDate);
      return d && d >= s && d <= e;
    });
  }, [allSales, dateRange.start, dateRange.end]);

  /* ---------- KPIs: revenue, units sold, profit ---------- */

  const { revenueTotal, itemsSold, profitTotal } = useMemo(() => {
    let revenue = 0;
    let qty = 0;
    let profit = 0;

    for (const s of filteredSales) {
      revenue += Number(s.totalAmount) || 0;

      for (const it of s.items || []) qty += it.quantity || 0;

      if (typeof s.calculatedProfit === "number") {
        profit += s.calculatedProfit;
      } else {
        for (const it of s.items || []) {
          const med = meds.find((m) => m.id === it.medicineId);
          const cost = Number(med?.costPrice) || 0;
          const unit = Number(it.unitPrice) || 0;
          profit += (unit - cost) * (it.quantity || 0);
        }
      }
    }

    return { revenueTotal: revenue, itemsSold: qty, profitTotal: profit };
  }, [filteredSales, meds]);

  /* ---------- Chart data (auto granularity) ---------- */

  const granularity = autoGranularity(dateRange.start, dateRange.end);

  const chartData: ChartPoint[] = useMemo(() => {
    const map = new Map<string, number>();

    for (const s of filteredSales) {
      const d = parseISO(s.saleDate)!;
      let label = fmtDay(d);
      if (granularity === "weekly") label = weekLabel(d);
      if (granularity === "monthly") label = monthLabel(d);
      map.set(label, (map.get(label) || 0) + (Number(s.totalAmount) || 0));
    }

    const points = Array.from(map.entries()).map(([label, total]) => ({ label, total }));
    points.sort((a, b) => (a.label < b.label ? -1 : a.label > b.label ? 1 : 0));
    return points;
  }, [filteredSales, granularity]);

  /* ---------- Products table (aggregated) ---------- */

  const productRows: ProductRow[] = useMemo(() => {
    const agg = new Map<number, ProductRow>();

    for (const s of filteredSales) {
      for (const it of s.items || []) {
        const med = meds.find((m) => m.id === it.medicineId);
        const name = med?.name || `#${it.medicineId}`;
        const cost = Number(med?.costPrice) || 0;
        const unit = Number(it.unitPrice) || 0;
        const qty = it.quantity || 0;
        const revenue = unit * qty;
        const profit = (unit - cost) * qty;

        const cur = agg.get(it.medicineId) || {
          medicineId: it.medicineId,
          name,
          qty: 0,
          revenue: 0,
          profit: 0,
        };
        cur.qty += qty;
        cur.revenue += revenue;
        cur.profit += profit;
        agg.set(it.medicineId, cur);
      }
    }

    const rows = Array.from(agg.values());
    rows.sort((a, b) => b.qty - a.qty);
    return rows;
  }, [filteredSales, meds]);

  /* ---------- Export CSV (products table) ---------- */

  const exportProductsCSV = () => {
    if (!productRows.length) {
      toast.info("No data to export");
      return;
    }
    const rows = [
      ["Product", "Quantity", "Revenue(ETB)", "Profit(ETB)"],
      ...productRows.map((r) => [
        r.name.replaceAll(",", " "),
        String(r.qty),
        r.revenue.toFixed(2),
        r.profit.toFixed(2),
      ]),
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "milkii-sales-products.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Exported CSV");
  };

  /* ------------------------------- UI ------------------------------ */

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Sales Reports</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportProductsCSV} disabled={!productRows.length}>
            <Download className="mr-2 h-4 w-4" />
            Export Products CSV
          </Button>
          <Button variant="outline" onClick={loadAll} disabled={loading}>
            <RefreshCcw className="mr-2 h-4 w-4" />
            {loading ? "Refreshing…" : "Refresh"}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="overflow-hidden">
        <div className="h-1 w-full bg-gradient-to-r from-emerald-400 via-blue-500 to-emerald-400" />
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="mr-2 h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-12">
            {/* Quick range (dropdown) */}
            <div className="md:col-span-4">
              <Label>Quick Range</Label>
              <Select value={quickRange} onValueChange={(v: QuickRange) => setQuickRange(v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="yesterday">Yesterday</SelectItem>
                  <SelectItem value="thisWeek">This Week</SelectItem>
                  <SelectItem value="lastWeek">Last Week</SelectItem>
                  <SelectItem value="thisMonth">This Month</SelectItem>
                  <SelectItem value="thisYear">This Year</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Custom dates (only when custom) */}
            <div className="md:col-span-4 grid grid-cols-2 gap-3 items-end">
              <div className="space-y-1">
                <Label htmlFor="startDate">Start</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={dateRange.start}
                  disabled={quickRange !== "custom"}
                  onChange={(e) => setDateRange((s) => ({ ...s, start: e.target.value }))}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="endDate">End</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={dateRange.end}
                  disabled={quickRange !== "custom"}
                  onChange={(e) => setDateRange((s) => ({ ...s, end: e.target.value }))}
                />
              </div>
            </div>

            {/* Period display */}
            <div className="md:col-span-4 flex items-end">
              <div className="w-full rounded-md border px-3 py-2 text-sm text-muted-foreground">
                <span className="font-medium text-gray-700">Period:</span>{" "}
                {dateRange.start} → {dateRange.end}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPI cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SummaryCard
          title="Total Sales"
          value={formatPrice(revenueTotal)}
          subtitle={`${dateRange.start} → ${dateRange.end}`}
          icon={<DollarSign className="h-4 w-4 text-emerald-700" />}
        />
        <SummaryCard
          title="Items Sold"
          value={`${itemsSold.toLocaleString()} units`}
          subtitle="Total products sold in the period"
          icon={<TrendingUp className="h-4 w-4 text-blue-700" />}
        />
        <SummaryCard
          title="Profit"
          value={formatPrice(profitTotal)}
          subtitle="Profit for the selected period"
          icon={<CalendarRange className="h-4 w-4 text-emerald-700" />}
        />
      </div>

      {/* Chart */}
      <Card>
        <CardHeader>
          <CardTitle>
            {granularity === "daily"
              ? "Daily Revenue"
              : granularity === "weekly"
              ? "Weekly Revenue"
              : "Monthly Revenue"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[380px]">
            {loading ? (
              <div className="flex h-full items-center justify-center text-gray-500">
                Loading chart…
              </div>
            ) : chartData.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity={0.45} />
                      <stop offset="100%" stopColor="#2563eb" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="label" tick={{ fill: "#6b7280", fontSize: 12 }} />
                  <YAxis
                    tick={{ fill: "#6b7280", fontSize: 12 }}
                    tickFormatter={(v) => formatPrice(Number(v))}
                  />
                  <Tooltip
                    formatter={(v: any) => formatPrice(Number(v))}
                    labelClassName="text-gray-700"
                    contentStyle={{ borderRadius: 12, borderColor: "#e5e7eb" }}
                  />
                  <Area type="monotone" dataKey="total" stroke="#2563eb" strokeWidth={2} fill="url(#areaFill)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-gray-500">
                No data available for the selected period
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Products table */}
      <Card className="overflow-hidden">
        <div className="h-1 w-full bg-gradient-to-r from-emerald-400 via-blue-500 to-emerald-400" />
        <CardHeader>
          <CardTitle>Products Sold ({dateRange.start} → {dateRange.end})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead className="text-right">Qty</TableHead>
                <TableHead className="text-right">Revenue</TableHead>
                <TableHead className="text-right">Profit</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="py-8 text-center text-gray-500">
                    Loading data…
                  </TableCell>
                </TableRow>
              ) : productRows.length ? (
                productRows.map((r) => (
                  <TableRow key={r.medicineId}>
                    <TableCell className="font-medium">{r.name}</TableCell>
                    <TableCell className="text-right">{r.qty.toLocaleString()}</TableCell>
                    <TableCell className="text-right">{formatPrice(r.revenue)}</TableCell>
                    <TableCell className="text-right text-emerald-700">
                      {formatPrice(r.profit)}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="py-8 text-center text-gray-500">
                    No products sold in this period
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

/* ----------------------- Small UI helper ----------------------- */

function SummaryCard({
  title,
  value,
  subtitle,
  icon,
}: {
  title: string;
  value: string;
  subtitle?: string;
  icon?: React.ReactNode;
}) {
  return (
    <Card className="overflow-hidden">
      <div className="h-1 w-full bg-gradient-to-r from-emerald-400 via-blue-500 to-emerald-400" />
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <div className="h-8 w-8 rounded-lg grid place-items-center bg-emerald-50 text-emerald-700">
            {icon}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
      </CardContent>
    </Card>
  );
}
