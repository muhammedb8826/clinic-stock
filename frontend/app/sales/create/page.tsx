"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CreateSaleDto, salesApi, medicineApi } from "@/lib/api";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function CreateSalePage() {
  const router = useRouter();
  const [medicines, setMedicines] = useState<{ id: number; name: string; defaultPrice: number }[]>([]);
  const [saleDate, setSaleDate] = useState<string>(new Date().toISOString().slice(0,10));
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [discount, setDiscount] = useState(0);
  const [tax, setTax] = useState(0);
  const [items, setItems] = useState<Array<{ medicineId: number; quantity: number; unitPrice: number }>>([]);

  useEffect(() => {
    medicineApi.getAll({ page: 1, limit: 1000 }).then(r => setMedicines(r.medicines.map(m => ({ id: m.id, name: m.name, defaultPrice: 0 }))));
  }, []);

  const addItem = () => setItems(arr => [...arr, { medicineId: medicines[0]?.id ?? 0, quantity: 1, unitPrice: 0 }]);
  const removeItem = (idx: number) => setItems(arr => arr.filter((_,i)=>i!==idx));
  const updateItem = (idx: number, patch: Partial<{ medicineId: number; quantity: number; unitPrice: number }>) => setItems(arr => arr.map((it,i)=> i===idx? { ...it, ...patch } : it));

  const onSubmit = async () => {
    try {
      if (items.length === 0) return toast.error('Add at least one item');
      const dto: CreateSaleDto = { saleDate, customerName: customerName || undefined, customerPhone: customerPhone || undefined, discount, tax, items };
      const s = await salesApi.create(dto);
      toast.success(`Sale ${s.saleNumber} created`);
      router.push('/sales');
    } catch {
      toast.error('Failed to create sale');
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card className="max-w-5xl mx-auto">
        <CardHeader><CardTitle>New Sale</CardTitle></CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Date</Label>
              <Input type="date" value={saleDate} onChange={(e)=>setSaleDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Customer</Label>
              <Input value={customerName} onChange={(e)=>setCustomerName(e.target.value)} placeholder="Optional" />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input value={customerPhone} onChange={(e)=>setCustomerPhone(e.target.value)} placeholder="Optional" />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between"><Label>Items</Label><Button type="button" onClick={addItem}>Add Item</Button></div>
            {items.length === 0 ? (
              <p className="text-sm text-muted-foreground">No items.</p>
            ) : (
              <div className="space-y-3">
                {items.map((it, idx) => (
                  <div key={idx} className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
                    <div className="space-y-2 md:col-span-2">
                      <Label>Medicine</Label>
                      <Select value={String(it.medicineId)} onValueChange={(v) => updateItem(idx, { medicineId: Number(v) })}>
                        <SelectTrigger><SelectValue placeholder="Select medicine" /></SelectTrigger>
                        <SelectContent>
                          {medicines.map((m) => (<SelectItem key={m.id} value={String(m.id)}>{m.name}</SelectItem>))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2"><Label>Qty</Label><Input type="number" min={1} value={it.quantity} onChange={(e)=>updateItem(idx,{ quantity: Number(e.target.value)})} /></div>
                    <div className="space-y-2"><Label>Unit Price</Label><Input type="number" min={0} step={0.01} value={it.unitPrice} onChange={(e)=>updateItem(idx,{ unitPrice: Number(e.target.value)})} /></div>
                    <div className="flex justify-end"><Button type="button" variant="destructive" onClick={()=>removeItem(idx)}>Remove</Button></div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2"><Label>Discount</Label><Input type="number" min={0} step={0.01} value={discount} onChange={(e)=>setDiscount(Number(e.target.value))} /></div>
            <div className="space-y-2"><Label>Tax</Label><Input type="number" min={0} step={0.01} value={tax} onChange={(e)=>setTax(Number(e.target.value))} /></div>
          </div>

          <div className="flex justify-end"><Button onClick={onSubmit}>Create Sale</Button></div>
        </CardContent>
      </Card>
    </div>
  );
}


