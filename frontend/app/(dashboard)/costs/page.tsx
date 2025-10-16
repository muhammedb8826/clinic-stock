"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Search,
  Filter,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Edit,
  Trash2,
  DollarSign,
} from "lucide-react";
import { toast } from "sonner";
import { Cost, CreateCostDto, UpdateCostDto, costApi, CostQueryParams } from "@/lib/api";
import { CostForm } from "@/components/cost-form";

type FilterPeriod = 
  | "today" 
  | "thisWeek" 
  | "lastWeek" 
  | "thisMonth" 
  | "lastMonth" 
  | "thisYear" 
  | "custom";

export default function CostsPage() {
  const [costs, setCosts] = useState<Cost[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalAmount, setTotalAmount] = useState(0);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  
  // Form state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCost, setEditingCost] = useState<Cost | undefined>();
  
  // Filter state
  const [filterPeriod, setFilterPeriod] = useState<FilterPeriod>("thisMonth");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  
  // Categories
  const [categories, setCategories] = useState<string[]>([]);

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat("en-ET", {
      style: "currency",
      currency: "ETB",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-ET", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Get date range based on filter period
  const getDateRange = (period: FilterPeriod) => {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);

    switch (period) {
      case "today":
        return {
          startDate: startOfDay.toISOString().split("T")[0],
          endDate: endOfDay.toISOString().split("T")[0],
        };
      case "thisWeek":
        const startOfWeek = new Date(startOfDay);
        startOfWeek.setDate(startOfDay.getDate() - startOfDay.getDay());
        return {
          startDate: startOfWeek.toISOString().split("T")[0],
          endDate: endOfDay.toISOString().split("T")[0],
        };
      case "lastWeek":
        const lastWeekEnd = new Date(startOfDay);
        lastWeekEnd.setDate(startOfDay.getDate() - startOfDay.getDay() - 1);
        const lastWeekStart = new Date(lastWeekEnd);
        lastWeekStart.setDate(lastWeekEnd.getDate() - 6);
        return {
          startDate: lastWeekStart.toISOString().split("T")[0],
          endDate: lastWeekEnd.toISOString().split("T")[0],
        };
      case "thisMonth":
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        return {
          startDate: startOfMonth.toISOString().split("T")[0],
          endDate: endOfDay.toISOString().split("T")[0],
        };
      case "lastMonth":
        const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
        return {
          startDate: lastMonthStart.toISOString().split("T")[0],
          endDate: lastMonthEnd.toISOString().split("T")[0],
        };
      case "thisYear":
        const startOfYear = new Date(today.getFullYear(), 0, 1);
        return {
          startDate: startOfYear.toISOString().split("T")[0],
          endDate: endOfDay.toISOString().split("T")[0],
        };
      case "custom":
        return {
          startDate: customStartDate,
          endDate: customEndDate,
        };
      default:
        return {
          startDate: "",
          endDate: "",
        };
    }
  };

  // Load costs
  const loadCosts = async () => {
    try {
      setLoading(true);
      const dateRange = getDateRange(filterPeriod);
      
      const params: CostQueryParams = {
        page,
        limit,
        search: searchTerm || undefined,
        category: selectedCategory || undefined,
        startDate: dateRange.startDate || undefined,
        endDate: dateRange.endDate || undefined,
      };

      const response = await costApi.getAll(params);
      setCosts(response.costs);
      setTotalAmount(response.totalAmount);
      setTotal(response.total);
    } catch (error) {
      console.error("Error loading costs:", error);
      toast.error("Failed to load costs");
    } finally {
      setLoading(false);
    }
  };

  // Load categories
  const loadCategories = async () => {
    try {
      const categoriesData = await costApi.getCategories();
      setCategories(categoriesData);
    } catch (error) {
      console.error("Error loading categories:", error);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadCosts();
  }, [page, filterPeriod, searchTerm, selectedCategory, customStartDate, customEndDate]);

  // Handle form submission
  const handleSubmit = async (data: CreateCostDto | UpdateCostDto) => {
    try {
      if (editingCost) {
        await costApi.update(editingCost.id, data);
        toast.success("Cost updated successfully");
      } else {
        await costApi.create(data);
        toast.success("Cost created successfully");
      }
      
      setIsFormOpen(false);
      setEditingCost(undefined);
      loadCosts();
    } catch (error) {
      console.error("Error saving cost:", error);
      toast.error("Failed to save cost");
    }
  };

  // Handle edit
  const handleEdit = (cost: Cost) => {
    setEditingCost(cost);
    setIsFormOpen(true);
  };

  // Handle delete
  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this cost?")) return;
    
    try {
      await costApi.delete(id);
      toast.success("Cost deleted successfully");
      loadCosts();
    } catch (error) {
      console.error("Error deleting cost:", error);
      toast.error("Failed to delete cost");
    }
  };

  // Handle filter reset
  const handleResetFilters = () => {
    setSearchTerm("");
    setSelectedCategory("");
    setFilterPeriod("thisMonth");
    setCustomStartDate("");
    setCustomEndDate("");
  };

  // Pagination
  const totalPages = Math.ceil(total / limit);
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Cost Management</h1>
          <p className="text-gray-600">Track and manage pharmacy expenses</p>
        </div>
        <Button onClick={() => setIsFormOpen(true)} className="bg-emerald-600 hover:bg-emerald-700">
          <Plus className="h-4 w-4 mr-2" />
          Add Cost
        </Button>
      </div>

      {/* Filter Bar */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Time Period Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Time Period</label>
              <Select value={filterPeriod} onValueChange={(value: FilterPeriod) => setFilterPeriod(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="thisWeek">This Week</SelectItem>
                  <SelectItem value="lastWeek">Last Week</SelectItem>
                  <SelectItem value="thisMonth">This Month</SelectItem>
                  <SelectItem value="lastMonth">Last Month</SelectItem>
                  <SelectItem value="thisYear">This Year</SelectItem>
                  <SelectItem value="custom">Custom Date Range</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Category Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <Select value={selectedCategory || "all"} onValueChange={(value) => setSelectedCategory(value === "all" ? "" : value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Search */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search costs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Custom Date Range */}
            {filterPeriod === "custom" && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Date Range</label>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    placeholder="Start date"
                  />
                  <Input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    placeholder="End date"
                  />
                </div>
              </div>
            )}

            {/* Reset Filters */}
            <div className="flex items-end">
              <Button variant="outline" onClick={handleResetFilters} className="w-full">
                Reset Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Total Cost Summary */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DollarSign className="h-6 w-6 text-emerald-600" />
              <span className="text-lg font-medium">Total Cost ({filterPeriod === "custom" ? "Selected Period" : filterPeriod.replace(/([A-Z])/g, " $1").toLowerCase()})</span>
            </div>
            <div className="text-2xl font-bold text-emerald-600">
              {formatPrice(totalAmount)}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Costs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Costs ({total} total)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-8 text-center text-gray-500">
                      Loading costs...
                    </TableCell>
                  </TableRow>
                ) : costs.length > 0 ? (
                  costs.map((cost) => (
                    <TableRow key={cost.id}>
                      <TableCell>{formatDate(cost.costDate)}</TableCell>
                      <TableCell className="font-medium">{cost.description}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{cost.category}</Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatPrice(cost.amount)}
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {cost.notes || "-"}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(cost)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(cost.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="py-8 text-center text-gray-500">
                      No costs found for the selected period
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {total > limit && (
            <div className="flex items-center justify-between px-6 py-4 border-t">
              <div className="text-sm text-gray-500">
                Showing {startIndex + 1} to {Math.min(endIndex, total)} of {total} costs
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                  disabled={page === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = i + 1;
                    return (
                      <Button
                        key={pageNum}
                        variant={page === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => setPage(pageNum)}
                        className="w-8 h-8 p-0"
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={page === totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Cost Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingCost ? "Edit Cost" : "Add New Cost"}
            </DialogTitle>
          </DialogHeader>
          <CostForm
            initialData={editingCost}
            onSubmit={handleSubmit}
            onCancel={() => {
              setIsFormOpen(false);
              setEditingCost(undefined);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
