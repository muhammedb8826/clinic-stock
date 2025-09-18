"use client";

import { useEffect, useState } from "react";
import { medicineApi, Medicine, salesApi, CreateSaleDto } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface CartItem {
  medicine: Medicine;
  quantity: number;
}

export default function SalesPage() {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState("");

  useEffect(() => {
    const loadMedicines = async () => {
      try {
        const response = await medicineApi.getAll({ page: 1, limit: 1000, isActive: true });
        setMedicines(response.medicines); // Show all medicines
      } catch {
        toast.error("Failed to load medicines");
      } finally {
        setLoading(false);
      }
    };
    loadMedicines();
  }, []);

  const filteredMedicines = medicines.filter(medicine =>
    medicine.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
      toast.success(`Sale #${sale.saleNumber} processed for ${customerName}. Total: ${formatPrice(getTotalAmount())}`);
      
      // Clear cart and customer name
      setCart([]);
      setCustomerName("");
      
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
                <label className="text-sm font-medium">Customer Name</label>
                <Input
                  placeholder="Enter customer name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                />
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


