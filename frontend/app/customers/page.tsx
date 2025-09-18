"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { customerApi } from "@/lib/api";
import { toast } from "sonner";
import { Plus, Edit, Trash2, Search } from "lucide-react";

interface Customer {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  createdAt: string;
  updatedAt: string;
}

interface CustomerFormData {
  name: string;
  email: string;
  phone: string;
  address: string;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Modal states
  const [customerModalOpen, setCustomerModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  
  // Form data
  const [customerForm, setCustomerForm] = useState<CustomerFormData>({
    name: "",
    email: "",
    phone: "",
    address: ""
  });

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      const customersData = await customerApi.list();
      setCustomers(customersData);
    } catch (error) {
      toast.error("Failed to load customers");
    } finally {
      setLoading(false);
    }
  };

  const handleCustomerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCustomer) {
        const updatedCustomer = await customerApi.update(editingCustomer.id, customerForm);
        setCustomers(customers.map(c => c.id === editingCustomer.id ? updatedCustomer : c));
        toast.success("Customer updated successfully");
      } else {
        const newCustomer = await customerApi.create(customerForm);
        setCustomers([...customers, newCustomer]);
        toast.success("Customer created successfully");
      }
      setCustomerModalOpen(false);
      resetCustomerForm();
    } catch (error) {
      toast.error("Failed to save customer");
    }
  };

  const handleDeleteCustomer = async (id: number) => {
    if (confirm("Are you sure you want to delete this customer?")) {
      try {
        await customerApi.delete(id);
        setCustomers(customers.filter(c => c.id !== id));
        toast.success("Customer deleted successfully");
      } catch (error) {
        toast.error("Failed to delete customer");
      }
    }
  };

  const openCustomerModal = (customer?: Customer) => {
    if (customer) {
      setEditingCustomer(customer);
      setCustomerForm({
        name: customer.name,
        email: customer.email || "",
        phone: customer.phone || "",
        address: customer.address || ""
      });
    } else {
      setEditingCustomer(null);
      resetCustomerForm();
    }
    setCustomerModalOpen(true);
  };

  const resetCustomerForm = () => {
    setCustomerForm({
      name: "",
      email: "",
      phone: "",
      address: ""
    });
    setEditingCustomer(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-ET');
  };

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone?.includes(searchTerm)
  );

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Customers</h1>
        <Dialog open={customerModalOpen} onOpenChange={setCustomerModalOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => openCustomerModal()}>
              <Plus className="h-4 w-4 mr-2" />
              Add Customer
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {editingCustomer ? 'Edit' : 'Add'} Customer
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCustomerSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={customerForm.name}
                  onChange={(e) => setCustomerForm({ ...customerForm, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={customerForm.email}
                  onChange={(e) => setCustomerForm({ ...customerForm, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={customerForm.phone}
                  onChange={(e) => setCustomerForm({ ...customerForm, phone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  value={customerForm.address}
                  onChange={(e) => setCustomerForm({ ...customerForm, address: e.target.value })}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => {
                  setCustomerModalOpen(false);
                  resetCustomerForm();
                }}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingCustomer ? 'Update' : 'Create'}
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
          placeholder="Search customers..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Customers List</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading...</div>
          ) : filteredCustomers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No customers found</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell className="font-medium">{customer.name}</TableCell>
                    <TableCell>{customer.email || '-'}</TableCell>
                    <TableCell>{customer.phone || '-'}</TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {customer.address || '-'}
                    </TableCell>
                    <TableCell>{formatDate(customer.createdAt)}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openCustomerModal(customer)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteCustomer(customer.id)}
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
