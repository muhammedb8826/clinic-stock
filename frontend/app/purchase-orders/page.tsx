"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { purchaseOrderApi, PurchaseOrder, PurchaseOrderStatus } from "@/lib/api";
import { toast } from "sonner";

export default function PurchaseOrdersPage() {
  const [data, setData] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = () => purchaseOrderApi.list({ page: 1, limit: 20 }).then((res) => setData(res.purchaseOrders)).finally(() => setLoading(false));

  useEffect(() => { reload(); }, []);

  const onChangeStatus = async (id: number, status: PurchaseOrderStatus) => {
    try {
      await purchaseOrderApi.updateStatus(id, status);
      toast.success("Status updated");
      reload();
    } catch {
      toast.error("Failed to update status");
    }
  };


  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Purchase Orders</h1>
        <Link href="/purchase-orders/create">
          <Button>New Purchase Order</Button>
        </Link>
      </div>

      <div className="overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order #</TableHead>
              <TableHead>Supplier</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Order Date</TableHead>
              <TableHead>Expected</TableHead>
              <TableHead>Received</TableHead>
              <TableHead>Items</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={7} className="text-center py-8 text-gray-500">Loading...</TableCell></TableRow>
            ) : data.length === 0 ? (
              <TableRow><TableCell colSpan={7} className="text-center py-8 text-gray-500">No purchase orders</TableCell></TableRow>
            ) : (
              data.map((po) => (
                <TableRow key={po.id}>
                  <TableCell className="font-medium">{po.orderNumber}</TableCell>
                  <TableCell>{(po as unknown as { supplier?: { name: string } }).supplier?.name ?? '-'}</TableCell>
                  <TableCell>
                    <Select value={po.status} onValueChange={(v) => onChangeStatus(po.id, v as PurchaseOrderStatus)}>
                      <SelectTrigger className="w-[140px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={PurchaseOrderStatus.DRAFT}>draft</SelectItem>
                        <SelectItem value={PurchaseOrderStatus.ORDERED}>ordered</SelectItem>
                        <SelectItem value={PurchaseOrderStatus.RECEIVED} disabled={po.status === PurchaseOrderStatus.RECEIVED}>received</SelectItem>
                        <SelectItem value={PurchaseOrderStatus.CANCELLED}>cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>{po.orderDate?.slice(0,10)}</TableCell>
                  <TableCell>{po.expectedDeliveryDate?.slice(0,10) ?? '-'}</TableCell>
                  <TableCell>{po.receivedDate?.slice(0,10) ?? '-'}</TableCell>
                  <TableCell>{po.items?.length ?? 0}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}


