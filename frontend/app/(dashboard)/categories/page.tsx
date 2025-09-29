"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { categoryApi, Category } from "@/lib/api";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  RefreshCcw,
  Download,
  ChevronLeft,
  ChevronRight,
  Tag,
} from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/* ------------------------- Helpers ------------------------- */

const PAGE_SIZE = 10;

const formatDate = (dateString?: string) => {
  if (!dateString) return "—";
  const d = new Date(dateString);
  return isNaN(d.getTime()) ? "—" : d.toLocaleDateString("en-ET");
};

/** Build compact page list like: [1, 2, '…', 5, 6, '…', 12] */
function getPageNumbers(totalPages: number, current: number, siblingCount = 1): (number | string)[] {
  const totalNumbers = siblingCount * 2 + 5; // first, last, current, 2 ellipses
  if (totalPages <= totalNumbers) return Array.from({ length: totalPages }, (_, i) => i + 1);

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

/* ------------------------- Page ------------------------- */

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");

  const [page, setPage] = useState(1);

  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({ name: "", description: "" });

  const loadCategories = useCallback(async () => {
    setLoading(true);
    try {
      const response = await categoryApi.list({ page: 1, limit: 1000 });
      setCategories(response.categories || []);
    } catch (error) {
      console.error("Failed to load categories:", error);
      toast.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  // Reset to first page when filters/search change
  useEffect(() => {
    setPage(1);
  }, [searchTerm, statusFilter]);

  const filteredCategories = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return (categories || [])
      .filter((c) => {
        if (!q) return true;
        return (
          c.name.toLowerCase().includes(q) ||
          (c.description || "").toLowerCase().includes(q)
        );
      })
      .filter((c) => {
        if (statusFilter === "all") return true;
        return statusFilter === "active" ? c.isActive : !c.isActive;
      });
  }, [categories, searchTerm, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredCategories.length / PAGE_SIZE));
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const pageItems = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredCategories.slice(start, start + PAGE_SIZE);
  }, [filteredCategories, page]);

  const startItem = filteredCategories.length ? (page - 1) * PAGE_SIZE + 1 : 0;
  const endItem = Math.min(page * PAGE_SIZE, filteredCategories.length);

  const openCreate = () => {
    setEditingCategory(null);
    setFormData({ name: "", description: "" });
    setModalOpen(true);
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || "",
    });
    setModalOpen(true);
  };

  const handleDelete = (category: Category) => {
    setCategoryToDelete(category);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!categoryToDelete) return;
    try {
      await categoryApi.remove(categoryToDelete.id);
      toast.success("Category deleted");
      loadCategories();
    } catch (error) {
      console.error("Failed to delete category:", error);
      toast.error("Failed to delete category");
    } finally {
      setDeleteModalOpen(false);
      setCategoryToDelete(null);
    }
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setEditingCategory(null);
    setFormData({ name: "", description: "" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error("Category name is required");
      return;
    }
    try {
      if (editingCategory) {
        await categoryApi.update(editingCategory.id, formData);
        toast.success("Category updated");
      } else {
        await categoryApi.create(formData);
        toast.success("Category created");
      }
      setModalOpen(false);
      setEditingCategory(null);
      setFormData({ name: "", description: "" });
      loadCategories();
    } catch (error) {
      console.error("Failed to save category:", error);
      toast.error("Failed to save category");
    }
  };

  const handleExport = () => {
    if (!filteredCategories.length) {
      toast.info("No data to export");
      return;
    }
    const rows = [
      ["Name", "Description", "Status", "CreatedAt", "UpdatedAt"],
      ...filteredCategories.map((c) => [
        c.name,
        (c.description || "").replace(/[\n\r,]+/g, " "),
        c.isActive ? "Active" : "Inactive",
        formatDate(c.createdAt),
        formatDate(c.updatedAt),
      ]),
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "milkii-categories.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Exported CSV");
  };
  const statusBadge = (isActive: boolean) =>
  isActive
    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
    : "border-blue-200 bg-blue-50 text-blue-700";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
          <p className="text-sm text-gray-500">
            Organize agri-vet items into clear, searchable groups.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport} disabled={!filteredCategories.length}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button variant="outline" onClick={loadCategories} disabled={loading}>
            <RefreshCcw className="h-4 w-4 mr-2" />
            {loading ? "Refreshing…" : "Refresh"}
          </Button>
          <Dialog open={modalOpen} onOpenChange={setModalOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={openCreate}
                className="bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Category
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>{editingCategory ? "Edit Category" : "Add New Category"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                    placeholder="e.g. Vaccines, Antibiotics, Feed Additives"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
                    placeholder="Short description (optional)"
                    rows={3}
                  />
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={handleModalClose}>
                    Cancel
                  </Button>
                  <Button type="submit">{editingCategory ? "Update" : "Create"}</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Toolbar */}
      <Card className="overflow-hidden">
        <div className="h-1 w-full bg-gradient-to-r from-emerald-400 via-blue-500 to-emerald-400" />

        <CardContent className="py-3">
          <CardTitle className="text-xs font-semibold tracking-wide text-gray-700">Filters</CardTitle>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search name or description…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 h-9"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-medium text-gray-600">Status</label>
              <Select value={statusFilter} onValueChange={(v: any) => setStatusFilter(v)}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button
                variant="outline"
                className="h-9"
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("all");
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
              <TableHead className="w-[26%]">Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Updated</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="py-8 text-center text-gray-500">
                  Loading categories…
                </TableCell>
              </TableRow>
            ) : !pageItems.length ? (
              <TableRow>
                <TableCell colSpan={6} className="py-12">
                  <div className="text-center">
                    <div className="mx-auto mb-3 h-10 w-10 rounded-lg grid place-items-center bg-gray-100 text-gray-500">
                      <Tag className="h-5 w-5" />
                    </div>
                    <p className="text-gray-700 font-medium">No categories found</p>
                    <p className="text-gray-500 text-sm">Try adjusting filters or add a new category.</p>
                    <div className="mt-4">
                      <Button onClick={openCreate}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Category
                      </Button>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              pageItems.map((category) => (
                <TableRow key={category.id} className="hover:bg-gray-50">
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell className="text-sm text-gray-700">
                    {category.description || "—"}
                  </TableCell>
                  <TableCell>
                    <Badge className={`border ${statusBadge(category.isActive)}`}>
                      {category.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">{formatDate(category.createdAt)}</TableCell>
                  <TableCell className="text-sm text-gray-500">{formatDate(category.updatedAt)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(category)}
                        className="h-8 w-8 p-0"
                        aria-label="Edit"
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(category)}
                        className="h-8 w-8 p-0"
                        aria-label="Delete"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination (only when rows > PAGE_SIZE) */}
      {filteredCategories.length > PAGE_SIZE && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <p className="text-sm text-gray-500">
            Showing <span className="font-medium text-gray-700">{startItem}</span>–
            <span className="font-medium text-gray-700">{endItem}</span> of{" "}
            <span className="font-medium text-gray-700">{filteredCategories.length}</span>
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
            <DialogTitle>Delete Category</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>
              Are you sure you want to delete{" "}
              <strong>{categoryToDelete?.name}</strong>? This action cannot be undone.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete Category
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
