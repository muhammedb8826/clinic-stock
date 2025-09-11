"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supplierApi, purchaseOrderApi, CreatePurchaseOrderDto, Supplier, medicineApi } from "@/lib/api";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";

export default function CreatePurchaseOrderPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [supplierId, setSupplierId] = useState<string>("");
  const [orderDate, setOrderDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [expectedDate, setExpectedDate] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [items, setItems] = useState<Array<{ medicineId: number; quantity: number; unitPrice: number }>>([]);
  const [medicines, setMedicines] = useState<{ id: number; name: string }[]>([]);
  const [supplierModalOpen, setSupplierModalOpen] = useState(false);
  const [newSupplier, setNewSupplier] = useState<{ name: string; contactPerson?: string; email?: string; phone?: string }>(
    { name: "", contactPerson: "", email: "", phone: "" }
  );

  useEffect(() => {
    supplierApi.list().then(setSuppliers).catch(() => toast.error("Failed to load suppliers"));
    medicineApi.getAll({ page: 1, limit: 1000 }).then((r) => setMedicines(r.medicines.map(m => ({ id: m.id, name: m.name }))));
  }, []);

  const addItem = () => setItems((arr) => [...arr, { medicineId: medicines[0]?.id ?? 0, quantity: 1, unitPrice: 0 }]);
  const removeItem = (idx: number) => setItems((arr) => arr.filter((_, i) => i !== idx));

  const updateItem = (idx: number, patch: Partial<{ medicineId: number; quantity: number; unitPrice: number }>) =>
    setItems((arr) => arr.map((it, i) => (i === idx ? { ...it, ...patch } : it)));

  const onSubmit = async () => {
    try {
      if (!supplierId) return toast.error("Select supplier");
      if (items.length === 0) return toast.error("Add at least one item");
      const dto: CreatePurchaseOrderDto = {
        supplierId: Number(supplierId),
        orderDate,
        expectedDeliveryDate: expectedDate || undefined,
        notes: notes || undefined,
        items,
      };
      const po = await purchaseOrderApi.create(dto);
      toast.success(`PO ${po.orderNumber} created`);
    } catch {
      toast.error("Failed to create purchase order");
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card className="max-w-5xl mx-auto">
        <CardHeader>
          <CardTitle>New Purchase Order</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Supplier</Label>
              <div className="flex gap-2">
                <div className="flex-1">
                  <Select value={supplierId} onValueChange={setSupplierId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select supplier" />
                    </SelectTrigger>
                    <SelectContent>
                      {suppliers.map((s) => (
                        <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Dialog open={supplierModalOpen} onOpenChange={setSupplierModalOpen}>
                  <DialogTrigger asChild>
                    <Button type="button" variant="outline">New</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create Supplier</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <Label>Name *</Label>
                        <Input value={newSupplier.name} onChange={(e) => setNewSupplier({ ...newSupplier, name: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <Label>Contact Person</Label>
                        <Input value={newSupplier.contactPerson ?? ""} onChange={(e) => setNewSupplier({ ...newSupplier, contactPerson: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <Label>Email</Label>
                        <Input type="email" value={newSupplier.email ?? ""} onChange={(e) => setNewSupplier({ ...newSupplier, email: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <Label>Phone</Label>
                        <Input value={newSupplier.phone ?? ""} onChange={(e) => setNewSupplier({ ...newSupplier, phone: e.target.value })} />
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={() => setSupplierModalOpen(false)}>Cancel</Button>
                        <Button
                          type="button"
                          onClick={async () => {
                            if (!newSupplier.name.trim()) return toast.error("Supplier name is required");
                            try {
                              const s = await supplierApi.create({ name: newSupplier.name, contactPerson: newSupplier.contactPerson, email: newSupplier.email, phone: newSupplier.phone });
                              const list = await supplierApi.list();
                              setSuppliers(list);
                              setSupplierId(String(s.id));
                              setSupplierModalOpen(false);
                              setNewSupplier({ name: "", contactPerson: "", email: "", phone: "" });
                              toast.success("Supplier created");
                            } catch {
                              toast.error("Failed to create supplier");
                            }
                          }}
                        >
                          Save
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Order date</Label>
              <Input type="date" value={orderDate} onChange={(e) => setOrderDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Expected delivery</Label>
              <Input type="date" value={expectedDate} onChange={(e) => setExpectedDate(e.target.value)} />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Items</Label>
              <Button type="button" onClick={addItem}>Add Item</Button>
            </div>
            {items.length === 0 ? (
              <p className="text-sm text-muted-foreground">No items added.</p>
            ) : (
              <div className="space-y-3">
                {items.map((it, idx) => (
                  <div key={idx} className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
                    <div className="space-y-2 md:col-span-2">
                      <Label>Medicine</Label>
                      <Select value={String(it.medicineId)} onValueChange={(v) => updateItem(idx, { medicineId: Number(v) })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select medicine" />
                        </SelectTrigger>
                        <SelectContent>
                          {medicines.map((m) => (
                            <SelectItem key={m.id} value={String(m.id)}>{m.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Quantity</Label>
                      <Input type="number" min={1} value={it.quantity} onChange={(e) => updateItem(idx, { quantity: Number(e.target.value) })} />
                    </div>
                    <div className="space-y-2">
                      <Label>Unit Price</Label>
                      <Input type="number" min={0} step={0.01} value={it.unitPrice} onChange={(e) => updateItem(idx, { unitPrice: Number(e.target.value) })} />
                    </div>
                    <div className="flex gap-2 justify-end">
                      <Button type="button" variant="destructive" onClick={() => removeItem(idx)}>Remove</Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>Notes</Label>
            <Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional notes" />
          </div>

          <div className="flex justify-end">
            <Button onClick={onSubmit}>Create Purchase Order</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


