"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";

import { salesApi, Sale, medicineApi, Medicine } from "@/lib/api";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import {
  Search,
  Eye,
  Download,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

/* NEW: shadcn select for Range & Payment */
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

/* ------------------------- Utils ------------------------- */

const formatETB = (price: number) =>
  new Intl.NumberFormat("en-ET", { style: "currency", currency: "ETB" }).format(
    Number(price) || 0
  );

const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString("en-ET");

/* time helpers (local time; week = Mon–Sun) */
const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
const endOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);

const startOfWeek = (d: Date) => {
  const day = d.getDay(); // 0 Sun ... 6 Sat
  const diff = (day === 0 ? -6 : 1) - day; // move to Monday
  const s = new Date(d);
  s.setDate(d.getDate() + diff);
  return startOfDay(s);
};
const endOfWeek = (d: Date) => {
  const s = startOfWeek(d);
  const e = new Date(s);
  e.setDate(s.getDate() + 6);
  return endOfDay(e);
};
const startOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0, 0);
const endOfMonth = (d: Date) => endOfDay(new Date(d.getFullYear(), d.getMonth() + 1, 0));
const startOfYear = (d: Date) => new Date(d.getFullYear(), 0, 1, 0, 0, 0, 0);
const endOfYear = (d: Date) => endOfDay(new Date(d.getFullYear(), 11, 31));

type RangeKey =
  | "all"
  | "today"
  | "yesterday"
  | "this_week"
  | "last_week"
  | "this_month"
  | "this_year"
  | "custom";

function getRangeDates(range: RangeKey, customStart?: string, customEnd?: string) {
  const now = new Date();
  switch (range) {
    case "today": {
      const s = startOfDay(now);
      const e = endOfDay(now);
      return { s, e };
    }
    case "yesterday": {
      const y = new Date(now);
      y.setDate(now.getDate() - 1);
      return { s: startOfDay(y), e: endOfDay(y) };
    }
    case "this_week": {
      return { s: startOfWeek(now), e: endOfWeek(now) };
    }
    case "last_week": {
      const lastWeekAnchor = new Date(now);
      lastWeekAnchor.setDate(now.getDate() - 7);
      return { s: startOfWeek(lastWeekAnchor), e: endOfWeek(lastWeekAnchor) };
    }
    case "this_month": {
      return { s: startOfMonth(now), e: endOfMonth(now) };
    }
    case "this_year": {
      return { s: startOfYear(now), e: endOfYear(now) };
    }
    case "custom": {
      if (!customStart && !customEnd) return { s: undefined, e: undefined };
      const s = customStart ? startOfDay(new Date(customStart)) : undefined;
      const e = customEnd ? endOfDay(new Date(customEnd)) : undefined;
      return { s, e };
    }
    default:
      return { s: undefined, e: undefined };
  }
}

/* ------------------------- Page ------------------------- */

