"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Medicine, CreateMedicineDto, UpdateMedicineDto, categoryApi } from "@/lib/api";

/* ------------------------- Schema ------------------------- */

// Treat empty strings from <input type="date" /> as undefined for optional fields
const emptyToUndefined = (v: unknown) =>
  typeof v === "string" && v.trim() === "" ? undefined : v;

const medicineSchema = z
  .object({
    productName: z.string().min(2, "Product name must be at least 2 characters"),
    categoryId: z.coerce.number().int({ message: "Category is required" }),
    quantity: z.coerce.number().int().min(0, "Quantity cannot be negative"),

    // NEW: unit fields
    quantityUnit: z.string().min(1, "Unit is required"),
    quantityUnitCustom: z.string().optional(), // only used when quantityUnit === "other"

    sellingPrice: z.coerce.number().min(0, "Selling price cannot be negative"),
    costPrice: z.coerce.number().min(0, "Cost price cannot be negative"),
    expiryDate: z.string().min(1, "Expiry date is required"),

    // CHANGED: manufacturing date optional
    manufacturingDate: z.preprocess(emptyToUndefined, z.string().optional()).optional(),

    barcodeNumber: z.string().optional(),
    
    // NEW: visibility field
    isPublic: z.boolean().default(true),
  })
  .refine(
    (data) => {
      // Only validate order when both are present
      if (data.expiryDate && data.manufacturingDate) {
        const expiryDate = new Date(data.expiryDate);
        const manufacturingDate = new Date(data.manufacturingDate);
        return expiryDate > manufacturingDate;
      }
      return true;
    },
    {
      message: "Expiry date must be ahead of manufacturing date",
      path: ["expiryDate"],
    }
  )
  .refine(
    (data) => (data.quantityUnit === "other" ? !!data.quantityUnitCustom?.trim() : true),
    {
      message: "Please provide a custom unit",
      path: ["quantityUnitCustom"],
    }
  );

type MedicineFormData = z.input<typeof medicineSchema>;

interface MedicineFormProps {
  initialData?: Medicine;
  onSubmit: (data: CreateMedicineDto | UpdateMedicineDto) => void | Promise<void>;
  onCancel: () => void;
}

/* Common pharmacy units */
const COMMON_UNITS = [
  "tablet",
  "capsule",
  "strip",
  "sachet",
  "bottle",
  "vial",
  "ampoule",
  "tube",
  "patch",
  "dropper",
  "ml",
  "L",
  "mg",
  "g",
  "kg",
  "pack",
  "box",
] as const;

