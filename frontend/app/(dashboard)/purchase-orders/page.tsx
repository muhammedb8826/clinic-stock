"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  purchaseOrderApi,
  PurchaseOrder,
  PurchaseOrderStatus,
} from "@/lib/api";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Search, Eye } from "lucide-react";
import { toast } from "sonner";

/* ---------- helpers ---------- */

const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString("en-ET");

const getTotalItems = (order: PurchaseOrder) =>
  order.items.reduce((sum, item) => sum + item.quantity, 0);

const statusChip = (status: PurchaseOrderStatus) => {
  switch (status) {
    case PurchaseOrderStatus.DRAFT:
      return "border-slate-200 bg-slate-50 text-slate-700";
    case PurchaseOrderStatus.ORDERED:
      return "border-blue-200 bg-blue-50 text-blue-700";
    case PurchaseOrderStatus.RECEIVED:
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    case PurchaseOrderStatus.CANCELLED:
      return "border-red-200 bg-red-50 text-red-700";
    default:
      return "border-gray-200 bg-gray-50 text-gray-700";
  }
};

export default function PurchaseOrdersPage() {
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<PurchaseOrderStatus | "all">(
    "all"
  );

  useEffect(() => {
    loadPurchaseOrders();
  }, []);

  const loadPurchaseOrders = async () => {
    setLoading(true);
    try {
      const response = await purchaseOrderApi.list({ page: 1, limit: 1000 });
      setPurchaseOrders(response.purchaseOrders);
    } catch (error) {
      console.error("Failed to load purchase orders:", error);
      toast.error("Failed to load purchase orders");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id: number, status: PurchaseOrderStatus) => {
    try {
      await purchaseOrderApi.updateStatus(id, status);
      toast.success("Purchase order status updated");
      loadPurchaseOrders();
    } catch (error) {
      console.error("Failed to update status:", error);
      toast.error("Failed to update purchase order status");
    }
  };

  const filteredPurchaseOrders = purchaseOrders.filter((order) => {
    const q = searchTerm.trim().toLowerCase();
    const matchesSearch =
      !q ||
      order.orderNumber.toLowerCase().includes(q) ||
      order.notes?.toLowerCase().includes(q) ||
      String(order.supplierId).toLowerCase().includes(q);
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Page header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Purchases</h1>
        </div>
        <Link href="/purchase-orders/create">
          <Button className="bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700">
            <Plus className="mr-2 h-4 w-4" />
            Create Purchase Order
          </Button>
        </Link>
      </div>
      {/* subtle gradient underline */}
      <div className="h-[3px] w-full bg-gradient-to-r from-emerald-400 via-blue-500 to-emerald-400 rounded-full" />

      {/* existing toolbar (kept), themed */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search order #, supplier, notes…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 h-9"
          />
        </div>

        <Select
          value={statusFilter}
          onValueChange={(value) =>
            setStatusFilter(value as PurchaseOrderStatus | "all")
          }
        >
          <SelectTrigger className="w-[190px] h-9">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value={PurchaseOrderStatus.DRAFT}>Draft</SelectItem>
            <SelectItem value={PurchaseOrderStatus.ORDERED}>Ordered</SelectItem>
            <SelectItem value={PurchaseOrderStatus.RECEIVED}>Received</SelectItem>
            <SelectItem value={PurchaseOrderStatus.CANCELLED}>Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* table */}
      <div className="rounded-md border overflow-hidden">
        {/* theme accent bar */}
        <div className="w-full bg-gradient-to-r from-emerald-400 via-blue-500 to-emerald-400" />
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="whitespace-nowrap">Order Number</TableHead>
              <TableHead className="whitespace-nowrap">Supplier ID</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="whitespace-nowrap">Order Date</TableHead>
              <TableHead className="whitespace-nowrap">Expected Delivery</TableHead>
              <TableHead className="whitespace-nowrap">Total Items</TableHead>
              <TableHead>Notes</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="py-8 text-center text-gray-500">
                  Loading purchase orders…
                </TableCell>
              </TableRow>
            ) : filteredPurchaseOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="py-10">
                  <div className="text-center">
                    <p className="font-medium text-gray-700">
                      No purchase orders found
                    </p>
                    <p className="text-sm text-gray-500">
                      Try adjusting filters or create a new order.
                    </p>
                    <div className="mt-4">
                      <Link href="/purchase-orders/create">
                        <Button className="bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700">
                          <Plus className="mr-2 h-4 w-4" />
                          Create Purchase Order
                        </Button>
                      </Link>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredPurchaseOrders.map((order) => (
                <TableRow key={order.id} className="hover:bg-gray-50">
                  <TableCell className="font-medium">
                    {order.orderNumber}
                  </TableCell>
                  <TableCell>{order.supplierId}</TableCell>
                  <TableCell>
                    <Badge className={`border ${statusChip(order.status)}`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">
                    {formatDate(order.orderDate)}
                  </TableCell>
                  <TableCell className="text-sm">
                    {order.expectedDeliveryDate
                      ? formatDate(order.expectedDeliveryDate)
                      : "N/A"}
                  </TableCell>
                  <TableCell className="font-medium">
                    {getTotalItems(order)}
                  </TableCell>
                  <TableCell className="max-w-xs truncate text-sm text-gray-500">
                    {order.notes || "No notes"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0"
                        title="View Details"
                        asChild
                      >
                        <Link href={`/purchase-orders/${order.id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>

                      {/* inline status changer */}
                      <Select
                        value={order.status}
                        onValueChange={(value) => {
                          if (value !== order.status) {
                            if (value === PurchaseOrderStatus.CANCELLED) {
                              if (
                                confirm(
                                  "Are you sure you want to cancel this order?"
                                )
                              ) {
                                handleStatusUpdate(
                                  order.id,
                                  value as PurchaseOrderStatus
                                );
                              }
                            } else {
                              handleStatusUpdate(
                                order.id,
                                value as PurchaseOrderStatus
                              );
                            }
                          }
                        }}
                      >
                        <SelectTrigger className="w-[128px] h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={PurchaseOrderStatus.DRAFT}>
                            Draft
                          </SelectItem>
                          <SelectItem value={PurchaseOrderStatus.ORDERED}>
                            Ordered
                          </SelectItem>
                          <SelectItem value={PurchaseOrderStatus.RECEIVED}>
                            Received
                          </SelectItem>
                          <SelectItem value={PurchaseOrderStatus.CANCELLED}>
                            Cancelled
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