export default function SalesListPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  /* NEW: filter state */
  const [range, setRange] = useState<RangeKey>("all");
  const [customStart, setCustomStart] = useState<string>("");
  const [customEnd, setCustomEnd] = useState<string>("");
  const [paymentFilter, setPaymentFilter] = useState<"all" | "cash" | "telebirr" | "mobile">("all");

  useEffect(() => {
    (async () => {
      try {
        const [allSales, meds] = await Promise.all([
          salesApi.list(),
          medicineApi.getAll({ page: 1, limit: 1000 }),
        ]);
        setSales(allSales || []);
        setMedicines(meds.medicines || []);
      } catch (e) {
        console.error("Failed to load data:", e);
        toast.error("Failed to load data");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* utility */
  const paymentText = (sale: Sale) =>
    (sale as any).paymentMethod || (sale as any).payment || "cash";

  const normalizePayment = (val: string) => {
    const v = (val || "").toLowerCase();
    if (v.includes("tele")) return "telebirr";
    if (v.includes("mobile")) return "mobile";
    return "cash";
  };

  /* apply Search + Date range + Payment filter */
  const filteredSales = useMemo(() => {
    const q = searchTerm.toLowerCase().trim();
    const { s, e } = getRangeDates(range, customStart, customEnd);

    return sales.filter((sale) => {
      /* search */
      const matchesSearch =
        !q ||
        sale.saleNumber.toLowerCase().includes(q) ||
        sale.customerName?.toLowerCase().includes(q);

      /* date */
      const saleDate = new Date(sale.saleDate);
      const inRange =
        range === "all" ||
        ((s ? saleDate >= s : true) && (e ? saleDate <= e : true));

      /* payment */
      const normalized = normalizePayment(paymentText(sale));
      const matchesPayment =
        paymentFilter === "all" || paymentFilter === normalized;

      return matchesSearch && inRange && matchesPayment;
    });
  }, [sales, searchTerm, range, customStart, customEnd, paymentFilter]);

  /* pagination keep in sync */
  const totalPages = Math.max(1, Math.ceil(filteredSales.length / itemsPerPage));
  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [totalPages, currentPage]);

  const paginatedSales = useMemo(
    () =>
      filteredSales.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
      ),
    [filteredSales, currentPage]
  );

  const getTotalItems = (sale: Sale) =>
    sale.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  const getMedicineName = (medicineId: number) => {
    const m = medicines.find((mm) => mm.id === medicineId);
    if (m) return m.name;
    const fallback: Record<number, string> = {
      1: "Paracetamol 500mg",
      2: "Aspirin 100mg",
      3: "Ibuprofen 200mg",
      4: "Amoxicillin 250mg",
      5: "Metformin 500mg",
    };
    return fallback[medicineId] ?? `Medicine ID: ${medicineId}`;
  };

  const PaymentBadge = ({ method }: { method: string }) => {
    const norm = method.toLowerCase();
    if (norm.includes("tele")) return <Badge variant="outline">Telebirr</Badge>;
    if (norm.includes("mobile")) return <Badge variant="secondary">Mobile Banking</Badge>;
    return <Badge variant="default">Cash</Badge>;
  };

  /* Export respects current filters (filteredSales) */
  const handleExport = () => {
    if (!filteredSales.length) {
      toast.info("No sales to export");
      return;
    }
    const headers = [
      "SaleNumber",
      "Date",
      "Customer",
      "Items",
      "TotalAmount",
      "Profit",
      "PaymentMethod",
    ];
    const rows = filteredSales.map((s) => [
      s.saleNumber,
      formatDate(s.saleDate),
      s.customerName || "Walk-in",
      String(getTotalItems(s)),
      String(Number(s.totalAmount) || 0),
      String(s.calculatedProfit || 0),
      paymentText(s),
    ]);
    const csv =
      [headers, ...rows]
        .map((r) =>
          r
            .map((v) => {
              const val = String(v ?? "");
              return /[",\n]/.test(val) ? `"${val.replace(/"/g, '""')}"` : val;
            })
            .join(",")
        )
        .join("\n") + "\n";

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "milkii-sales.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Exported CSV");
  };

  /* page list helper (unchanged) */
  function getPageList(current: number, total: number) {
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    const range: (number | "...")[] = [1];
    const left = Math.max(2, current - 1);
    const right = Math.min(total - 1, current + 1);
    if (left > 2) range.push("...");
    for (let i = left; i <= right; i++) range.push(i);
    if (right < total - 1) range.push("...");
    range.push(total);
    return range;
  }
  const pageList = getPageList(currentPage, totalPages);

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sales</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Link href="/sales">
            <Button className="bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700">
              New Sale
            </Button>
          </Link>
        </div>
      </div>
      <div className="h-[3px] w-full bg-gradient-to-r from-emerald-400 via-blue-500 to-emerald-400 rounded-full" />

      {/* Filters + Search */}
      <div className="flex flex-col lg:flex-row gap-3 lg:items-end">
        {/* Range */}
        <div className="w-full sm:w-56">
          <div className="text-xs text-gray-500 mb-1">Range</div>
          <Select
            value={range}
            onValueChange={(val: RangeKey) => {
              setRange(val);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="yesterday">Yesterday</SelectItem>
              <SelectItem value="this_week">This Week</SelectItem>
              <SelectItem value="last_week">Last Week</SelectItem>
              <SelectItem value="this_month">This Month</SelectItem>
              <SelectItem value="this_year">This Year</SelectItem>
              <SelectItem value="custom">Custom</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Custom Dates (only used when range === custom) */}
        <div className="flex gap-3 w-full sm:w-auto">
          <div className="w-full sm:w-48">
            <div className="text-xs text-gray-500 mb-1">Start</div>
            <Input
              type="date"
              value={customStart}
              onChange={(e) => {
                setCustomStart(e.target.value);
                setCurrentPage(1);
              }}
              disabled={range !== "custom"}
            />
          </div>
          <div className="w-full sm:w-48">
            <div className="text-xs text-gray-500 mb-1">End</div>
            <Input
              type="date"
              value={customEnd}
              onChange={(e) => {
                setCustomEnd(e.target.value);
                setCurrentPage(1);
              }}
              disabled={range !== "custom"}
            />
          </div>
        </div>

        {/* Payment */}
        <div className="w-full sm:w-56">
          <div className="text-xs text-gray-500 mb-1">Payment Method</div>
          <Select
            value={paymentFilter}
            onValueChange={(val: "all" | "cash" | "telebirr" | "mobile") => {
              setPaymentFilter(val);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="All methods" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="cash">Cash</SelectItem>
              <SelectItem value="telebirr">Telebirr</SelectItem>
              <SelectItem value="mobile">Mobile Banking</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Search */}
        <div className="relative flex-1 min-w-[220px]">
          <div className="text-xs text-gray-500 mb-1">Search</div>
          <Search className="absolute left-2 top-9 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search sales by number or customer…"
            value={searchTerm}
            onChange={(e) => {
              setCurrentPage(1);
              setSearchTerm(e.target.value);
            }}
            className="pl-8"
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Sale #</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Total Amount</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Profit</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-10 text-gray-500">
                  Loading sales…
                </TableCell>
              </TableRow>
            ) : paginatedSales.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-12">
                  <div className="text-gray-700 font-medium">No sales found</div>
                  <div className="text-gray-500 text-sm">
                    Try adjusting filters or search.
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              paginatedSales.map((sale) => (
                <TableRow key={sale.id} className="hover:bg-gray-50">
                  <TableCell className="font-medium">{sale.saleNumber}</TableCell>
                  <TableCell>{sale.customerName || "Walk-in"}</TableCell>
                  <TableCell>
                    <span className="font-medium">{getTotalItems(sale)}</span>
                    {sale.items && sale.items.length > 0 && (
                      <div className="text-xs text-gray-500 mt-1">
                        {sale.items
                          .slice(0, 2)
                          .map((i) => getMedicineName(i.medicineId))
                          .join(", ")}
                        {sale.items.length > 2 && ` +${sale.items.length - 2} more`}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">
                    {formatETB(Number(sale.totalAmount))}
                  </TableCell>
                  <TableCell>
                    <PaymentBadge method={paymentText(sale)} />
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {formatDate(sale.saleDate)}
                  </TableCell>
                  <TableCell className="text-emerald-700 font-medium">
                    {formatETB(sale.calculatedProfit || 0)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 w-8 p-0"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-3xl">
                        <DialogHeader>
                          <DialogTitle>Sale Details — {sale.saleNumber}</DialogTitle>
                        </DialogHeader>

                        {/* Sale Summary */}
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <div className="text-xs text-gray-500">Customer</div>
                            <div className="font-medium">
                              {sale.customerName || "Walk-in Customer"}
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-500">Date</div>
                            <div>{formatDate(sale.saleDate)}</div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-500">Total Amount</div>
                            <div className="font-medium">
                              {formatETB(Number(sale.totalAmount))}
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-500">Payment</div>
                            <div className="flex items-center gap-2">
                              <PaymentBadge method={paymentText(sale)} />
                              <span className="text-xs text-gray-500">
                                #{sale.saleNumber}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Items */}
                        <div className="mt-4 border rounded-lg overflow-hidden">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Medicine</TableHead>
                                <TableHead className="text-center">Qty</TableHead>
                                <TableHead className="text-right">Unit Price</TableHead>
                                <TableHead className="text-right">Total</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {sale.items?.map((item, idx) => (
                                <TableRow key={idx}>
                                  <TableCell className="font-medium">
                                    {getMedicineName(item.medicineId)}
                                  </TableCell>
                                  <TableCell className="text-center">
                                    {item.quantity}
                                  </TableCell>
                                  <TableCell className="text-right">
                                    {formatETB(Number(item.unitPrice))}
                                  </TableCell>
                                  <TableCell className="text-right font-medium">
                                    {formatETB(Number(item.unitPrice) * item.quantity)}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>

                        {/* Totals */}
                        <div className="pt-4 flex flex-col sm:flex-row sm:items-center sm:justify-end gap-2">
                          <div className="text-lg font-bold">
                            Total:&nbsp;{formatETB(Number(sale.totalAmount))}
                          </div>
                          {typeof sale.calculatedProfit === "number" && (
                            <div className="text-emerald-700 font-semibold">
                              Profit:&nbsp;{formatETB(sale.calculatedProfit)}
                            </div>
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-sm text-gray-500">
            Showing{" "}
            <span className="font-medium">
              {(currentPage - 1) * itemsPerPage + 1}
            </span>
            –
            <span className="font-medium">
              {Math.min(currentPage * itemsPerPage, filteredSales.length)}
            </span>{" "}
            of <span className="font-medium">{filteredSales.length}</span>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              aria-label="Previous page"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            {pageList.map((p, idx) =>
              p === "..." ? (
                <span key={`e-${idx}`} className="px-2 text-gray-500">
                  …
                </span>
              ) : (
                <Button
                  key={`p-${p}`}
                  variant={p === currentPage ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(p as number)}
                  className={
                    p === currentPage
                      ? "bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700 text-white"
                      : ""
                  }
                >
                  {p}
                </Button>
              )
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              aria-label="Next page"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
