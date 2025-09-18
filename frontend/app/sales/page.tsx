"use client";

import { useEffect, useState } from "react";
import { medicineApi, Medicine, salesApi, CreateSaleDto, customerApi, Customer } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Plus } from "lucide-react";

interface CartItem {
  medicine: Medicine;
  quantity: number;
}

export default function SalesPage() {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerSearchTerm, setCustomerSearchTerm] = useState("");
  const [newCustomerModalOpen, setNewCustomerModalOpen] = useState(false);
  const [newCustomerForm, setNewCustomerForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: ""
  });
  const [paymentMethod, setPaymentMethod] = useState("cash");

  useEffect(() => {
    const loadData = async () => {
      try {
        const [medicinesResponse, customersResponse] = await Promise.all([
          medicineApi.getAll({ page: 1, limit: 1000, isActive: true }),
          customerApi.list()
        ]);
        setMedicines(medicinesResponse.medicines);
        setCustomers(customersResponse);
      } catch {
        toast.error("Failed to load data");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const filteredMedicines = medicines.filter(medicine =>
    medicine.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(customerSearchTerm.toLowerCase()) ||
    customer.phone?.includes(customerSearchTerm) ||
    customer.email?.toLowerCase().includes(customerSearchTerm.toLowerCase())
  );

  const handleCustomerSelect = (customerId: string) => {
    if (customerId === "walk-in") {
      setSelectedCustomer(null);
      setCustomerName("");
      setCustomerSearchTerm("");
    } else {
      const customer = customers.find(c => c.id.toString() === customerId);
      setSelectedCustomer(customer || null);
      setCustomerName(customer ? customer.name : "");
      setCustomerSearchTerm("");
    }
  };

  const handleCustomerNameChange = (value: string) => {
    setCustomerName(value);
    // Clear selected customer if typing manually
    if (selectedCustomer && selectedCustomer.name !== value) {
      setSelectedCustomer(null);
    }
  };

  const handleCreateNewCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newCustomer = await customerApi.create(newCustomerForm);
      setCustomers([...customers, newCustomer]);
      setSelectedCustomer(newCustomer);
      setCustomerName(newCustomer.name);
      setNewCustomerModalOpen(false);
      setNewCustomerForm({ name: "", email: "", phone: "", address: "" });
      setCustomerSearchTerm("");
      toast.success("New customer created and selected!");
    } catch (error) {
      console.error("Failed to create customer:", error);
      toast.error("Failed to create customer");
    }
  };

  const addToCart = (medicine: Medicine) => {
    const existingItem = cart.find(item => item.medicine.id === medicine.id);
    if (existingItem) {
      if (existingItem.quantity < medicine.quantity) {
        setCart(cart.map(item =>
          item.medicine.id === medicine.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        ));
      } else {
        toast.error("Not enough stock available");
      }
    } else {
      setCart([...cart, { medicine, quantity: 1 }]);
    }
  };

  const removeFromCart = (medicineId: number) => {
    setCart(cart.filter(item => item.medicine.id !== medicineId));
  };

  const updateQuantity = (medicineId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(medicineId);
      return;
    }
    
    const medicine = medicines.find(m => m.id === medicineId);
    if (medicine && quantity > medicine.quantity) {
      toast.error("Not enough stock available");
      return;
    }

    setCart(cart.map(item =>
      item.medicine.id === medicineId
        ? { ...item, quantity }
        : item
    ));
  };

  const getTotalAmount = () => {
    return cart.reduce((total, item) => total + (Number(item.medicine.sellingPrice) * item.quantity), 0);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-ET', {
      style: 'currency',
      currency: 'ETB'
    }).format(price);
  };

  const processSale = async () => {
    if (cart.length === 0) {
      toast.error("Cart is empty");
      return;
    }
    if (!customerName.trim()) {
      toast.error("Customer name is required");
      return;
    }

    try {
      // Create the sale DTO
      const saleDto: CreateSaleDto = {
        saleDate: new Date().toISOString(),
        customerName: customerName.trim(),
        items: cart.map(item => ({
          medicineId: item.medicine.id,
          quantity: item.quantity,
          unitPrice: Number(item.medicine.sellingPrice)
        }))
      };

      // Process the sale
      const sale = await salesApi.create(saleDto);
      
      // Show success message
      const paymentMethodDisplay = {
        cash: "Cash",
        mobile_banking: "Mobile Banking",
        telebirr: "Telebirr"
      };
      toast.success(`Sale #${sale.saleNumber} processed for ${customerName}. Total: ${formatPrice(getTotalAmount())} (${paymentMethodDisplay[paymentMethod as keyof typeof paymentMethodDisplay]})`);
      
      // Clear cart and customer name
      setCart([]);
      setCustomerName("");
      setSelectedCustomer(null);
      setCustomerSearchTerm("");
      setPaymentMethod("cash");
      
      // Refresh medicines list to update stock quantities
      const response = await medicineApi.getAll({ page: 1, limit: 1000, isActive: true });
      setMedicines(response.medicines);
      
    } catch (error: unknown) {
      console.error("Sale processing error:", error);
      let errorMessage = "Failed to process sale";
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { message?: string } } };
        errorMessage = axiosError.response?.data?.message || errorMessage;
      } else if (error && typeof error === 'object' && 'message' in error) {
        errorMessage = (error as { message: string }).message;
      }
      toast.error(errorMessage);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Sales</h1>
        <div className="text-lg font-semibold">
          Total: {formatPrice(getTotalAmount())}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Medicines List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="space-y-2">
            <Input
              placeholder="Search medicines..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

            {loading ? (
            <div className="text-center py-8 text-gray-500">Loading medicines...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredMedicines.map((medicine) => (
                <Card key={medicine.id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">{medicine.name}</CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">Stock: {medicine.quantity}</Badge>
                      <Badge variant="secondary">{formatPrice(Number(medicine.sellingPrice))}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Button
                      onClick={() => addToCart(medicine)}
                      disabled={medicine.quantity === 0}
                      className="w-full"
                    >
                      Add to Cart
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Checkout Section */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Checkout</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Customer *</label>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Select
                      value={selectedCustomer ? selectedCustomer.id.toString() : "walk-in"}
                      onValueChange={handleCustomerSelect}
                    >
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Select or search customer" />
                      </SelectTrigger>
                      <SelectContent className="max-h-60">
                        <div className="p-2 border-b">
                          <Input
                            placeholder="Search customers..."
                            value={customerSearchTerm}
                            onChange={(e) => {
                              setCustomerSearchTerm(e.target.value);
                              // Clear selection when searching
                              if (e.target.value && selectedCustomer) {
                                setSelectedCustomer(null);
                                setCustomerName("");
                              }
                            }}
                            className="h-8"
                          />
                        </div>
                        <div className="max-h-48 overflow-auto">
                          <SelectItem value="walk-in">Walk-in Customer</SelectItem>
                          {customerSearchTerm && (
                            <div className="px-2 py-1 text-xs text-gray-500 border-b">
                              Found {filteredCustomers.length} customer{filteredCustomers.length !== 1 ? 's' : ''}
                            </div>
                          )}
                          {filteredCustomers.map((customer) => (
                            <SelectItem key={customer.id} value={customer.id.toString()}>
                              {customer.name} {customer.phone && `(${customer.phone})`}
                            </SelectItem>
                          ))}
                          {filteredCustomers.length === 0 && customerSearchTerm && (
                            <div className="px-2 py-1 text-xs text-gray-500">
                              No customers found for &quot;{customerSearchTerm}&quot;
                            </div>
                          )}
                        </div>
                      </SelectContent>
                    </Select>
                    <Dialog open={newCustomerModalOpen} onOpenChange={setNewCustomerModalOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Plus className="h-4 w-4 mr-1" />
                          New
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                          <DialogTitle>Add New Customer</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleCreateNewCustomer} className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="new-customer-name">Name *</Label>
                            <Input
                              id="new-customer-name"
                              value={newCustomerForm.name}
                              onChange={(e) => setNewCustomerForm({ ...newCustomerForm, name: e.target.value })}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="new-customer-email">Email</Label>
                            <Input
                              id="new-customer-email"
                              value={newCustomerForm.email}
                              onChange={(e) => setNewCustomerForm({ ...newCustomerForm, email: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="new-customer-phone">Phone</Label>
                            <Input
                              id="new-customer-phone"
                              value={newCustomerForm.phone}
                              onChange={(e) => setNewCustomerForm({ ...newCustomerForm, phone: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="new-customer-address">Address</Label>
                            <Textarea
                              id="new-customer-address"
                              value={newCustomerForm.address}
                              onChange={(e) => setNewCustomerForm({ ...newCustomerForm, address: e.target.value })}
                            />
                          </div>
                          <div className="flex justify-end space-x-2">
                            <Button type="button" variant="outline" onClick={() => setNewCustomerModalOpen(false)}>
                              Cancel
                            </Button>
                            <Button type="submit">
                              Create Customer
                            </Button>
                          </div>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
                <Input
                  placeholder="Or type customer name manually"
                  value={customerName}
                  onChange={(e) => handleCustomerNameChange(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Payment Method</label>
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

              <div className="space-y-2">
                <label className="text-sm font-medium">Cart Items</label>
                {cart.length === 0 ? (
                  <p className="text-sm text-gray-500">No items in cart</p>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {cart.map((item) => (
                      <div key={item.medicine.id} className="flex items-center justify-between p-2 border rounded">
                        <div className="flex-1">
                          <p className="text-sm font-medium">{item.medicine.name}</p>
                          <p className="text-xs text-gray-500">{formatPrice(Number(item.medicine.sellingPrice))} each</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateQuantity(item.medicine.id, item.quantity - 1)}
                          >
                            -
                          </Button>
                          <span className="text-sm w-8 text-center">{item.quantity}</span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateQuantity(item.medicine.id, item.quantity + 1)}
                          >
                            +
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => removeFromCart(item.medicine.id)}
                          >
                            ×
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-4">
                  <span className="font-semibold">Total:</span>
                  <span className="font-bold text-lg">{formatPrice(getTotalAmount())}</span>
                </div>
                <Button
                  onClick={processSale}
                  disabled={cart.length === 0 || !customerName.trim()}
                  className="w-full"
                >
                  Process Sale
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}