export function MedicineForm({ initialData, onSubmit, onCancel }: MedicineFormProps) {
  const [categories, setCategories] = useState<Array<{ id: number; name: string }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<MedicineFormData>({
    resolver: zodResolver(medicineSchema),
    defaultValues: {
      productName: initialData?.name || "",
      categoryId: (initialData?.categoryId as unknown as number) ?? undefined,

      quantity: initialData?.quantity ?? 0,

      // If initialData has a unit, use it; else default to "tablet"
      quantityUnit:
        (initialData as any)?.unit && COMMON_UNITS.includes(((initialData as any)?.unit as string).toLowerCase() as any)
          ? String((initialData as any).unit).toLowerCase()
          : ((initialData as any)?.unit ? "other" : "tablet"),
      quantityUnitCustom:
        (initialData as any)?.unit &&
        !COMMON_UNITS.includes(((initialData as any).unit as string).toLowerCase() as any)
          ? String((initialData as any).unit)
          : "",

      sellingPrice: initialData?.sellingPrice ?? 0,
      costPrice: initialData?.costPrice ?? 0,
      expiryDate: initialData?.expiryDate ? initialData.expiryDate.slice(0, 10) : "",
      // Optional manufacturing date
      manufacturingDate: initialData?.manufacturingDate ? initialData.manufacturingDate.slice(0, 10) : "",
      barcodeNumber: initialData?.barcode || "",
      
      // NEW: visibility field (default to true for new medicines, preserve existing for updates)
      isPublic: (initialData as any)?.isPublic ?? true,
    },
  });

  /* ------------------------- Load categories ------------------------- */
  useEffect(() => {
    (async () => {
      try {
        const categoriesData = await categoryApi
          .list({ page: 1, limit: 1000, isActive: true })
          .then((r) => r.categories);
        setCategories(categoriesData.map((c) => ({ id: c.id, name: c.name })));
      } catch (error) {
        console.error("Error loading categories:", error);
      }
    })();
  }, []);

  /* ------------------------- Auto default expiry from MFG ------------------------- */
  const manufacturingDate = watch("manufacturingDate");
  const expiryDate = watch("expiryDate");
  useEffect(() => {
    if (manufacturingDate && !expiryDate) {
      const mfgDate = new Date(manufacturingDate as string);
      if (!isNaN(mfgDate.getTime())) {
        const defaultExpiryDate = new Date(mfgDate);
        defaultExpiryDate.setFullYear(defaultExpiryDate.getFullYear() + 2);
        setValue("expiryDate", defaultExpiryDate.toISOString().split("T")[0]);
      }
    }
  }, [manufacturingDate, expiryDate, setValue]);

  /* ------------------------- Fix Select (category) showing selected name ------------------------- */
  const selectedCategoryId = watch("categoryId");
  const categoryValue = selectedCategoryId ? String(selectedCategoryId) : ""; // ensure string for shadcn Select

  /* ------------------------- Quantity unit controls ------------------------- */
  const unit = watch("quantityUnit");
  const showCustomUnit = unit === "other";

  /* ------------------------- Submit ------------------------- */
  const onFormSubmit = async (data: MedicineFormData) => {
    setIsLoading(true);
    setSubmitError(null);
    try {
      const resolvedUnit = data.quantityUnit === "other" ? data.quantityUnitCustom?.trim() || "" : data.quantityUnit;

      // Build DTO; keep manufacturingDate optional
      const dto: any = {
        name: data.productName,
        categoryId: data.categoryId,
        barcode: data.barcodeNumber || undefined,
        quantity: Number(data.quantity),
        unit: resolvedUnit, // <— NEW field in payload
        sellingPrice: Number(data.sellingPrice),
        costPrice: Number(data.costPrice),
        expiryDate: data.expiryDate,
        isPublic: data.isPublic, // <— NEW visibility field
        // only include manufacturingDate if provided
        ...(data.manufacturingDate ? { manufacturingDate: data.manufacturingDate } : {}),
      };

      await onSubmit(dto as CreateMedicineDto);
    } catch (error: unknown) {
      let errorMessage = "Failed to save medicine";
      if (error && typeof error === "object" && "response" in error) {
        const apiError = error as {
          response?: { data?: { message?: string; error?: string; errors?: unknown[] } };
        };
        if (apiError.response?.data?.message) errorMessage = apiError.response.data.message;
        else if (apiError.response?.data?.error) errorMessage = apiError.response.data.error;
        else if (apiError.response?.data?.errors) {
          const errors = apiError.response.data.errors;
          if (Array.isArray(errors) && errors.length > 0) {
            errorMessage = errors
              .map((err) =>
                typeof err === "object" && err && "message" in err ? String((err as any).message) : String(err)
              )
              .join(", ");
          }
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      setSubmitError(errorMessage);
      console.error("Medicine form submission error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  /* ------------------------- UI ------------------------- */

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      {/* Submit Error */}
      {submitError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error saving medicine</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{submitError}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Product Name */}
        <div className="space-y-2">
          <Label htmlFor="productName">Product Name *</Label>
          <Input id="productName" {...register("productName")} placeholder="e.g., Paracetamol 500mg" />
          {errors.productName && <p className="text-sm text-red-600">{errors.productName.message}</p>}
        </div>

        {/* Category (fixed value display) */}
        <div className="space-y-2">
          <Label>Category *</Label>
          <Select
            value={categoryValue}
            onValueChange={(value) => setValue("categoryId", Number(value), { shouldValidate: true })}
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
          {errors.categoryId && <p className="text-sm text-red-600">Category is required</p>}
        </div>

        {/* Quantity + Unit */}
        <div className="space-y-2">
          <Label htmlFor="quantity">Quantity *</Label>
          <div className="grid grid-cols-5 gap-2">
            <Input
              id="quantity"
              type="number"
              step="1"
              min="0"
              className="col-span-2"
              {...register("quantity", { valueAsNumber: true })}
            />
            <div className="col-span-3">
              <Select
                value={watch("quantityUnit")}
                onValueChange={(v) => setValue("quantityUnit", v, { shouldValidate: true })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Unit" />
                </SelectTrigger>
                <SelectContent>
                  {COMMON_UNITS.map((u) => (
                    <SelectItem key={u} value={u}>
                      {u}
                    </SelectItem>
                  ))}
                  <SelectItem value="other">Other…</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          {showCustomUnit && (
            <div className="mt-2">
              <Input
                placeholder="Enter unit (e.g., blister, tray, syringe...)"
                {...register("quantityUnitCustom")}
              />
              {errors.quantityUnitCustom && (
                <p className="text-sm text-red-600">{errors.quantityUnitCustom.message}</p>
              )}
            </div>
          )}
          {errors.quantity && <p className="text-sm text-red-600">{errors.quantity.message}</p>}
          {errors.quantityUnit && <p className="text-sm text-red-600">{errors.quantityUnit.message}</p>}
        </div>

        {/* Selling Price */}
        <div className="space-y-2">
          <Label htmlFor="sellingPrice">Selling Price *</Label>
          <Input
            id="sellingPrice"
            type="number"
            step="0.01"
            min="0"
            {...register("sellingPrice", { valueAsNumber: true })}
          />
          {errors.sellingPrice && <p className="text-sm text-red-600">{errors.sellingPrice.message}</p>}
        </div>

        {/* Cost Price */}
        <div className="space-y-2">
          <Label htmlFor="costPrice">Cost Price *</Label>
          <Input id="costPrice" type="number" step="0.01" min="0" {...register("costPrice", { valueAsNumber: true })} />
          {errors.costPrice && <p className="text-sm text-red-600">{errors.costPrice.message}</p>}
        </div>

        {/* Expiry Date */}
        <div className="space-y-2">
          <Label htmlFor="expiryDate">Expiry Date *</Label>
          <Input
            id="expiryDate"
            type="date"
            min={manufacturingDate ? (manufacturingDate as string) : undefined}
            {...register("expiryDate")}
          />
          <p className="text-xs text-muted-foreground">Must be after the manufacturing date (if provided)</p>
          {errors.expiryDate && <p className="text-sm text-red-600">{errors.expiryDate.message}</p>}
        </div>

        {/* Manufacturing Date (optional) */}
        <div className="space-y-2">
          <Label htmlFor="manufacturingDate">Manufacturing Date (optional)</Label>
          <Input
            id="manufacturingDate"
            type="date"
            max={new Date().toISOString().split("T")[0]}
            {...register("manufacturingDate")}
          />
          <p className="text-xs text-muted-foreground">Cannot be in the future</p>
          {errors.manufacturingDate && (
            <p className="text-sm text-red-600">{errors.manufacturingDate.message}</p>
          )}
        </div>

        {/* Barcode Number */}
        <div className="space-y-2">
          <Label htmlFor="barcodeNumber">Barcode Number</Label>
          <Input id="barcodeNumber" {...register("barcodeNumber")} placeholder="e.g., 1234567890123" />
          {errors.barcodeNumber && <p className="text-sm text-red-600">{errors.barcodeNumber.message}</p>}
        </div>

        {/* Visibility Setting */}
        <div className="space-y-2 md:col-span-2">
          <Label className="text-base font-medium">Product Visibility</Label>
          <div className="flex items-center justify-between p-4 border rounded-lg bg-gradient-to-r from-emerald-50 to-blue-50">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-900">
                  {watch("isPublic") ? "Live on Website" : "Admin Only"}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  watch("isPublic") 
                    ? "bg-green-100 text-green-800" 
                    : "bg-gray-100 text-gray-800"
                }`}>
                  {watch("isPublic") ? "Public" : "Private"}
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {watch("isPublic") 
                  ? "This medicine will be visible to customers on the public website"
                  : "This medicine will only be visible to admin users in the dashboard"
                }
              </p>
            </div>
            <Switch
              checked={watch("isPublic")}
              onCheckedChange={(checked) => setValue("isPublic", checked, { shouldValidate: true })}
              className="ml-4"
            />
          </div>
          {errors.isPublic && <p className="text-sm text-red-600">{errors.isPublic.message}</p>}
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
