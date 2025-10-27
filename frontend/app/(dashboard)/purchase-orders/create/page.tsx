"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  purchaseOrderApi,
  CreatePurchaseOrderDto,
  PurchaseOrderStatus,
  medicineApi,
  Medicine,
  CreateMedicineDto,
  supplierApi,
  Supplier,
} from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Plus, Minus, ArrowLeft, Check, ChevronsUpDown } from "lucide-react";
import { toast } from "sonner";
import { MedicineForm } from "@/components/medicine-form";

interface PurchaseOrderItem {
  medicineId: number;
  quantity: number;
  unit?: string;
  medicine?: Medicine;
}

export default function CreatePurchaseOrderPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);

  const [formData, setFormData] = useState({
    supplierId: "",
    orderDate: new Date().toISOString().split("T")[0],
    expectedDeliveryDate: "",
    notes: "",
  });

  const [items, setItems] = useState<PurchaseOrderItem[]>([]);

  // Supplier creation modal state
  const [supplierModalOpen, setSupplierModalOpen] = useState(false);
  const [supplierForm, setSupplierForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });
  const [creatingSupplier, setCreatingSupplier] = useState(false);

  // Medicine creation modal state
  const [medicineModalOpen, setMedicineModalOpen] = useState(false);
  const [newMedicineData, setNewMedicineData] = useState<Partial<CreateMedicineDto> | null>(null);
  const [creatingMedicine, setCreatingMedicine] = useState(false);
  const [selectedItemIndex, setSelectedItemIndex] = useState<number | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [medicinesResponse, suppliersResponse] = await Promise.all([
        medicineApi.getAll({ page: 1, limit: 1000, isActive: true }),
        supplierApi.list(),
      ]);
      setMedicines(medicinesResponse.medicines || []);
      setSuppliers(suppliersResponse || []);
    } catch (error) {
      console.error("Failed to load data:", error);
      toast.error("Failed to load data");
    }
  };

  const addItem = () => setItems((prev) => [...prev, { medicineId: 0, quantity: 1 }]);
  const removeItem = (index: number) =>
    setItems((prev) => prev.filter((_, i) => i !== index));

  const updateItem = (
    index: number,
    field: keyof PurchaseOrderItem,
    value: string | number
  ) => {
    const next = [...items];
    next[index] = { ...next[index], [field]: value };

    if (field === "medicineId") {
      const med = medicines.find((m) => m.id === parseInt(String(value)));
      next[index].medicine = med;
      // Auto-populate unit from medicine if available
      if (med && (med as any).unit) {
        next[index].unit = (med as any).unit;
      }
    }
    setItems(next);
  };

  const handleSupplierCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingSupplier(true);
    try {
      const newSupplier = await supplierApi.create(supplierForm);
      setSuppliers((s) => [...s, newSupplier]);
      setFormData((f) => ({ ...f, supplierId: newSupplier.id.toString() }));
      setSupplierForm({ name: "", email: "", phone: "", address: "" });
      setSupplierModalOpen(false);
      toast.success("Supplier created and selected");
    } catch (error) {
      console.error("Failed to create supplier:", error);
      toast.error("Failed to create supplier");
    } finally {
      setCreatingSupplier(false);
    }
  };

  const handleNewMedicineClick = (index: number) => {
    const item = items[index];
    if (!item.medicine) return;

    // Set up the medicine form with pre-filled data
    setNewMedicineData({
      name: item.medicine.name,
      categoryId: item.medicine.categoryId,
      // Other fields will be filled by the user
    });
    setSelectedItemIndex(index);
    setMedicineModalOpen(true);
  };

  // Helper function to format medicine display name with expiry date
  const formatMedicineDisplayName = (medicine: Medicine): string => {
    if (medicine.expiryDate) {
      const expiry = new Date(medicine.expiryDate);
      const formattedExpiry = expiry.toLocaleDateString('en-GB', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric' 
      });
      return `${medicine.name} (Exp: ${formattedExpiry})`;
    }
    return medicine.name;
  };

  const handleMedicineSubmit = async (data: CreateMedicineDto | any) => {
    if (selectedItemIndex === null) return;
    
    setCreatingMedicine(true);
    try {
      // Create the new medicine
      const newMedicine = await medicineApi.create(data as CreateMedicineDto);
      console.log('Created medicine:', newMedicine);
      
      // Refresh the medicines list
      const medicinesResponse = await medicineApi.getAll({ page: 1, limit: 1000, isActive: true });
      setMedicines(medicinesResponse.medicines || []);
      
      // Update the item to use the new medicine with default values
      const updatedItems = [...items];
      const medicineUnit = (newMedicine as any).unit || "";
      
      console.log('Updating item at index:', selectedItemIndex);
      console.log('Previous item:', updatedItems[selectedItemIndex]);
      
      // Update the specific item with all necessary fields
      updatedItems[selectedItemIndex] = {
        medicineId: newMedicine.id,
        quantity: 1, // Set default quantity to 1
        unit: medicineUnit, // Auto-populate unit if available
        medicine: newMedicine, // Set the full medicine object
      };
      
      console.log('Updated item:', updatedItems[selectedItemIndex]);
      
      setItems(updatedItems);
      
      // Close modal and reset state
      setMedicineModalOpen(false);
      setNewMedicineData(null);
      setSelectedItemIndex(null);
      
      toast.success("New medicine created and added to order");
    } catch (error) {
      console.error("Failed to create medicine:", error);
      toast.error("Failed to create medicine");
    } finally {
      setCreatingMedicine(false);
    }
  };

  const handleMedicineCancel = () => {
    setMedicineModalOpen(false);
    setNewMedicineData(null);
    setSelectedItemIndex(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.supplierId) {
      toast.error("Please select a supplier");
      return;
    }
    if (items.length === 0) {
      toast.error("Please add at least one item");
      return;
    }
    if (items.some((it) => !it.medicineId || it.quantity <= 0)) {
      toast.error("Each item must have a valid medicine and quantity");
      return;
    }

    setLoading(true);
    try {
      const payload: CreatePurchaseOrderDto = {
        supplierId: parseInt(formData.supplierId),
        status: PurchaseOrderStatus.DRAFT,
        orderDate: formData.orderDate,
        expectedDeliveryDate:
          formData.expectedDeliveryDate || undefined,
        notes: formData.notes || undefined,
        items: items.map((it) => ({
          medicineId: it.medicineId,
          quantity: it.quantity,
        })),
      };

      await purchaseOrderApi.create(payload);
      toast.success("Purchase order created");
      router.push("/purchase-orders");
    } catch (error) {
      console.error("Failed to create purchase order:", error);
      toast.error("Failed to create purchase order");
    } finally {
      setLoading(false);
    }
  };

  const totalItems = items.reduce((sum, it) => sum + it.quantity, 0);

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create Purchase Order</h1>
        </div>
      </div>
      {/* subtle theme underline */}
      <div className="h-[3px] w-full bg-gradient-to-r from-emerald-400 via-blue-500 to-emerald-400 rounded-full" />

      {/* Supplier Modal */}
      <Dialog open={supplierModalOpen} onOpenChange={setSupplierModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Supplier</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSupplierCreate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="supplierName">Company Name *</Label>
              <Input
                id="supplierName"
                value={supplierForm.name}
                onChange={(e) =>
                  setSupplierForm({ ...supplierForm, name: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="supplierEmail">Email</Label>
              <Input
                id="supplierEmail"
                type="email"
                value={supplierForm.email}
                onChange={(e) =>
                  setSupplierForm({ ...supplierForm, email: e.target.value })
                }
                placeholder="name@company.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="supplierPhone">Phone</Label>
              <Input
                id="supplierPhone"
                value={supplierForm.phone}
                onChange={(e) =>
                  setSupplierForm({ ...supplierForm, phone: e.target.value })
                }
                placeholder="+251..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="supplierAddress">Address</Label>
              <Textarea
                id="supplierAddress"
                value={supplierForm.address}
                onChange={(e) =>
                  setSupplierForm({ ...supplierForm, address: e.target.value })
                }
                rows={3}
                placeholder="City, Sub-city, ..."
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setSupplierModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={creatingSupplier}
                className="bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700"
              >
                {creatingSupplier ? "Creating..." : "Create Supplier"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Medicine Creation Modal */}
      <Dialog open={medicineModalOpen} onOpenChange={setMedicineModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Medicine Variant</DialogTitle>
          </DialogHeader>
          
          {newMedicineData && (
            <MedicineForm
              initialData={{
                id: 0,
                name: newMedicineData.name || "",
                categoryId: newMedicineData.categoryId || 0,
              } as Medicine}
              onSubmit={handleMedicineSubmit}
              onCancel={handleMedicineCancel}
            />
          )}
        </DialogContent>
      </Dialog>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Order Details */}
        <Card className="overflow-hidden">
          <div className="h-1 w-full bg-gradient-to-r from-emerald-400 via-blue-500 to-emerald-400" />
          <CardHeader className="pb-2">
            <CardTitle>Order Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="supplierId">Supplier *</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setSupplierModalOpen(true)}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Supplier
                  </Button>
                </div>
                <Select
                  value={formData.supplierId}
                  onValueChange={(value) =>
                    setFormData((f) => ({ ...f, supplierId: value }))
                  }
                >
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Select supplier" />
                  </SelectTrigger>
                  <SelectContent>
                    {suppliers.map((s) => (
                      <SelectItem key={s.id} value={s.id.toString()}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="orderDate">Order Date *</Label>
                <Input
                  id="orderDate"
                  type="date"
                  value={formData.orderDate}
                  onChange={(e) =>
                    setFormData((f) => ({ ...f, orderDate: e.target.value }))
                  }
                  required
                  className="h-10"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="expectedDeliveryDate">
                  Expected Delivery Date
                </Label>
                <Input
                  id="expectedDeliveryDate"
                  type="date"
                  value={formData.expectedDeliveryDate}
                  onChange={(e) =>
                    setFormData((f) => ({
                      ...f,
                      expectedDeliveryDate: e.target.value,
                    }))
                  }
                  className="h-10"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData((f) => ({ ...f, notes: e.target.value }))
                  }
                  placeholder="Optional notes for this PO"
                  rows={3}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Order Items */}
        <Card className="overflow-hidden">
          <div className="h-1 w-full bg-gradient-to-r from-emerald-400 via-blue-500 to-emerald-400" />
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle>Order Items</CardTitle>
              <Button type="button" onClick={addItem} variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {items.length === 0 ? (
              <div className="text-center py-10 text-gray-500">
                No items added yet. Click <span className="font-medium">Add Item</span> to begin.
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item, index) => (
                  <div
                    key={index}
                    className="flex flex-col gap-3 md:flex-row md:items-start md:gap-4 p-4 rounded-lg border bg-white"
                  >
                    <div className="flex-1">
                      <Label className="sr-only">Medicine</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            className="w-full justify-between h-10"
                          >
                            {item.medicine
                              ? formatMedicineDisplayName(item.medicine)
                              : "Select medicine..."}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[400px] p-0">
                          <Command>
                            <CommandInput placeholder="Search medicine..." />
                            <CommandList>
                              <CommandEmpty>No medicine found.</CommandEmpty>
                              <CommandGroup>
                                {medicines.map((m) => (
                                  <CommandItem
                                    key={m.id}
                                    value={formatMedicineDisplayName(m)}
                                    onSelect={() => {
                                      updateItem(index, "medicineId", m.id);
                                    }}
                                  >
                                    <Check
                                      className={`mr-2 h-4 w-4 ${
                                        item.medicineId === m.id
                                          ? "opacity-100"
                                          : "opacity-0"
                                      }`}
                                    />
                                    {formatMedicineDisplayName(m)}
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>

                      {item.medicine && (
                        <div className="mt-2 flex items-center justify-between">
                          <div className="text-sm text-gray-600">
                            <Badge variant="outline" className="mr-2">
                              {item.medicine.category?.name || "No Category"}
                            </Badge>
                            <span>
                              Stock:{" "}
                              <span
                                className={
                                  item.medicine.quantity <= 10
                                    ? "text-amber-700 font-medium"
                                    : "text-emerald-700 font-medium"
                                }
                              >
                                {item.medicine.quantity}
                              </span>
                            </span>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleNewMedicineClick(index)}
                            className="text-xs"
                          >
                            New Medicine?
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* Unit field */}
                    <div className="w-full md:w-32">
                      <Label htmlFor={`unit-${index}`}>Unit</Label>
                      <Input
                        id={`unit-${index}`}
                        value={item.unit || ""}
                        onChange={(e) =>
                          updateItem(index, "unit", e.target.value)
                        }
                        placeholder="e.g., tablet, ml"
                        className="h-10"
                      />
                    </div>

                    <div className="w-full md:w-40">
                      <Label htmlFor={`qty-${index}`}>Quantity</Label>
                      <Input
                        id={`qty-${index}`}
                        type="number"
                        min={1}
                        value={item.quantity}
                        onChange={(e) =>
                          updateItem(
                            index,
                            "quantity",
                            parseInt(e.target.value) || 1
                          )
                        }
                        className="h-10"
                      />
                    </div>

                    <div className="md:pt-6">
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => removeItem(index)}
                        aria-label="Remove item"
                        title="Remove item"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}

                <div className="flex items-center justify-between pt-4 border-t">
                  <span className="font-medium">Total Items: {totalItems}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700"
          >
            {loading ? "Creating..." : "Create Purchase Order"}
          </Button>
        </div>
      </form>
    </div>
  );
}
