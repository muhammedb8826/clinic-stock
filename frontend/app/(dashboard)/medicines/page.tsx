"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import {
  medicineApi,
  Medicine,
  CreateMedicineDto,
} from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MedicineForm } from "@/components/medicine-form";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  RefreshCcw,
  Download,
  Barcode,
  Package,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/* ------------------------- Helpers ------------------------- */

const PAGE_SIZE = 10;

type SortField = "name" | "category" | "quantity" | "unit" | "sellingPrice" | "costPrice" | "totalValue" | "expiryDate" | "createdAt";
type SortDirection = "asc" | "desc";

const formatPrice = (price: number) =>
  new Intl.NumberFormat("en-ET", {
    style: "currency",
    currency: "ETB",
    maximumFractionDigits: 2,
  }).format(price || 0);

const formatDate = (dateString?: string) => {
  if (!dateString) return "—";
  const d = new Date(dateString);
  return isNaN(d.getTime()) ? "—" : d.toLocaleDateString("en-ET");
};

function daysUntil(dateString?: string) {
  if (!dateString) return Infinity;
  const target = new Date(dateString);
  if (isNaN(target.getTime())) return Infinity;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

function stockBadge(quantity: number) {
  if (quantity <= 0) return { label: "Out of Stock", className: "bg-red-50 text-red-700 border-red-200" as const };
  if (quantity <= 10) return { label: "Low Stock", className: "bg-amber-50 text-amber-700 border-amber-200" as const };
  return { label: "In Stock", className: "bg-emerald-50 text-emerald-700 border-emerald-200" as const };
}

function expiryBadge(expiryDate?: string) {
  const d = daysUntil(expiryDate);
  if (d === Infinity) return { label: "—", className: "" as const };
  if (d < 0) return { label: "Expired", className: "bg-red-50 text-red-700 border-red-200" as const };
  if (d <= 180) return { label: "Expire Soon", className: "bg-amber-50 text-amber-700 border-amber-200" as const };
  return { label: "Good", className: "bg-emerald-50 text-emerald-700 border-emerald-200" as const };
}

/** Build compact page list like: [1, 2, '…', 5, 6, '…', 12] */
function getPageNumbers(totalPages: number, current: number, siblingCount = 1): (number | string)[] {
  const totalNumbers = siblingCount * 2 + 5; // first, last, current, 2 ellipses
  if (totalPages <= totalNumbers) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const left = Math.max(current - siblingCount, 2);
  const right = Math.min(current + siblingCount, totalPages - 1);
  const showLeftEllipsis = left > 2;
  const showRightEllipsis = right < totalPages - 1;

  const pages: (number | string)[] = [1];
  if (showLeftEllipsis) pages.push("…");
  for (let p = left; p <= right; p++) pages.push(p);
  if (showRightEllipsis) pages.push("…");
  pages.push(totalPages);
  if (!showLeftEllipsis && left === 2) pages.splice(1, 0, 2);
  return pages;
}

function getSortIcon(field: SortField, currentField: SortField, currentDirection: SortDirection) {
  if (field !== currentField) {
    return <ArrowUpDown className="h-4 w-4 text-gray-400" />;
  }
  return currentDirection === "asc" ? 
    <ArrowUp className="h-4 w-4 text-emerald-600" /> : 
    <ArrowDown className="h-4 w-4 text-emerald-600" />;
}

/* ------------------------- Page ------------------------- */

export default function MedicinesPage() {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [stockFilter, setStockFilter] = useState<"all" | "in" | "low" | "out">("all");
  const [expiryFilter, setExpiryFilter] = useState<"all" | "good" | "soon" | "expired">("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const [sortField, setSortField] = useState<SortField>("createdAt");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  const [page, setPage] = useState(1);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState<Medicine | null>(null);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [medicineToDelete, setMedicineToDelete] = useState<Medicine | null>(null);

  const loadMedicines = useCallback(async () => {
    setLoading(true);
    try {
      const response = await medicineApi.getAll({ page: 1, limit: 1000 });
      setMedicines(response.medicines || []);
    } catch (error) {
      console.error("Failed to load medicines:", error);
      toast.error("Failed to load medicines");
      setMedicines([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMedicines();
  }, [loadMedicines]);

  // Options for Category filter (built from current data)
  const categoryOptions = useMemo(() => {
    const set = new Set<string>();
    let hasUncategorized = false;

    for (const m of medicines) {
      const name = m.category?.name?.trim();
      if (name) set.add(name);
      else hasUncategorized = true;
    }
    const arr = Array.from(set).sort((a, b) => a.localeCompare(b));
    if (hasUncategorized) arr.unshift("Uncategorized");
    return arr;
  }, [medicines]);

  // Reset to first page when filters, search, or sorting change
  useEffect(() => {
    setPage(1);
  }, [searchTerm, stockFilter, expiryFilter, categoryFilter, sortField, sortDirection]);

  const filteredMedicines = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    const filtered = (medicines || [])
      .filter((m) => {
        if (!q) return true;
        return (
          m.name.toLowerCase().includes(q) ||
          m.barcode?.toLowerCase().includes(q) ||
          m.category?.name?.toLowerCase().includes(q)
        );
      })
      .filter((m) => {
        if (stockFilter === "all") return true;
        if (stockFilter === "in") return m.quantity > 10;
        if (stockFilter === "low") return m.quantity > 0 && m.quantity <= 10;
        if (stockFilter === "out") return m.quantity <= 0;
        return true;
      })
      .filter((m) => {
        const d = daysUntil(m.expiryDate);
        if (expiryFilter === "all") return true;
        if (expiryFilter === "expired") return d < 0;
        if (expiryFilter === "soon") return d >= 0 && d <= 180;
        if (expiryFilter === "good") return d > 180;
        return true;
      })
      .filter((m) => {
        if (categoryFilter === "all") return true;
        const name = m.category?.name?.trim() || "Uncategorized";
        return name === categoryFilter;
      });

    // Sort the filtered results
    return filtered.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortField) {
        case "name":
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case "category":
          aValue = (a.category?.name || "Uncategorized").toLowerCase();
          bValue = (b.category?.name || "Uncategorized").toLowerCase();
          break;
        case "quantity":
          aValue = a.quantity;
          bValue = b.quantity;
          break;
        case "unit":
          aValue = (a.unit || "").toLowerCase();
          bValue = (b.unit || "").toLowerCase();
          break;
        case "sellingPrice":
          aValue = Number(a.sellingPrice);
          bValue = Number(b.sellingPrice);
          break;
        case "costPrice":
          aValue = Number(a.costPrice);
          bValue = Number(b.costPrice);
          break;
        case "totalValue":
          aValue = Number(a.costPrice) * a.quantity;
          bValue = Number(b.costPrice) * b.quantity;
          break;
        case "expiryDate":
          aValue = new Date(a.expiryDate || "").getTime();
          bValue = new Date(b.expiryDate || "").getTime();
          break;
        case "createdAt":
          aValue = new Date(a.createdAt || "").getTime();
          bValue = new Date(b.createdAt || "").getTime();
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  }, [medicines, searchTerm, stockFilter, expiryFilter, categoryFilter, sortField, sortDirection]);

  const totalPages = Math.max(1, Math.ceil(filteredMedicines.length / PAGE_SIZE));

  // If current page goes out of bounds after filtering, clamp it
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const pageItems = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredMedicines.slice(start, start + PAGE_SIZE);
  }, [filteredMedicines, page]);

  const handleSubmit = async (data: CreateMedicineDto | Partial<CreateMedicineDto>) => {
    try {
      if (editingMedicine) {
        await medicineApi.update(
          editingMedicine.id,
          data as unknown as Parameters<typeof medicineApi.update>[1]
        );
        toast.success("Medicine updated");
      } else {
        await medicineApi.create(data as unknown as Parameters<typeof medicineApi.create>[0]);
        toast.success("Medicine created");
      }
      setModalOpen(false);
      setEditingMedicine(null);
      loadMedicines();
    } catch (error: unknown) {
      console.error("Failed to save medicine:", error);
      let errorMessage = "Failed to save medicine";
      if (error && typeof error === "object" && "response" in error) {
        const apiError = error as {
          response?: { data?: { message?: string; error?: string; errors?: unknown[] } };
        };
        if (apiError.response?.data?.message) errorMessage = apiError.response.data.message;
        else if (apiError.response?.data?.error) errorMessage = apiError.response.data.error;
        else if (apiError.response?.data?.errors) {
          const errors = apiError.response.data.errors;
          if (Array.isArray(errors) && errors.length > 0) {
            errorMessage = errors
              .map((err) =>
                typeof err === "object" && err && "message" in err ? String((err as any).message) : String(err)
              )
              .join(", ");
          }
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      toast.error(errorMessage);
    }
  };

  const handleEdit = (medicine: Medicine) => {
    setEditingMedicine(medicine);
    setModalOpen(true);
  };

  const handleDelete = (medicine: Medicine) => {
    setMedicineToDelete(medicine);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!medicineToDelete) return;
    try {
      await medicineApi.delete(medicineToDelete.id);
      toast.success("Medicine deleted");
      loadMedicines();
    } catch (error) {
      console.error("Failed to delete medicine:", error);
      toast.error("Failed to delete medicine");
    } finally {
      setDeleteModalOpen(false);
      setMedicineToDelete(null);
    }
  };

  const closeForm = () => {
    setModalOpen(false);
    setEditingMedicine(null);
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Toggle direction if same field
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      // Set new field with ascending direction
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handleExport = () => {
    if (!filteredMedicines.length) {
      toast.info("No data to export");
      return;
    }
    const rows = [
      ["Name", "Category", "Quantity", "Unit", "SellingPrice", "CostPrice", "TotalValue", "ExpiryDate"],
      ...filteredMedicines.map((m) => [
        m.name,
        m.category?.name || "",
        m.quantity.toString(),
        m.unit || "",
        String(m.sellingPrice),
        String(m.costPrice),
        String(m.costPrice * m.quantity),
        m.expiryDate ?? "",
      ]),
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "wan-ofi-medicines.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Exported CSV");
  };

  const startItem = filteredMedicines.length ? (page - 1) * PAGE_SIZE + 1 : 0;
  const endItem = Math.min(page * PAGE_SIZE, filteredMedicines.length);

  // Calculate total cost of all in-stock products
  const totalStockValue = useMemo(() => {
    return filteredMedicines.reduce((total, medicine) => {
      return total + (medicine.costPrice * medicine.quantity);
    }, 0);
  }, [filteredMedicines]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Medicines</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport} disabled={!filteredMedicines.length}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button variant="outline" onClick={loadMedicines} disabled={loading}>
            <RefreshCcw className="h-4 w-4 mr-2" />
            {loading ? "Refreshing…" : "Refresh"}
          </Button>
          <Dialog open={modalOpen} onOpenChange={setModalOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={() => setEditingMedicine(null)}
                className="bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Medicine
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editingMedicine ? "Edit Medicine" : "Add New Medicine"}</DialogTitle>
              </DialogHeader>
              <MedicineForm
                onSubmit={handleSubmit}
                initialData={editingMedicine || undefined}
                onCancel={closeForm}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Summary Card */}
      <Card className="overflow-hidden">
        <div className="h-1 w-full bg-gradient-to-r from-emerald-400 via-blue-500 to-emerald-400" />
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="h-6 w-6 text-emerald-600" />
              <span className="text-lg font-medium">Total Stock On Hand</span>
            </div>
            <div className="text-2xl font-bold text-emerald-600">
              {formatPrice(totalStockValue)}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Toolbar */}
      <Card className="overflow-hidden">
        <div className="h-1 w-full bg-gradient-to-r from-emerald-400 via-blue-500 to-emerald-400" />
        <CardContent>
          <CardTitle className="text-sm font-medium">Filters</CardTitle>
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search name, barcode, category…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>

            {/* Stock */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-600">Stock</label>
              <Select value={stockFilter} onValueChange={(v: any) => setStockFilter(v)}>
                <SelectTrigger>
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="in">In Stock</SelectItem>
                  <SelectItem value="low">Low Stock (≤10)</SelectItem>
                  <SelectItem value="out">Out of Stock</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Expiry */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-600">Expiry</label>
              <Select value={expiryFilter} onValueChange={(v: any) => setExpiryFilter(v)}>
                <SelectTrigger>
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="good">Good (&gt;6 months)</SelectItem>
                  <SelectItem value="soon">Expire Soon (≤6 months)</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Category (NEW) */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-600">Category</label>
              <Select value={categoryFilter} onValueChange={(v) => setCategoryFilter(v)}>
                <SelectTrigger>
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  {categoryOptions.map((name) => (
                    <SelectItem key={name} value={name}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Clear */}
            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("");
                  setStockFilter("all");
                  setExpiryFilter("all");
                  setCategoryFilter("all");
                  setSortField("createdAt");
                  setSortDirection("desc");
                }}
              >
                Clear
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead 
                className="cursor-pointer hover:bg-gray-50 select-none"
                onClick={() => handleSort("name")}
              >
                <div className="flex items-center gap-2">
                  Name
                  {getSortIcon("name", sortField, sortDirection)}
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-gray-50 select-none"
                onClick={() => handleSort("category")}
              >
                <div className="flex items-center gap-2">
                  Category
                  {getSortIcon("category", sortField, sortDirection)}
                </div>
              </TableHead>
              <TableHead 
                className="text-right cursor-pointer hover:bg-gray-50 select-none"
                onClick={() => handleSort("quantity")}
              >
                <div className="flex items-center justify-end gap-2">
                  Qty
                  {getSortIcon("quantity", sortField, sortDirection)}
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-gray-50 select-none"
                onClick={() => handleSort("unit")}
              >
                <div className="flex items-center gap-2">
                  Unit
                  {getSortIcon("unit", sortField, sortDirection)}
                </div>
              </TableHead>
              <TableHead 
                className="text-right cursor-pointer hover:bg-gray-50 select-none"
                onClick={() => handleSort("sellingPrice")}
              >
                <div className="flex items-center justify-end gap-2">
                  Price
                  {getSortIcon("sellingPrice", sortField, sortDirection)}
                </div>
              </TableHead>
              <TableHead 
                className="text-right cursor-pointer hover:bg-gray-50 select-none"
                onClick={() => handleSort("costPrice")}
              >
                <div className="flex items-center justify-end gap-2">
                  Cost
                  {getSortIcon("costPrice", sortField, sortDirection)}
                </div>
              </TableHead>
              <TableHead 
                className="text-right cursor-pointer hover:bg-gray-50 select-none"
                onClick={() => handleSort("totalValue")}
              >
                <div className="flex items-center justify-end gap-2">
                  Total Value
                  {getSortIcon("totalValue", sortField, sortDirection)}
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-gray-50 select-none"
                onClick={() => handleSort("expiryDate")}
              >
                <div className="flex items-center gap-2">
                  Expiry
                  {getSortIcon("expiryDate", sortField, sortDirection)}
                </div>
              </TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Expiry Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={11} className="py-8 text-center text-gray-500">
                  Loading medicines…
                </TableCell>
              </TableRow>
            ) : !pageItems.length ? (
              <TableRow>
                <TableCell colSpan={11} className="py-12">
                  <div className="text-center">
                    <div className="mx-auto mb-3 h-10 w-10 rounded-lg grid place-items-center bg-gray-100 text-gray-500">
                      <Barcode className="h-5 w-5" />
                    </div>
                    <p className="text-gray-700 font-medium">No medicines found</p>
                    <p className="text-gray-500 text-sm">Try adjusting filters or add a new item.</p>
                    <div className="mt-4">
                      <Button
                        onClick={() => {
                          setEditingMedicine(null);
                          setModalOpen(true);
                        }}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Medicine
                      </Button>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              pageItems.map((m) => {
                const s = stockBadge(m.quantity);
                const e = expiryBadge(m.expiryDate);
                const until = daysUntil(m.expiryDate);

                return (
                  <TableRow key={m.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium">{m.name}</TableCell>
                    <TableCell>{m.category?.name || "—"}</TableCell>
                    <TableCell
                      className={`text-right font-medium ${
                        m.quantity <= 10 ? "text-amber-700" : "text-emerald-700"
                      }`}
                    >
                      {m.quantity}
                    </TableCell>
                    <TableCell className="text-gray-600">{m.unit || "—"}</TableCell>
                    <TableCell className="text-right">{formatPrice(m.sellingPrice)}</TableCell>
                    <TableCell className="text-right">{formatPrice(m.costPrice)}</TableCell>
                    <TableCell className="text-right font-medium text-emerald-700">
                      {formatPrice(m.costPrice * m.quantity)}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span
                          className={`${
                            until < 0
                              ? "text-red-700"
                              : until <= 180
                              ? "text-amber-700"
                              : "text-gray-700"
                          }`}
                        >
                          {formatDate(m.expiryDate)}
                        </span>
                        {isFinite(until) && (
                          <span className="text-xs text-gray-500">
                            {until < 0 ? `${Math.abs(until)}d ago` : `in ${until}d`}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={`border ${s.className}`}>{s.label}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={`border ${e.className}`}>{e.label}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(m)}
                          className="h-8 w-8 p-0"
                          aria-label="Edit"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(m)}
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

      {/* Pagination (only shows when rows > PAGE_SIZE) */}
      {filteredMedicines.length > PAGE_SIZE && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <p className="text-sm text-gray-500">
            Showing <span className="font-medium text-gray-700">{startItem}</span>–
            <span className="font-medium text-gray-700">{endItem}</span> of{" "}
            <span className="font-medium text-gray-700">{filteredMedicines.length}</span>
          </p>

          <nav className="flex items-center gap-1" aria-label="Pagination">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              aria-label="Previous page"
              title="Previous"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            {getPageNumbers(totalPages, page, 1).map((p, idx) =>
              typeof p === "number" ? (
                <Button
                  key={idx}
                  variant={p === page ? "default" : "outline"}
                  className={`h-8 min-w-[2rem] px-2 ${
                    p === page
                      ? "bg-gradient-to-r from-emerald-500 to-blue-600 text-white hover:from-emerald-600 hover:to-blue-700"
                      : ""
                  }`}
                  onClick={() => setPage(p)}
                >
                  {p}
                </Button>
              ) : (
                <span key={idx} className="px-2 text-gray-500 select-none">
                  {p}
                </span>
              )
            )}

            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              aria-label="Next page"
              title="Next"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </nav>
        </div>
      )}

      {/* Delete Confirmation */}
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Medicine</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>
              Are you sure you want to delete{" "}
              <strong>{medicineToDelete?.name}</strong>? This action cannot be undone.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete Medicine
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ------------------------- Small UI bits (optional if used elsewhere) ------------------------- */

function StatCard({
  title,
  value,
  icon,
  accent,
}: {
  title: string;
  value: number;
  icon?: React.ReactNode;
  accent?: "amber" | "red";
}) {
  const chip =
    accent === "amber"
      ? "bg-amber-50 text-amber-700"
      : accent === "red"
      ? "bg-red-50 text-red-700"
      : "bg-emerald-50 text-emerald-700";
  return (
    <Card className="overflow-hidden">
      <div className="h-1 w-full bg-gradient-to-r from-emerald-400 via-blue-500 to-emerald-400" />
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <div className={`h-8 w-8 rounded-lg grid place-items-center ${chip}`}>
            {icon ?? <Package className="h-4 w-4" />}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}
