"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  customerApi,
  salesApi,
  Customer,
  Sale,
  CreateCustomerDto,
} from "@/lib/api";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

import {
  Plus,
  Search,
  Edit,
  Trash2,
  Download,
  RefreshCcw,
} from "lucide-react";

/* ------------------------- Helpers ------------------------- */

const formatETB = (n: number) =>
  new Intl.NumberFormat("en-ET", { style: "currency", currency: "ETB" }).format(
    Number.isFinite(n) ? n : 0
  );

const formatDate = (dateString?: string) => {
  if (!dateString) return "—";
  const d = new Date(dateString);
  return isNaN(d.getTime()) ? "—" : d.toLocaleDateString("en-ET");
};

const daysSince = (dateString?: string) => {
  if (!dateString) return Infinity;
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return Infinity;
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
};

type SegmentKey =
  | "all"
  | "returning"
  | "frequent"
  | "big_spender"
  | "high_qty"
  | "dormant"
  | "new";

/* ------------------------- Page ------------------------- */

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");

  // Behavior filters
  const [segment, setSegment] = useState<SegmentKey>("all");
  const [sortBy, setSortBy] = useState<
    "spend" | "orders" | "qty" | "last" | "aov" | "name"
  >("spend");
  const [minOrders, setMinOrders] = useState<number>(0);

  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(
    null
  );
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  const [form, setForm] = useState<CreateCustomerDto>({
    name: "",
    email: "",
    phone: "",
    address: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [c, s] = await Promise.all([customerApi.list(), salesApi.list()]);
      setCustomers(c || []);
      setSales(s || []);
    } catch (error) {
      console.error("Failed to load data:", error);
      toast.error("Failed to load customers or sales");
    } finally {
      setLoading(false);
    }
  };

  /* ------------------------- Aggregation ------------------------- */

  type CustomerStats = {
    customer: Customer;
    orders: number;
    qty: number;
    spend: number;
    aov: number;
    lastDate?: string;
    daysSince: number; // Infinity if no purchases
    segment: Exclude<SegmentKey, "all"> | "none";
  };

  // Build a quick index of sales per customer name (string match with customer.name)
  const byName = useMemo(() => {
    const map = new Map<string, Sale[]>();
    for (const s of sales) {
      const key = (s.customerName || "").trim().toLowerCase();
      if (!key) continue;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(s);
    }
    return map;
  }, [sales]);

  // Percentile helpers (for big spender / high qty)
  function thresholdTopPercent(values: number[], pct = 0.9) {
    if (!values.length) return Infinity;
    const sorted = [...values].sort((a, b) => a - b);
    const idx = Math.floor(pct * (sorted.length - 1));
    return sorted[idx];
  }

  const stats: CustomerStats[] = useMemo(() => {
    const rows: CustomerStats[] = customers.map((c) => {
      const key = (c.name || "").trim().toLowerCase();
      const custSales = byName.get(key) || [];

      const orders = custSales.length;
      let qty = 0;
      let spend = 0;
      let lastDate: string | undefined = undefined;

      for (const s of custSales) {
        spend += Number(s.totalAmount) || 0;
        const itemsQty =
          s.items?.reduce((sum, it) => sum + (it.quantity || 0), 0) || 0;
        qty += itemsQty;
        if (!lastDate || new Date(s.saleDate) > new Date(lastDate)) {
          lastDate = s.saleDate;
        }
      }
      const aov = orders ? spend / orders : 0;
      const ds = daysSince(lastDate);

      // temp segment; upgraded below after we compute thresholds
      let seg: CustomerStats["segment"] = "none";
      if (orders === 1) seg = "new";
      else if (orders >= 2) seg = "returning";
      if (ds > 90 && orders > 0) seg = "dormant";

      return {
        customer: c,
        orders,
        qty,
        spend,
        aov,
        lastDate,
        daysSince: ds,
        segment: seg,
      };
    });

    // compute thresholds for spend and qty (top 10%)
    const spendVals = rows.map((r) => r.spend).filter((n) => n > 0);
    const qtyVals = rows.map((r) => r.qty).filter((n) => n > 0);
    const spendThr = thresholdTopPercent(spendVals, 0.9);
    const qtyThr = thresholdTopPercent(qtyVals, 0.9);

    // finalize segment with "big_spender" / "high_qty" if applicable
    for (const r of rows) {
      if (r.spend > 0 && r.spend >= spendThr) r.segment = "big_spender";
      if (r.qty > 0 && r.qty >= qtyThr) r.segment = "high_qty";
      // keep "dormant" if they are dormant (overrides)
      if (r.orders > 0 && r.daysSince > 90) r.segment = "dormant";
      // keep explicit "new" for first-timers
      if (r.orders === 1) r.segment = "new";
      // frequent: >= 5 orders (adjust as you like)
      if (r.orders >= 5 && r.segment !== "dormant") r.segment = "frequent";
      // returning fallback already set for >=2 orders
    }

    return rows;
  }, [customers, byName]);

  /* ------------------------- Filters/Sort ------------------------- */

  const filtered = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    let arr = stats.filter((r) => {
      const { customer } = r;
      const matchesSearch =
        !q ||
        customer.name.toLowerCase().includes(q) ||
        customer.email?.toLowerCase().includes(q) ||
        customer.phone?.toLowerCase().includes(q) ||
        customer.address?.toLowerCase().includes(q);

      const matchesSegment =
        segment === "all" ? true : r.segment === segment;

      const matchesMinOrders = r.orders >= minOrders;

      return matchesSearch && matchesSegment && matchesMinOrders;
    });

    arr.sort((a, b) => {
      switch (sortBy) {
        case "spend":
          return b.spend - a.spend;
        case "orders":
          return b.orders - a.orders;
        case "qty":
          return b.qty - a.qty;
        case "last": {
          // recent first: smaller daysSince first
          return a.daysSince - b.daysSince;
        }
        case "aov":
          return b.aov - a.aov;
        case "name":
          return a.customer.name.localeCompare(b.customer.name);
        default:
          return 0;
      }
    });

    return arr;
  }, [stats, searchTerm, segment, minOrders, sortBy]);

  /* ------------------------- CRUD ------------------------- */

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("Customer name is required");
      return;
    }
    try {
      if (editingCustomer) {
        await customerApi.update(editingCustomer.id, form);
        toast.success("Customer updated successfully");
      } else {
        await customerApi.create(form);
        toast.success("Customer created successfully");
      }
      setModalOpen(false);
      setEditingCustomer(null);
      setForm({ name: "", email: "", phone: "", address: "" });
      loadData();
    } catch (error) {
      console.error("Failed to save customer:", error);
      toast.error("Failed to save customer");
    }
  };

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setForm({
      name: customer.name,
      email: customer.email || "",
      phone: customer.phone || "",
      address: customer.address || "",
    });
    setModalOpen(true);
  };

  const handleDelete = (customer: Customer) => {
    setCustomerToDelete(customer);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!customerToDelete) return;

    try {
      await customerApi.delete(customerToDelete.id);
      toast.success("Customer deleted successfully");
      loadData();
    } catch (error: unknown) {
      console.error("Failed to delete customer:", error);
      toast.error("Failed to delete customer");
    } finally {
      setDeleteModalOpen(false);
      setCustomerToDelete(null);
    }
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setEditingCustomer(null);
    setForm({ name: "", email: "", phone: "", address: "" });
  };

  /* ------------------------- Export ------------------------- */

  const handleExport = () => {
    if (!filtered.length) {
      toast.info("No customers to export");
      return;
    }

    const headers = [
      "Name",
      "Email",
      "Phone",
      "Address",
      "Orders",
      "ItemsQty",
      "SpendETB",
      "AvgOrderValue",
      "LastPurchase",
      "DaysSince",
      "Segment",
    ];

    const rows = filtered.map((r) => [
      r.customer.name ?? "",
      r.customer.email ?? "",
      r.customer.phone ?? "",
      r.customer.address ?? "",
      String(r.orders),
      String(r.qty),
      String(r.spend.toFixed(2)),
      String(r.aov.toFixed(2)),
      r.lastDate ? new Date(r.lastDate).toISOString() : "",
      isFinite(r.daysSince) ? String(r.daysSince) : "",
      r.segment,
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
    a.download = "milkii-customers-insights.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Exported CSV");
  };

  /* ------------------------- UI ------------------------- */

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport} disabled={!filtered.length}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          <Button variant="outline" onClick={loadData} disabled={loading}>
            <RefreshCcw className="mr-2 h-4 w-4" />
            {loading ? "Refreshing…" : "Refresh"}
          </Button>

          <Dialog open={modalOpen} onOpenChange={setModalOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={() => setEditingCustomer(null)}
                className="bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Customer
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[520px]">
              <DialogHeader>
                <DialogTitle>
                  {editingCustomer ? "Edit Customer" : "Add New Customer"}
                </DialogTitle>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Full name"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="name@example.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="+251..."
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Textarea
                    id="address"
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    placeholder="Kebele / Woreda / City"
                    rows={3}
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={handleModalClose}>
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700"
                  >
                    {editingCustomer ? "Update" : "Create"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Accent underline */}
      <div className="h-[3px] w-full bg-gradient-to-r from-emerald-400 via-blue-500 to-emerald-400 rounded-full" />

      {/* Insights Toolbar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search name, email, or phone…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-600">Segment</label>
          <Select value={segment} onValueChange={(v: SegmentKey) => setSegment(v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="returning">Returning (≥2 orders)</SelectItem>
              <SelectItem value="frequent">Frequent (≥5 orders)</SelectItem>
              <SelectItem value="big_spender">Big Spender (top 10% spend)</SelectItem>
              <SelectItem value="high_qty">High Quantity (top 10% items)</SelectItem>
              <SelectItem value="dormant">Dormant (&gt;90 days)</SelectItem>
              <SelectItem value="new">New (1 order)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-600">Sort by</label>
          <Select value={sortBy} onValueChange={(v: any) => setSortBy(v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="spend">Total Spend</SelectItem>
              <SelectItem value="orders">Orders</SelectItem>
              <SelectItem value="qty">Items Quantity</SelectItem>
              <SelectItem value="aov">Avg Order Value</SelectItem>
              <SelectItem value="last">Last Purchase (recent first)</SelectItem>
              <SelectItem value="name">Name (A–Z)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-600">Min orders</label>
          <Input
            type="number"
            min={0}
            value={minOrders}
            onChange={(e) => setMinOrders(Math.max(0, Number(e.target.value || 0)))}
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Orders</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Spend</TableHead>
              <TableHead>AOV</TableHead>
              <TableHead>Last Purchase</TableHead>
              <TableHead>Segment</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-10 text-gray-500">
                  Loading customers…
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="py-12">
                  <div className="text-center">
                    <p className="text-gray-700 font-medium">No customers found</p>
                    <p className="text-gray-500 text-sm">
                      Try adjusting filters, or add a new customer.
                    </p>
                    <div className="mt-4">
                      <Button
                        onClick={() => {
                          setEditingCustomer(null);
                          setModalOpen(true);
                        }}
                        className="bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Customer
                      </Button>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((r) => {
                const seg = r.segment;
                let segBadge: { text: string; className: string } = {
                  text: "—",
                  className: "bg-gray-100 text-gray-700",
                };
                if (seg === "new") segBadge = { text: "New", className: "bg-blue-50 text-blue-700 border-blue-200" };
                if (seg === "returning") segBadge = { text: "Returning", className: "bg-emerald-50 text-emerald-700 border-emerald-200" };
                if (seg === "frequent") segBadge = { text: "Frequent", className: "bg-indigo-50 text-indigo-700 border-indigo-200" };
                if (seg === "big_spender") segBadge = { text: "Big Spender", className: "bg-amber-50 text-amber-700 border-amber-200" };
                if (seg === "high_qty") segBadge = { text: "High Qty", className: "bg-purple-50 text-purple-700 border-purple-200" };
                if (seg === "dormant") segBadge = { text: "Dormant", className: "bg-red-50 text-red-700 border-red-200" };

                return (
                  <TableRow key={r.customer.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium">{r.customer.name}</TableCell>
                    <TableCell>{r.customer.email || "N/A"}</TableCell>
                    <TableCell>{r.customer.phone || "N/A"}</TableCell>
                    <TableCell>{r.orders}</TableCell>
                    <TableCell>{r.qty}</TableCell>
                    <TableCell>{formatETB(r.spend)}</TableCell>
                    <TableCell>{formatETB(r.aov)}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span>{formatDate(r.lastDate)}</span>
                        {isFinite(r.daysSince) && (
                          <span className="text-xs text-gray-500">
                            {r.daysSince === 0 ? "today" : `${r.daysSince}d ago`}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={`border ${segBadge.className}`}>{segBadge.text}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(r.customer)}
                          className="h-8 w-8 p-0"
                          aria-label="Edit"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(r.customer)}
                          className="h-8 w-8 p-0"
                          aria-label="Delete"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Delete Confirmation */}
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Customer</DialogTitle>
          </DialogHeader>
          <div className="py-2">
            <p>
              Are you sure you want to delete{" "}
              <strong>{customerToDelete?.name}</strong>? This action cannot be
              undone.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete Customer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
