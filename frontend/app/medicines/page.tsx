"use client";

import { useState, useEffect } from "react";
import { Plus, Search, Filter, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { medicineApi, Medicine, MedicineForm, CreateMedicineDto, UpdateMedicineDto } from "@/lib/api";
import { MedicineForm as MedicineFormComponent } from "@/components/medicine-form";
import { toast } from "sonner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

export default function MedicinesPage() {
  interface HttpErrorLike { response?: { data?: { message?: string } } }
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedForm, setSelectedForm] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedManufacturer, setSelectedManufacturer] = useState<string>("all");
  const [categories, setCategories] = useState<Array<{ id: number; name: string }>>([]);
  const [manufacturers, setManufacturers] = useState<string[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const loadMedicines = async () => {
    try {
      setLoading(true);
      const params = {
        search: searchTerm || undefined,
        form: selectedForm !== "all" ? (selectedForm as MedicineForm) : undefined,
        categoryId: selectedCategory !== "all" ? Number(selectedCategory) : undefined,
        manufacturer: selectedManufacturer !== "all" ? selectedManufacturer : undefined,
        page: currentPage,
        limit: 10,
      };
      
      const response = await medicineApi.getAll(params);
      setMedicines(response.medicines);
      setTotalPages(Math.ceil(response.total / 10));
      setTotalItems(response.total);
    } catch (error: unknown) {
      const message = (error as HttpErrorLike)?.response?.data?.message ?? "Failed to load medicines";
      toast.error(message);
      console.error("Error loading medicines:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const data = await medicineApi.getCategories();
      setCategories(data);
    } catch (error) {
      console.error("Error loading categories:", error);
    }
  };

  const loadManufacturers = async () => {
    try {
      const data = await medicineApi.getManufacturers();
      setManufacturers(data);
    } catch (error) {
      console.error("Error loading manufacturers:", error);
    }
  };

  useEffect(() => {
    loadMedicines();
  }, [currentPage, searchTerm, selectedForm, selectedCategory, selectedManufacturer]);

  useEffect(() => {
    loadCategories();
    loadManufacturers();
  }, []);

  const handleCreateMedicine = async (data: CreateMedicineDto) => {
    try {
      await medicineApi.create(data);
      toast.success("Medicine created successfully");
      setIsCreateDialogOpen(false);
      loadMedicines();
    } catch (error: unknown) {
      const message = (error as HttpErrorLike)?.response?.data?.message ?? "Failed to create medicine";
      toast.error(message);
    }
  };

  const handleUpdateMedicine = async (data: UpdateMedicineDto) => {
    if (!selectedMedicine) return;
    
    try {
      await medicineApi.update(selectedMedicine.id, data);
      toast.success("Medicine updated successfully");
      setIsEditDialogOpen(false);
      setSelectedMedicine(null);
      loadMedicines();
    } catch (error: unknown) {
      const message = (error as HttpErrorLike)?.response?.data?.message ?? "Failed to update medicine";
      toast.error(message);
    }
  };

  const handleDeleteMedicine = async (id: number) => {
    try {
      await medicineApi.delete(id);
      toast.success("Medicine deleted successfully");
      loadMedicines();
    } catch (error: unknown) {
      const message = (error as HttpErrorLike)?.response?.data?.message ?? "Failed to delete medicine";
      toast.error(message);
    }
  };

  const handleEditClick = (medicine: Medicine) => {
    setSelectedMedicine(medicine);
    setIsEditDialogOpen(true);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedForm("all");
    setSelectedCategory("all");
    setSelectedManufacturer("all");
    setCurrentPage(1);
  };

  const getFormBadgeColor = (form: MedicineForm) => {
    const colors = {
      tablet: "bg-blue-100 text-blue-800",
      capsule: "bg-green-100 text-green-800",
      syrup: "bg-yellow-100 text-yellow-800",
      injection: "bg-red-100 text-red-800",
      cream: "bg-purple-100 text-purple-800",
      drops: "bg-pink-100 text-pink-800",
      patch: "bg-indigo-100 text-indigo-800",
      powder: "bg-gray-100 text-gray-800",
      ointment: "bg-orange-100 text-orange-800",
      gel: "bg-teal-100 text-teal-800",
    };
    return colors[form] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Medicines Management</h1>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Medicine
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Medicine</DialogTitle>
            </DialogHeader>
            <MedicineFormComponent
              onSubmit={(data) => handleCreateMedicine(data as CreateMedicineDto)}
              onCancel={() => setIsCreateDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search medicines..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={selectedForm} onValueChange={setSelectedForm}>
              <SelectTrigger>
                <SelectValue placeholder="Form" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Forms</SelectItem>
                {Object.values(MedicineForm).map((form) => (
                  <SelectItem key={form} value={form}>
                    {form.charAt(0).toUpperCase() + form.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={String(c.id)}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedManufacturer} onValueChange={setSelectedManufacturer}>
              <SelectTrigger>
                <SelectValue placeholder="Manufacturer" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Manufacturers</SelectItem>
                {manufacturers.map((manufacturer) => (
                  <SelectItem key={manufacturer} value={manufacturer}>
                    {manufacturer}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={clearFilters}>
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results Summary */}
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-600">
          Showing {medicines.length} of {totalItems} medicines
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <span className="px-3 py-1 text-sm">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      </div>

      {/* Medicines Table */}
      <div className="overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Generic</TableHead>
              <TableHead>Dosage</TableHead>
              <TableHead>Form</TableHead>
              <TableHead>Manufacturer</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Prescription</TableHead>
              <TableHead>Barcode</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                  Loading medicines...
                </TableCell>
              </TableRow>
            ) : medicines.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                  No medicines found
                </TableCell>
              </TableRow>
            ) : (
              medicines.map((medicine) => (
                <TableRow key={medicine.id}>
                  <TableCell className="font-medium">{medicine.name}</TableCell>
                  <TableCell>{medicine.genericName ?? '-'}</TableCell>
                  <TableCell>{medicine.dosage}</TableCell>
                  <TableCell>
                    <Badge className={getFormBadgeColor(medicine.form)}>{medicine.form}</Badge>
                  </TableCell>
                  <TableCell>{medicine.manufacturer}</TableCell>
                  <TableCell>{medicine.category?.name ?? '-'}</TableCell>
                  <TableCell>
                    <Badge variant={medicine.prescriptionRequired ? "destructive" : "secondary"}>
                      {medicine.prescriptionRequired ? "Required" : "Not Required"}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono">{medicine.barcode ?? '-'}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Button variant="outline" size="sm" onClick={() => handleEditClick(medicine)}>
                        <Edit className="w-4 h-4 mr-1" /> Edit
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm">
                            <Trash2 className="w-4 h-4 mr-1" /> Delete
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete medicine?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently remove &quot;{medicine.name}&quot; from your inventory.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteMedicine(medicine.id)}>
                              Confirm Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Medicine</DialogTitle>
          </DialogHeader>
          {selectedMedicine && (
            <MedicineFormComponent
              initialData={selectedMedicine}
              onSubmit={(data) => handleUpdateMedicine(data as UpdateMedicineDto)}
              onCancel={() => {
                setIsEditDialogOpen(false);
                setSelectedMedicine(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
