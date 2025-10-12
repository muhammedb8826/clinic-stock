"use client";

import { useState, useEffect, useMemo, useRef } from "react";
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";

import {
  Plus,
  Minus,
  ShoppingCart,
  User,
  Search as SearchIcon,
  Package,
  Barcode,
  Filter,
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

const debounce = (fn: (...args: any[]) => void, ms = 200) => {
  let t: any;
  return (...args: any[]) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
};

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

  // Medicines search/filters
  const [medicineQuery, setMedicineQuery] = useState("");
  const [onlyInStock, setOnlyInStock] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [openPicker, setOpenPicker] = useState(false);
  const [barcode, setBarcode] = useState("");

  /* ------------------------- Data Load ------------------------- */

  useEffect(() => {
    (async () => {
      try {
        const [mRes, cRes] = await Promise.all([
          medicineApi.getAll({ page: 1, limit: 5000, isActive: true }),
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

  const categoryOptions = useMemo(() => {
    const set = new Set<string>();
    let hasUncat = false;
    for (const m of medicines) {
      const n = m.category?.name?.trim();
      if (n) set.add(n);
      else hasUncat = true;
    }
    const arr = Array.from(set).sort((a, b) => a.localeCompare(b));
    if (hasUncat) arr.unshift("Uncategorized");
    return arr;
  }, [medicines]);

  // Debounced client-side search
  const [internalQuery, setInternalQuery] = useState("");
  const debouncedSet = useRef(
    debounce((v: string) => setInternalQuery(v), 200)
  ).current;

  useEffect(() => {
    debouncedSet(medicineQuery);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [medicineQuery]);

  const filteredMedicines = useMemo(() => {
    const q = internalQuery.trim().toLowerCase();

    let list = medicines;

    if (onlyInStock) list = list.filter((m) => m.quantity > 0);

    if (categoryFilter !== "all") {
      list = list.filter((m) => {
        const name = m.category?.name?.trim() || "Uncategorized";
        return name === categoryFilter;
      });
    }

    if (q) {
      list = list.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          m.barcode?.toLowerCase().includes(q) ||
          m.category?.name?.toLowerCase().includes(q)
      );
    }

    return list.slice(0, 200);
  }, [medicines, internalQuery, onlyInStock, categoryFilter]);

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
    toast.success(`Added: ${medicine.name}`);
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

  // Barcode add (paste/scan then Enter)
  const onBarcodeSubmit = () => {
    const q = barcode.trim().toLowerCase();
    if (!q) return;
    const found = medicines.find((m) => (m.barcode || "").toLowerCase() === q);
    if (!found) {
      toast.error("No medicine with this barcode");
      return;
    }
    addMedicineToSale(found);
    setBarcode("");
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

      const mRes = await medicineApi.getAll({
        page: 1,
        limit: 5000,
        isActive: true,
      });
      setMedicines(mRes.medicines || []);

      setSaleItems([]);
      setSelectedCustomer(null);
      setCustomerName("");
      setCustomerSearchTerm("");
      setPaymentMethod("cash");
      setMedicineQuery("");
      setInternalQuery("");
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
      </div>
      <Separator />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Medicines */}
        <Card className="lg:col-span-2 overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                Select Medicines
              </span>

              <span className="text-xs text-muted-foreground flex items-center gap-2">
                <Filter className="h-3.5 w-3.5" />
                {onlyInStock ? "In-stock" : "All"} · {categoryFilter === "all" ? "All categories" : categoryFilter}
              </span>
            </CardTitle>

            {/* Top controls */}
            <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-2">
              {/* Barcode quick add */}
              <div className="relative">
                <Barcode className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Scan/Paste barcode and press Enter"
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") onBarcodeSubmit();
                  }}
                  className="pl-9"
                />
              </div>

              {/* Category filter */}
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent className="max-h-72">
                  <SelectItem value="all">All categories</SelectItem>
                  {categoryOptions.map((name) => (
                    <SelectItem key={name} value={name}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* In-stock toggle */}
              <div className="flex items-center justify-between md:justify-start gap-3 rounded-lg border p-2">
                <div className="text-sm text-muted-foreground">Only in stock</div>
                <Switch checked={onlyInStock} onCheckedChange={setOnlyInStock} />
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {/* Combobox / Command palette */}
            <Popover open={openPicker} onOpenChange={setOpenPicker}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                  onClick={() => setOpenPicker(true)}
                >
                  <SearchIcon className="mr-2 h-4 w-4" />
                  <span className="text-muted-foreground">
                    Search and add medicines…
                  </span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="p-0 w-[min(700px,95vw)]" align="start">
                <Command shouldFilter={false}>
                  <CommandInput
                    placeholder="Type to search by name, barcode, or category…"
                    value={medicineQuery}
                    onValueChange={setMedicineQuery}
                  />
                  <CommandList className="max-h-[50vh]">
                    <CommandEmpty>No results found.</CommandEmpty>

                    <CommandGroup heading="Results">
                      {filteredMedicines.map((m) => {
                        const low = m.quantity <= 10;
                        const category = m.category?.name || "—";
                        return (
                          <CommandItem
                            key={m.id}
                            value={`${m.id}`}
                            onSelect={() => {
                              addMedicineToSale(m);
                            }}
                            className="flex items-center justify-between gap-3"
                          >
                            <div className="min-w-0">
                              <div className="font-medium truncate">{m.name}</div>
                              <div className="text-xs text-muted-foreground truncate">
                                {category} • {formatETB(Number(m.sellingPrice))} •{" "}
                                <span className={low ? "text-destructive font-medium" : "text-primary font-medium"}>
                                  Stock: {m.quantity}
                                </span>
                              </div>
                            </div>
                            <Button
                              size="sm"
                              className="h-7"
                              onClick={(e) => {
                                e.stopPropagation();
                                addMedicineToSale(m);
                              }}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </CommandItem>
                        );
                      })}
                    </CommandGroup>

                    {filteredMedicines.length === 200 && (
                      <>
                        <CommandSeparator />
                        <div className="px-3 py-2 text-xs text-muted-foreground">
                          Showing first 200 results. Refine your search to narrow down.
                        </div>
                      </>
                    )}
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>

            <div className="mt-2 text-xs text-muted-foreground">
              Tip: Press <kbd className="px-1 py-0.5 border rounded">/</kbd> to focus search,{" "}
              <kbd className="px-1 py-0.5 border rounded">Enter</kbd> to add highlighted item.
            </div>

            {/* Optional list */}
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3 max-h-80 overflow-auto rounded-md border p-2">
              {filteredMedicines.length === 0 ? (
                <div className="col-span-full text-center py-8 text-muted-foreground">
                  No medicines match your filters.
                </div>
              ) : (
                filteredMedicines.map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:shadow-sm"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{m.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {m.category?.name || "—"} • {formatETB(Number(m.sellingPrice))} •{" "}
                        <span className={m.quantity <= 10 ? "text-destructive font-medium" : "text-primary font-medium"}>
                          Stock: {m.quantity}
                        </span>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => addMedicineToSale(m)}
                      disabled={m.quantity === 0}
                      className="ml-2"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Customer + Cart */}
        <Card className="overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center">
              <User className="h-5 w-5 mr-2 text-primary" />
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
                      <Button type="submit">Create Customer</Button>
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
                      className="flex items-center justify-between p-2 border rounded text-sm"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{it.medicine?.name}</div>
                        <div className="text-xs text-muted-foreground">
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
                    className="w-full mt-2"
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
