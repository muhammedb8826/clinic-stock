"use client";

import { useState, useEffect, useMemo } from "react";
import {
  medicineApi,
  Medicine,
  salesApi,
  CreateSaleDto,
  customerApi,
  Customer,
} from "@/lib/api";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

import {
  Plus,
  Minus,
  ShoppingCart,
  User,
  Search as SearchIcon,
  Package,
} from "lucide-react";

/* ------------------------- Types ------------------------- */

interface SaleItem {
  medicineId: number;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  medicine?: Medicine;
}

/* ------------------------- Utils ------------------------- */

const formatETB = (price: number) =>
  new Intl.NumberFormat("en-ET", { style: "currency", currency: "ETB" }).format(
    Number(price) || 0
  );

/* ------------------------- Page ------------------------- */

export default function SalesPage() {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);

  // Customer
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerName, setCustomerName] = useState("");
  const [customerSearchTerm, setCustomerSearchTerm] = useState("");
  const [newCustomerModalOpen, setNewCustomerModalOpen] = useState(false);
  const [newCustomerForm, setNewCustomerForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });

  // Payment
  const [paymentMethod, setPaymentMethod] = useState("cash");

  // Items
  const [saleItems, setSaleItems] = useState<SaleItem[]>([]);

  // Search
  const [medicineSearchTerm, setMedicineSearchTerm] = useState("");

  /* ------------------------- Data Load ------------------------- */

  useEffect(() => {
    (async () => {
      try {
        const [mRes, cRes] = await Promise.all([
          medicineApi.getAll({ page: 1, limit: 1000, isActive: true }),
          customerApi.list(),
        ]);
        setMedicines(mRes.medicines || []);
        setCustomers(cRes || []);
      } catch {
        toast.error("Failed to load data");
      }
    })();
  }, []);

  /* ------------------------- Derived ------------------------- */

  const filteredMedicines = useMemo(
    () =>
      medicines.filter(
        (m) =>
          m.quantity > 0 &&
          m.name.toLowerCase().includes(medicineSearchTerm.toLowerCase())
      ),
    [medicines, medicineSearchTerm]
  );

  const filteredCustomers = useMemo(
    () =>
      customers.filter(
        (c) =>
          c.name.toLowerCase().includes(customerSearchTerm.toLowerCase()) ||
          c.phone?.includes(customerSearchTerm) ||
          c.email?.toLowerCase().includes(customerSearchTerm.toLowerCase())
      ),
    [customers, customerSearchTerm]
  );

  const totalAmount = saleItems.reduce(
    (sum, it) => sum + (Number(it.totalPrice) || 0),
    0
  );

  /* ------------------------- Handlers ------------------------- */

  const addMedicineToSale = (medicine: Medicine) => {
    const existing = saleItems.find((it) => it.medicineId === medicine.id);

    if (existing) {
      if (existing.quantity < medicine.quantity) {
        updateItemQuantity(medicine.id, existing.quantity + 1);
      } else {
        toast.error("Not enough stock available");
      }
      return;
    }

    const unitPrice = Number(medicine.sellingPrice) || 0;
    setSaleItems((prev) => [
      ...prev,
      {
        medicineId: medicine.id,
        quantity: 1,
        unitPrice,
        totalPrice: unitPrice,
        medicine,
      },
    ]);
  };

  const updateItemQuantity = (medicineId: number, quantity: number) => {
    const med = medicines.find((m) => m.id === medicineId);
    if (!med) return;

    if (quantity < 1) return;
    if (quantity > med.quantity) {
      toast.error("Not enough stock available");
      return;
    }

    setSaleItems((prev) =>
      prev.map((it) =>
        it.medicineId === medicineId
          ? {
              ...it,
              quantity,
              totalPrice: Number(it.unitPrice) * quantity,
            }
          : it
      )
    );
  };

  const removeItem = (medicineId: number) =>
    setSaleItems((prev) => prev.filter((it) => it.medicineId !== medicineId));

  const handleCustomerSelect = (customerId: string) => {
    if (customerId === "walk-in") {
      setSelectedCustomer(null);
      setCustomerName("");
      setCustomerSearchTerm("");
      return;
    }
    const customer = customers.find((c) => c.id.toString() === customerId) || null;
    setSelectedCustomer(customer);
    setCustomerName(customer?.name || "");
    setCustomerSearchTerm("");
  };

  const handleCustomerNameChange = (name: string) => {
    setCustomerName(name);
    if (name && selectedCustomer) setSelectedCustomer(null);
  };

  const handleCreateNewCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const created = await customerApi.create(newCustomerForm);
      setCustomers((prev) => [...prev, created]);
      setSelectedCustomer(created);
      setCustomerName(created.name);
      setNewCustomerModalOpen(false);
      setNewCustomerForm({ name: "", email: "", phone: "", address: "" });
      setCustomerSearchTerm("");
      toast.success("New customer created and selected");
    } catch {
      toast.error("Failed to create customer");
    }
  };

  const processSale = async () => {
    if (saleItems.length === 0) {
      toast.error("Please add items to the sale");
      return;
    }
    if (!customerName.trim()) {
      toast.error("Please enter customer name");
      return;
    }

    setLoading(true);
    try {
      const payload: CreateSaleDto = {
        saleDate: new Date().toISOString(),
        customerName: customerName.trim(),
        items: saleItems.map((it) => ({
          medicineId: it.medicineId,
          quantity: it.quantity,
          unitPrice: Number(it.unitPrice),
        })),
      };

      await salesApi.create(payload);
      toast.success(`Sale completed! Payment: ${paymentMethod}`);

      // Refresh medicines (stock changed)
      const mRes = await medicineApi.getAll({
        page: 1,
        limit: 1000,
        isActive: true,
      });
      setMedicines(mRes.medicines || []);

      // Reset
      setSaleItems([]);
      setSelectedCustomer(null);
      setCustomerName("");
      setCustomerSearchTerm("");
      setPaymentMethod("cash");
    } catch {
      toast.error("Failed to process sale");
    } finally {
      setLoading(false);
    }
  };

  /* ------------------------- UI ------------------------- */

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">New Sale</h1>
        <p className="text-sm text-gray-500">
          Add items, choose customer, and complete checkout.
        </p>
      </div>
      <div className="h-[3px] w-full bg-gradient-to-r from-emerald-400 via-blue-500 to-emerald-400 rounded-full" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Medicines */}
        <Card className="lg:col-span-2 overflow-hidden">
          <div className="h-1 w-full bg-gradient-to-r from-emerald-400 via-blue-500 to-emerald-400" />
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Package className="h-5 w-5 text-emerald-600" />
                Select Medicines
              </span>
            </CardTitle>
            <div className="relative mt-3">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search medicines…"
                value={medicineSearchTerm}
                onChange={(e) => setMedicineSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </CardHeader>

          <CardContent>
            {filteredMedicines.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                No medicines found. Adjust your search.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-auto">
                {filteredMedicines.map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center justify-between p-3 border rounded-lg bg-white hover:shadow-sm"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{m.name}</div>
                      <div className="text-xs text-gray-500">
                        Stock:{" "}
                        <span
                          className={
                            m.quantity <= 10
                              ? "text-amber-700 font-medium"
                              : "text-emerald-700 font-medium"
                          }
                        >
                          {m.quantity}
                        </span>{" "}
                        • {formatETB(Number(m.sellingPrice))}
                      </div>
                      {m.category?.name && (
                        <div className="mt-1">
                          <Badge variant="outline" className="text-xs">
                            {m.category.name}
                          </Badge>
                        </div>
                      )}
                    </div>
                    <Button
                      size="sm"
                      onClick={() => addMedicineToSale(m)}
                      disabled={m.quantity === 0}
                      className="bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Customer + Cart */}
        <Card className="overflow-hidden">
          <div className="h-1 w-full bg-gradient-to-r from-emerald-400 via-blue-500 to-emerald-400" />
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center">
              <User className="h-5 w-5 mr-2 text-blue-600" />
              Customer
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Customer picker */}
            <div className="space-y-2">
              <Label className="text-sm">Customer *</Label>
              <div className="flex gap-2">
                <Select
                  value={selectedCustomer ? String(selectedCustomer.id) : "walk-in"}
                  onValueChange={handleCustomerSelect}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select or search customer" />
                  </SelectTrigger>
                  <SelectContent className="max-h-72">
                    <div className="p-2 border-b">
                      <Input
                        placeholder="Search customers…"
                        value={customerSearchTerm}
                        onChange={(e) => {
                          setCustomerSearchTerm(e.target.value);
                          if (e.target.value && selectedCustomer) {
                            setSelectedCustomer(null);
                            setCustomerName("");
                          }
                        }}
                        className="h-8"
                      />
                    </div>
                    <SelectItem value="walk-in">Walk-in Customer</SelectItem>
                    {filteredCustomers.map((c) => (
                      <SelectItem key={c.id} value={String(c.id)}>
                        {c.name} {c.phone && `(${c.phone})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* New customer */}
                <Dialog open={newCustomerModalOpen} onOpenChange={setNewCustomerModalOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Plus className="h-4 w-4 mr-1" />
                      New
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[430px]">
                    <DialogHeader>
                      <DialogTitle>Add New Customer</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleCreateNewCustomer} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Name *</Label>
                        <Input
                          id="name"
                          value={newCustomerForm.name}
                          onChange={(e) =>
                            setNewCustomerForm({ ...newCustomerForm, name: e.target.value })
                          }
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={newCustomerForm.email}
                          onChange={(e) =>
                            setNewCustomerForm({ ...newCustomerForm, email: e.target.value })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                          id="phone"
                          value={newCustomerForm.phone}
                          onChange={(e) =>
                            setNewCustomerForm({ ...newCustomerForm, phone: e.target.value })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="address">Address</Label>
                        <Textarea
                          id="address"
                          value={newCustomerForm.address}
                          onChange={(e) =>
                            setNewCustomerForm({ ...newCustomerForm, address: e.target.value })
                          }
                          rows={3}
                        />
                      </div>
                      <Button
                        type="submit"
                        className="bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700"
                      >
                        Create Customer
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>

              <Input
                placeholder="Or type customer name manually"
                value={customerName}
                onChange={(e) => handleCustomerNameChange(e.target.value)}
              />
            </div>

            {/* Payment */}
            <div className="space-y-2">
              <Label className="text-sm">Payment Method</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger>
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="mobile_banking">Mobile Banking</SelectItem>
                  <SelectItem value="telebirr">Telebirr</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Cart */}
            {saleItems.length > 0 && (
              <div className="space-y-4 pt-4 border-t">
                <h4 className="font-medium flex items-center">
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Cart ({saleItems.length} items)
                </h4>

                <div className="space-y-2 max-h-60 overflow-auto">
                  {saleItems.map((it) => (
                    <div
                      key={it.medicineId}
                      className="flex items-center justify-between p-2 border rounded text-sm bg-white"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{it.medicine?.name}</div>
                        <div className="text-xs text-gray-500">
                          {formatETB(it.unitPrice)} each
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-6 w-6 p-0"
                            onClick={() => updateItemQuantity(it.medicineId, it.quantity - 1)}
                            disabled={it.quantity <= 1}
                            aria-label="Decrease"
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-6 text-center text-xs">{it.quantity}</span>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-6 w-6 p-0"
                            onClick={() => updateItemQuantity(it.medicineId, it.quantity + 1)}
                            disabled={it.quantity >= (it.medicine?.quantity || 0)}
                            aria-label="Increase"
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>

                        <div className="font-medium text-xs w-20 text-right">
                          {formatETB(it.totalPrice)}
                        </div>

                        <Button
                          size="sm"
                          variant="destructive"
                          className="h-6 w-6 p-0"
                          onClick={() => removeItem(it.medicineId)}
                          aria-label="Remove"
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold">Total:</span>
                    <span className="text-lg font-bold">{formatETB(totalAmount)}</span>
                  </div>
                  <Button
                    className="w-full mt-2 bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700"
                    onClick={processSale}
                    disabled={loading}
                  >
                    {loading ? "Processing..." : "Complete Sale"}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
