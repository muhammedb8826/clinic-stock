"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { salesApi } from "@/lib/api";
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
import {
  Download,
  CalendarRange,
  TrendingUp,
  DollarSign,
  RefreshCcw,
} from "lucide-react";
import { toast } from "sonner";

type DailyItem = { day: string; total: string };
type WeeklyItem = { week: string; total: string };
type MonthlyItem = { month: string; total: string };
type NormItem = { label: string; total: number };

export default function ReportsPage() {
  const [loading, setLoading] = useState(false);
  const [reportType, setReportType] = useState<"daily" | "weekly" | "monthly">(
    "daily"
  );

  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    end: new Date().toISOString().split("T")[0],
  });
  const [year, setYear] = useState(new Date().getFullYear());

  const [dailySales, setDailySales] = useState<DailyItem[]>([]);
  const [weeklySales, setWeeklySales] = useState<WeeklyItem[]>([]);
  const [monthlySales, setMonthlySales] = useState<MonthlyItem[]>([]);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-ET", {
      style: "currency",
      currency: "ETB",
      maximumFractionDigits: 2,
    }).format(price || 0);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      if (reportType === "daily") {
        const res = await salesApi.reportDaily({
          start: dateRange.start,
          end: dateRange.end,
        });
        setDailySales(res);
      } else if (reportType === "weekly") {
        const res = await salesApi.reportWeekly({
          start: dateRange.start,
          end: dateRange.end,
        });
        setWeeklySales(res);
      } else {
        const res = await salesApi.reportMonthly({ year });
        setMonthlySales(res);
      }
    } catch (err) {
      console.error("Failed to load reports:", err);
      toast.error("Failed to load report data");
    } finally {
      setLoading(false);
    }
  }, [reportType, dateRange.start, dateRange.end, year]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  // Normalize data for chart + table
  const data: NormItem[] = useMemo(() => {
    if (reportType === "daily")
      return dailySales.map((d) => ({ label: d.day, total: parseFloat(d.total) || 0 }));
    if (reportType === "weekly")
      return weeklySales.map((w) => ({ label: w.week, total: parseFloat(w.total) || 0 }));
    return monthlySales.map((m) => ({ label: m.month, total: parseFloat(m.total) || 0 }));
  }, [reportType, dailySales, weeklySales, monthlySales]);

  const totals = useMemo(() => {
    const total = data.reduce((s, i) => s + (i.total || 0), 0);
    const avg = data.length ? total / data.length : 0;
    return { total, avg };
  }, [data]);

  const handleExport = () => {
    if (!data.length) {
      toast.info("No data to export");
      return;
    }
    const header =
      reportType === "daily" ? "Date" : reportType === "weekly" ? "Week" : "Month";
    const rows = [["Period", "Total (ETB)"], ...data.map((d) => [d.label, d.total.toString()])];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `milkii-${reportType}-report.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Report exported");
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport} disabled={!data.length}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          <Button variant="outline" onClick={fetchReports} disabled={loading}>
            <RefreshCcw className="mr-2 h-4 w-4" />
            {loading ? "Refreshing…" : "Refresh"}
          </Button>
        </div>
      </div>

      {/* Controls */}
      <Card className="overflow-hidden">
        <div className="h-1 w-full bg-gradient-to-r from-emerald-400 via-blue-500 to-emerald-400" />
        <CardHeader>
          <CardTitle className="flex items-center">
            <CalendarRange className="mr-2 h-5 w-5" />
            Report Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Type */}
            <div className="space-y-2">
              <Label htmlFor="reportType">Report Type</Label>
              <Select
                value={reportType}
                onValueChange={(v: "daily" | "weekly" | "monthly") => setReportType(v)}
              >
                <SelectTrigger id="reportType">
                  <SelectValue placeholder="Choose report type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily Sales</SelectItem>
                  <SelectItem value="weekly">Weekly Sales</SelectItem>
                  <SelectItem value="monthly">Monthly Sales</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Dates / Year */}
            {reportType === "monthly" ? (
              <div className="space-y-2">
                <Label htmlFor="year">Year</Label>
                <Select
                  value={year.toString()}
                  onValueChange={(v) => setYear(parseInt(v))}
                >
                  <SelectTrigger id="year">
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 6 }, (_, i) => new Date().getFullYear() - i).map(
                      (y) => (
                        <SelectItem key={y} value={y.toString()}>
                          {y}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={dateRange.start}
                    onChange={(e) =>
                      setDateRange((s) => ({ ...s, start: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={dateRange.end}
                    onChange={(e) =>
                      setDateRange((s) => ({ ...s, end: e.target.value }))
                    }
                  />
                </div>
              </>
            )}

            {/* Action */}
            <div className="flex items-end">
              <Button onClick={fetchReports} disabled={loading}>
                {loading ? "Loading…" : "Apply"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SummaryCard
          title="Total Sales"
          value={formatPrice(totals.total)}
          subtitle={
            reportType === "monthly" ? `Year ${year}` : "Selected date range"
          }
          icon={<DollarSign className="h-4 w-4 text-emerald-700" />}
        />
        <SummaryCard
          title="Average Sales"
          value={formatPrice(totals.avg)}
          subtitle={`Per ${
            reportType === "daily" ? "day" : reportType === "weekly" ? "week" : "month"
          }`}
          icon={<TrendingUp className="h-4 w-4 text-blue-700" />}
        />
        <SummaryCard
          title="Data Points"
          value={data.length.toString()}
          subtitle={`${reportType === "daily" ? "days" : reportType === "weekly" ? "weeks" : "months"} of data`}
          icon={<CalendarRange className="h-4 w-4 text-emerald-700" />}
        />
      </div>

      {/* Chart */}
      <Card>
        <CardHeader>
          <CardTitle>
            {reportType === "daily"
              ? "Daily Sales Trend"
              : reportType === "weekly"
              ? "Weekly Sales Trend"
              : "Monthly Sales Trend"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[380px]">
            {loading ? (
              <div className="flex h-full items-center justify-center text-gray-500">
                Loading chart…
              </div>
            ) : data.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
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
                  <Area
                    type="monotone"
                    dataKey="total"
                    stroke="#2563eb"
                    strokeWidth={2}
                    fill="url(#areaFill)"
                  />
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

      {/* Data Table */}
      <Card className="overflow-hidden">
        <div className="h-1 w-full bg-gradient-to-r from-emerald-400 via-blue-500 to-emerald-400" />
        <CardHeader>
          <CardTitle>
            {reportType === "daily"
              ? "Daily Sales Data"
              : reportType === "weekly"
              ? "Weekly Sales Data"
              : "Monthly Sales Data"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  {reportType === "daily"
                    ? "Date"
                    : reportType === "weekly"
                    ? "Week"
                    : "Month"}
                </TableHead>
                <TableHead className="text-right">Sales Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={2} className="py-8 text-center text-gray-500">
                    Loading data…
                  </TableCell>
                </TableRow>
              ) : data.length ? (
                data.map((row, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="font-medium">{row.label}</TableCell>
                    <TableCell className="text-right font-medium">
                      {formatPrice(row.total)}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={2} className="py-8 text-center text-gray-500">
                    No data available for the selected period
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

/* ---------- Small UI helpers ---------- */

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
