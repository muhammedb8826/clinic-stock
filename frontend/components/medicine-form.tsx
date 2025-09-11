"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Medicine, MedicineForm as MedicineFormEnum, CreateMedicineDto, UpdateMedicineDto, categoryApi } from "@/lib/api";

const medicineSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  genericName: z.string().optional(),
  dosage: z.string().min(1, "Dosage is required"),
  form: z.nativeEnum(MedicineFormEnum),
  manufacturer: z.string().min(1, "Manufacturer is required"),
  categoryId: z.number().int().optional(),
  prescriptionRequired: z.boolean().default(true),
  description: z.string().optional(),
  barcode: z.string().optional(),
  isActive: z.boolean().default(true),
});

type MedicineFormData = z.input<typeof medicineSchema>;

interface MedicineFormProps {
  initialData?: Medicine;
  onSubmit: (data: CreateMedicineDto | UpdateMedicineDto) => void | Promise<void>;
  onCancel: () => void;
}

export function MedicineForm({ initialData, onSubmit, onCancel }: MedicineFormProps) {
  const [categories, setCategories] = useState<Array<{ id: number; name: string }>>([]);
  const [manufacturers, setManufacturers] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<MedicineFormData>({
    resolver: zodResolver(medicineSchema),
    defaultValues: {
      name: initialData?.name || "",
      genericName: initialData?.genericName || "",
      dosage: initialData?.dosage || "",
      form: initialData?.form || MedicineFormEnum.TABLET,
      manufacturer: initialData?.manufacturer || "",
      categoryId: (initialData?.categoryId as number | undefined) ?? undefined,
      prescriptionRequired: initialData?.prescriptionRequired ?? true,
      description: initialData?.description || "",
      barcode: initialData?.barcode || "",
      isActive: initialData?.isActive ?? true,
    },
  });

  const prescriptionRequired = watch("prescriptionRequired");
  const isActive = watch("isActive");

  useEffect(() => {
    // Load categories and manufacturers for suggestions
    const loadData = async () => {
      try {
        const [categoriesData, manufacturersData] = await Promise.all([
          categoryApi.list({ page: 1, limit: 1000, isActive: true }).then(r => r.categories),
          fetch("http://localhost:4000/medicines/manufacturers").then(res => res.json()),
        ]);
        setCategories(categoriesData.map(c => ({ id: c.id, name: c.name })));
        setManufacturers(manufacturersData);
      } catch (error) {
        console.error("Error loading data:", error);
      }
    };
    loadData();
  }, []);

  const onFormSubmit = async (data: MedicineFormData) => {
    setIsLoading(true);
    try {
      await onSubmit(data);
    } finally {
      setIsLoading(false);
    }
  };

  const formOptions = [
    { value: MedicineFormEnum.TABLET, label: "Tablet" },
    { value: MedicineFormEnum.CAPSULE, label: "Capsule" },
    { value: MedicineFormEnum.SYRUP, label: "Syrup" },
    { value: MedicineFormEnum.INJECTION, label: "Injection" },
    { value: MedicineFormEnum.CREAM, label: "Cream" },
    { value: MedicineFormEnum.DROPS, label: "Drops" },
    { value: MedicineFormEnum.PATCH, label: "Patch" },
    { value: MedicineFormEnum.POWDER, label: "Powder" },
    { value: MedicineFormEnum.OINTMENT, label: "Ointment" },
    { value: MedicineFormEnum.GEL, label: "Gel" },
  ];

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Name */}
        <div className="space-y-2">
          <Label htmlFor="name">Medicine Name *</Label>
          <Input
            id="name"
            {...register("name")}
            placeholder="e.g., Paracetamol 500mg"
          />
          {errors.name && (
            <p className="text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>

        {/* Generic Name */}
        <div className="space-y-2">
          <Label htmlFor="genericName">Generic Name</Label>
          <Input
            id="genericName"
            {...register("genericName")}
            placeholder="e.g., Acetaminophen"
          />
        </div>

        {/* Dosage */}
        <div className="space-y-2">
          <Label htmlFor="dosage">Dosage *</Label>
          <Input
            id="dosage"
            {...register("dosage")}
            placeholder="e.g., 500mg, 10ml"
          />
          {errors.dosage && (
            <p className="text-sm text-red-600">{errors.dosage.message}</p>
          )}
        </div>

        {/* Form */}
        <div className="space-y-2">
          <Label htmlFor="form">Form *</Label>
          <Select
            value={watch("form")}
            onValueChange={(value) => setValue("form", value as MedicineFormEnum)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select form" />
            </SelectTrigger>
            <SelectContent>
              {formOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.form && (
            <p className="text-sm text-red-600">{errors.form.message}</p>
          )}
        </div>

        {/* Manufacturer */}
        <div className="space-y-2">
          <Label htmlFor="manufacturer">Manufacturer *</Label>
          <Input
            id="manufacturer"
            {...register("manufacturer")}
            placeholder="e.g., ABC Pharmaceuticals"
            list="manufacturers"
          />
          <datalist id="manufacturers">
            {manufacturers.map((manufacturer) => (
              <option key={manufacturer} value={manufacturer} />
            ))}
          </datalist>
          {errors.manufacturer && (
            <p className="text-sm text-red-600">{errors.manufacturer.message}</p>
          )}
        </div>

        {/* Category */}
        <div className="space-y-2">
          <Label htmlFor="category">Category *</Label>
          <Select
            value={(watch("categoryId") as unknown as string) ?? undefined}
            onValueChange={(value) => setValue("categoryId" as unknown as "categoryId", Number(value))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((c) => (
                <SelectItem key={c.id} value={String(c.id)}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Barcode */}
        <div className="space-y-2">
          <Label htmlFor="barcode">Barcode</Label>
          <Input
            id="barcode"
            {...register("barcode")}
            placeholder="e.g., 1234567890123"
          />
        </div>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          {...register("description")}
          placeholder="Medicine description..."
          rows={3}
        />
      </div>

      {/* Checkboxes */}
      <div className="flex gap-6">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="prescriptionRequired"
            checked={prescriptionRequired}
            onCheckedChange={(checked) => setValue("prescriptionRequired", !!checked)}
          />
          <Label htmlFor="prescriptionRequired">Prescription Required</Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="isActive"
            checked={isActive}
            onCheckedChange={(checked) => setValue("isActive", !!checked)}
          />
          <Label htmlFor="isActive">Active</Label>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : initialData ? "Update Medicine" : "Create Medicine"}
        </Button>
      </div>
    </form>
  );
}
