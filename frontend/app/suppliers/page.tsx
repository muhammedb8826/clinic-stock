"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supplierApi } from "@/lib/api";
import { toast } from "sonner";
import { Plus, Edit, Trash2, Search } from "lucide-react";

interface Supplier {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  paymentTerms?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface SupplierFormData {
  name: string;
  email: string;
  phone: string;
  address: string;
  paymentTerms: string;
  isActive: boolean;
}

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Modal states
  const [supplierModalOpen, setSupplierModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  
  // Form data
  const [supplierForm, setSupplierForm] = useState<SupplierFormData>({
    name: "",
    email: "",
    phone: "",
    address: "",
    paymentTerms: "",
    isActive: true
  });

  useEffect(() => {
    loadSuppliers();
  }, []);

  const loadSuppliers = async () => {
    try {
      const suppliersData = await supplierApi.list();
      setSuppliers(suppliersData);
    } catch (error) {
      toast.error("Failed to load suppliers");
    } finally {
      setLoading(false);
    }
  };

  const handleSupplierSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingSupplier) {
        const updatedSupplier = await supplierApi.update(editingSupplier.id, supplierForm);
        setSuppliers(suppliers.map(s => s.id === editingSupplier.id ? updatedSupplier : s));
        toast.success("Supplier updated successfully");
      } else {
        const newSupplier = await supplierApi.create(supplierForm);
        setSuppliers([...suppliers, newSupplier]);
        toast.success("Supplier created successfully");
      }
      setSupplierModalOpen(false);
      resetSupplierForm();
    } catch (error) {
      toast.error("Failed to save supplier");
    }
  };

  const handleDeleteSupplier = async (id: number) => {
    if (confirm("Are you sure you want to delete this supplier?")) {
      try {
        await supplierApi.delete(id);
        setSuppliers(suppliers.filter(s => s.id !== id));
        toast.success("Supplier deleted successfully");
      } catch (error) {
        toast.error("Failed to delete supplier");
      }
    }
  };

  const openSupplierModal = (supplier?: Supplier) => {
    if (supplier) {
      setEditingSupplier(supplier);
      setSupplierForm({
        name: supplier.name,
        email: supplier.email || "",
        phone: supplier.phone || "",
        address: supplier.address || "",
        paymentTerms: supplier.paymentTerms || "",
        isActive: supplier.isActive
      });
    } else {
      setEditingSupplier(null);
      resetSupplierForm();
    }
    setSupplierModalOpen(true);
  };

  const resetSupplierForm = () => {
    setSupplierForm({
      name: "",
      email: "",
      phone: "",
      address: "",
      paymentTerms: "",
      isActive: true
    });
    setEditingSupplier(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-ET');
  };

  const filteredSuppliers = suppliers.filter(supplier =>
    supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.phone?.includes(searchTerm)
  );

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Suppliers</h1>
        <Dialog open={supplierModalOpen} onOpenChange={setSupplierModalOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => openSupplierModal()}>
              <Plus className="h-4 w-4 mr-2" />
              Add Supplier
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {editingSupplier ? 'Edit' : 'Add'} Supplier
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSupplierSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={supplierForm.name}
                  onChange={(e) => setSupplierForm({ ...supplierForm, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={supplierForm.email}
                  onChange={(e) => setSupplierForm({ ...supplierForm, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={supplierForm.phone}
                  onChange={(e) => setSupplierForm({ ...supplierForm, phone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  value={supplierForm.address}
                  onChange={(e) => setSupplierForm({ ...supplierForm, address: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="paymentTerms">Payment Terms</Label>
                <Input
                  id="paymentTerms"
                  value={supplierForm.paymentTerms}
                  onChange={(e) => setSupplierForm({ ...supplierForm, paymentTerms: e.target.value })}
                  placeholder="e.g., Net 30 days"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="isActive">Status</Label>
                <select
                  id="isActive"
                  value={supplierForm.isActive.toString()}
                  onChange={(e) => setSupplierForm({ ...supplierForm, isActive: e.target.value === 'true' })}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => {
                  setSupplierModalOpen(false);
                  resetSupplierForm();
                }}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingSupplier ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="flex items-center space-x-2">
        <Search className="h-4 w-4 text-gray-500" />
        <Input
          placeholder="Search suppliers..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Suppliers List</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading...</div>
          ) : filteredSuppliers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No suppliers found</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>Payment Terms</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSuppliers.map((supplier) => (
                  <TableRow key={supplier.id}>
                    <TableCell className="font-medium">{supplier.name}</TableCell>
                    <TableCell>{supplier.email || '-'}</TableCell>
                    <TableCell>{supplier.phone || '-'}</TableCell>
                    <TableCell className="max-w-[150px] truncate">
                      {supplier.address || '-'}
                    </TableCell>
                    <TableCell>{supplier.paymentTerms || '-'}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        supplier.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {supplier.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </TableCell>
                    <TableCell>{formatDate(supplier.createdAt)}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openSupplierModal(supplier)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteSupplier(supplier.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
