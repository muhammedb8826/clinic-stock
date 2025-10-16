"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { PurchaseOrder, PurchaseOrderStatus, PaymentStatus, Medicine } from "@/lib/api";
import { medicineApi } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";

interface PurchaseOrderModalProps {
  order: PurchaseOrder | null;
  isOpen: boolean;
  onClose: () => void;
}

export function PurchaseOrderModal({ order, isOpen, onClose }: PurchaseOrderModalProps) {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (order && order.items.length > 0) {
      loadMedicines();
    }
  }, [order]);

  const loadMedicines = async () => {
    if (!order) return;
    
    setLoading(true);
    try {
      const medicineIds = order.items.map(item => item.medicineId);
      const medicinePromises = medicineIds.map(id => medicineApi.get(id));
      const medicineResults = await Promise.all(medicinePromises);
      setMedicines(medicineResults);
    } catch (error) {
      console.error("Failed to load medicines:", error);
    } finally {
      setLoading(false);
    }
  };

  const getMedicineById = (id: number) => {
    return medicines.find(med => med.id === id);
  };

  const getTotalCost = () => {
    if (!order) return 0;
    return order.items.reduce((total, item) => {
      const medicine = getMedicineById(item.medicineId);
      const costPerUnit = medicine?.costPrice || 0;
      return total + (costPerUnit * item.quantity);
    }, 0);
  };

  const getTotalItems = () => {
    if (!order) return 0;
    return order.items.reduce((total, item) => total + item.quantity, 0);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-ET");
  };

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

  const paymentStatusChip = (status: PaymentStatus) => {
    switch (status) {
      case PaymentStatus.PAID:
        return "border-green-200 bg-green-50 text-green-700";
      case PaymentStatus.UNPAID:
        return "border-orange-200 bg-orange-50 text-orange-700";
      default:
        return "border-gray-200 bg-gray-50 text-gray-700";
    }
  };

  if (!order) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            Purchase Order Details - {order.orderNumber}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Order Number</label>
                  <p className="text-lg font-semibold">{order.orderNumber}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Supplier</label>
                  <p className="text-lg">{order.supplier?.name || `Supplier ID: ${order.supplierId}`}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Order Date</label>
                  <p className="text-lg">{formatDate(order.orderDate)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Expected Delivery</label>
                  <p className="text-lg">
                    {order.expectedDeliveryDate ? formatDate(order.expectedDeliveryDate) : "Not specified"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Received Date</label>
                  <p className="text-lg">
                    {order.receivedDate ? formatDate(order.receivedDate) : "Not received"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Invoice Number</label>
                  <p className="text-lg">{order.invoiceNumber || "Not provided"}</p>
                </div>
              </div>

              <Separator />

              <div className="flex gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Status</label>
                  <div className="mt-1">
                    <Badge className={`border ${statusChip(order.status)}`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Payment Status</label>
                  <div className="mt-1">
                    <Badge className={`border ${paymentStatusChip(order.paymentStatus)}`}>
                      {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                    </Badge>
                  </div>
                </div>
              </div>

              {order.notes && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Notes</label>
                  <p className="text-lg mt-1">{order.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Items Table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Order Items</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">Loading items...</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Medicine</TableHead>
                      <TableHead className="text-right">Quantity</TableHead>
                      <TableHead className="text-right">Unit Cost</TableHead>
                      <TableHead className="text-right">Total Cost</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {order.items.map((item) => {
                      const medicine = getMedicineById(item.medicineId);
                      const unitCost = medicine?.costPrice || 0;
                      const totalCost = unitCost * item.quantity;

                      return (
                        <TableRow key={item.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{medicine?.name || `Medicine ID: ${item.medicineId}`}</p>
                              {medicine?.genericName && (
                                <p className="text-sm text-gray-500">{medicine.genericName}</p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {item.quantity}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(unitCost)}
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {formatCurrency(totalCost)}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Order Totals */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-center">
                <div className="text-lg font-medium">
                  Total Items: {getTotalItems()}
                </div>
                <div className="text-2xl font-bold text-emerald-600">
                  Total Cost: {formatCurrency(getTotalCost())}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
