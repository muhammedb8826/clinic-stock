"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { purchaseOrderApi, PurchaseOrder, PurchaseOrderStatus } from "@/lib/api";
import { toast } from "sonner";

export default function PurchaseOrdersPage() {
  const [data, setData] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [receiveOpenId, setReceiveOpenId] = useState<number | null>(null);
  const [receiveItems, setReceiveItems] = useState<Array<{ purchaseOrderItemId: number; quantityReceived: number; batchNumber: string; expiryDate: string; unitPrice: number; sellingPrice: number }>>([]);
  const [receiveDate, setReceiveDate] = useState<string>(new Date().toISOString().slice(0,10));

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

  const openReceive = async (poId: number) => {
    try {
      const po = await purchaseOrderApi.get(poId);
      setReceiveItems(po.items.map(it => ({
        purchaseOrderItemId: it.id,
        quantityReceived: it.quantity,
        batchNumber: '',
        expiryDate: '',
        unitPrice: Number(it.unitPrice),
        sellingPrice: Number(it.unitPrice),
      })));
      setReceiveDate(new Date().toISOString().slice(0,10));
      setReceiveOpenId(poId);
    } catch {
      toast.error("Failed to load purchase order");
    }
  };

  const submitReceive = async () => {
    if (!receiveOpenId) return;
    try {
      await purchaseOrderApi.receive(receiveOpenId, { receivedDate: receiveDate, items: receiveItems });
      toast.success("Purchase order received");
      setReceiveOpenId(null);
      reload();
    } catch {
      toast.error("Failed to receive purchase order");
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
              <TableHead>Total</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8 text-gray-500">Loading...</TableCell></TableRow>
            ) : data.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8 text-gray-500">No purchase orders</TableCell></TableRow>
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
                  <TableCell>{Number(po.totalAmount).toFixed(2)}</TableCell>
                  <TableCell className="text-right">
                    <Dialog open={receiveOpenId === po.id} onOpenChange={(o) => setReceiveOpenId(o ? po.id : null)}>
                      <DialogTrigger asChild>
                        <Button size="sm" disabled={po.status === PurchaseOrderStatus.RECEIVED} onClick={() => openReceive(po.id)}>
                          Receive
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-3xl">
                        <DialogHeader>
                          <DialogTitle>Receive {po.orderNumber}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <label className="text-sm">Received Date</label>
                            <Input type="date" value={receiveDate} onChange={(e) => setReceiveDate(e.target.value)} />
                          </div>
                          {receiveItems.map((it, idx) => (
                            <div key={it.purchaseOrderItemId} className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
                              <div className="space-y-1">
                                <label className="text-sm">Qty</label>
                                <Input type="number" min={1} value={it.quantityReceived} onChange={(e) => setReceiveItems(arr => arr.map((x,i)=> i===idx?{...x, quantityReceived: Number(e.target.value)}:x))} />
                              </div>
                              <div className="space-y-1">
                                <label className="text-sm">Batch</label>
                                <Input value={it.batchNumber} onChange={(e) => setReceiveItems(arr => arr.map((x,i)=> i===idx?{...x, batchNumber: e.target.value}:x))} />
                              </div>
                              <div className="space-y-1">
                                <label className="text-sm">Expiry</label>
                                <Input type="date" value={it.expiryDate} onChange={(e) => setReceiveItems(arr => arr.map((x,i)=> i===idx?{...x, expiryDate: e.target.value}:x))} />
                              </div>
                              <div className="space-y-1">
                                <label className="text-sm">Unit Price</label>
                                <Input type="number" min={0} step={0.01} value={it.unitPrice} onChange={(e) => setReceiveItems(arr => arr.map((x,i)=> i===idx?{...x, unitPrice: Number(e.target.value)}:x))} />
                              </div>
                              <div className="space-y-1">
                                <label className="text-sm">Selling Price</label>
                                <Input type="number" min={0} step={0.01} value={it.sellingPrice} onChange={(e) => setReceiveItems(arr => arr.map((x,i)=> i===idx?{...x, sellingPrice: Number(e.target.value)}:x))} />
                              </div>
                            </div>
                          ))}
                          <div className="flex justify-end">
                            <Button onClick={submitReceive}>Confirm Receive</Button>
                          </div>
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
    </div>
  );
}


