"use client";

import { useEffect, useState } from "react";
import { medicineApi, Medicine, CreateMedicineDto } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { MedicineForm } from "@/components/medicine-form";
import { Plus, Search } from "lucide-react";
import { toast } from "sonner";

export default function MedicinesPage() {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState<Medicine | null>(null);

  useEffect(() => {
    loadMedicines();
  }, []);

  const loadMedicines = async () => {
    try {
      const response = await medicineApi.getAll({ page: 1, limit: 1000 });
      setMedicines(response.medicines);
    } catch (error) {
      console.error("Failed to load medicines:", error);
      toast.error("Failed to load medicines");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data: CreateMedicineDto | Partial<CreateMedicineDto>) => {
    try {
      if (editingMedicine) {
        await medicineApi.update(editingMedicine.id, data as unknown as Parameters<typeof medicineApi.update>[1]);
        toast.success("Medicine updated successfully");
      } else {
        await medicineApi.create(data as unknown as Parameters<typeof medicineApi.create>[0]);
        toast.success("Medicine created successfully");
      }
      setModalOpen(false);
      setEditingMedicine(null);
      loadMedicines();
    } catch (error) {
      console.error("Failed to save medicine:", error);
      toast.error("Failed to save medicine");
    }
  };

  const handleEdit = (medicine: Medicine) => {
    setEditingMedicine(medicine);
    setModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this medicine?")) return;
    
    try {
      await medicineApi.delete(id);
      toast.success("Medicine deleted successfully");
      loadMedicines();
    } catch (error) {
      console.error("Failed to delete medicine:", error);
      toast.error("Failed to delete medicine");
    }
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setEditingMedicine(null);
  };

  const filteredMedicines = medicines.filter(medicine =>
    medicine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    medicine.barcode?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-ET', {
      style: 'currency',
      currency: 'ETB'
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-ET');
  };

  const getStockStatus = (quantity: number) => {
    if (quantity === 0) return { status: 'Out of Stock', variant: 'destructive' as const };
    if (quantity <= 10) return { status: 'Low Stock', variant: 'secondary' as const };
    return { status: 'In Stock', variant: 'default' as const };
  };

  const getExpiryStatus = (expiryDate: string) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const daysUntilExpiry = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiry < 0) return { status: 'Expired', variant: 'destructive' as const };
    if (daysUntilExpiry <= 30) return { status: 'Expiring Soon', variant: 'secondary' as const };
    return { status: 'Good', variant: 'default' as const };
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Medicines</h1>
        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingMedicine(null)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Medicine
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingMedicine ? 'Edit Medicine' : 'Add New Medicine'}
              </DialogTitle>
            </DialogHeader>
            <MedicineForm
              onSubmit={handleSubmit}
              initialData={editingMedicine || undefined}
              onCancel={handleModalClose}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search medicines..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="text-center py-8 text-gray-500 col-span-full">Loading medicines...</div>
        ) : filteredMedicines.length === 0 ? (
          <div className="text-center py-8 text-gray-500 col-span-full">No medicines found.</div>
        ) : (
          filteredMedicines.map((medicine) => {
            const stockStatus = getStockStatus(medicine.quantity);
            const expiryStatus = getExpiryStatus(medicine.expiryDate);
            
            return (
              <Card key={medicine.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{medicine.name}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant={stockStatus.variant}>{stockStatus.status}</Badge>
                    <Badge variant={expiryStatus.variant}>{expiryStatus.status}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Quantity:</span>
                      <span className="font-medium">{medicine.quantity}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Selling Price:</span>
                      <span className="font-medium">{formatPrice(medicine.sellingPrice)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Cost Price:</span>
                      <span className="font-medium">{formatPrice(medicine.costPrice)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Expiry Date:</span>
                      <span className="font-medium">{formatDate(medicine.expiryDate)}</span>
                    </div>
                    {medicine.barcode && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Barcode:</span>
                        <span className="font-medium text-xs">{medicine.barcode}</span>
                      </div>
                    )}
                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(medicine)}
                        className="flex-1"
                      >
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(medicine.id)}
                        className="flex-1"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
