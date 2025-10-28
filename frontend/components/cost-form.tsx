"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Cost, CreateCostDto, UpdateCostDto, costApi } from "@/lib/api";

/* ------------------------- Schema ------------------------- */

const costSchema = z.object({
  description: z.string().min(2, "Description must be at least 2 characters"),
  category: z.string().min(2, "Category must be at least 2 characters"),
  amount: z.coerce.number().min(0.01, "Amount must be greater than 0"),
  costDate: z.string().min(1, "Cost date is required"),
  notes: z.string().optional(),
});

type CostFormData = z.input<typeof costSchema>;

interface CostFormProps {
  initialData?: Cost;
  onSubmit: (data: CreateCostDto | UpdateCostDto) => void | Promise<void>;
  onCancel: () => void;
}

/* Common cost categories */
const COMMON_CATEGORIES = [
  "Rent",
  "Utilities",
  "Salary",
  "Maintenance",
  "Insurance",
  "Office Supplies",
  "Marketing",
  "Transportation",
  "Equipment",
  "Other",
] as const;

export function CostForm({ initialData, onSubmit, onCancel }: CostFormProps) {
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<CostFormData>({
    resolver: zodResolver(costSchema),
    defaultValues: {
      description: initialData?.description || "",
      category: initialData?.category || "",
      amount: initialData?.amount || 0,
      costDate: initialData?.costDate ? initialData.costDate.slice(0, 10) : "",
      notes: initialData?.notes || "",
    },
  });

  /* ------------------------- Load categories ------------------------- */
  useEffect(() => {
    (async () => {
      try {
        const categoriesData = await costApi.getCategories();
        // Merge API categories with common static categories
        const uniqueCategories = new Set([...COMMON_CATEGORIES, ...categoriesData]);
        setCategories(Array.from(uniqueCategories));
      } catch (error) {
        console.error("Error loading categories:", error);
        // Use default categories if API fails
        setCategories([...COMMON_CATEGORIES]);
      }
    })();
  }, []);

  /* ------------------------- Fix Select (category) showing selected name ------------------------- */
  const selectedCategory = watch("category");
  const categoryValue = selectedCategory || "";

  /* ------------------------- Submit ------------------------- */
  const onFormSubmit = async (data: CostFormData) => {
    setIsLoading(true);
    setSubmitError(null);
    try {
      const dto: any = {
        description: data.description,
        category: data.category,
        amount: Number(data.amount),
        costDate: data.costDate,
        notes: data.notes || undefined,
      };

      await onSubmit(dto as CreateCostDto);
    } catch (error: unknown) {
      let errorMessage = "Failed to save cost";
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
      console.error("Cost form submission error:", error);
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
              <h3 className="text-sm font-medium text-red-800">Error saving cost</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{submitError}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description">Description *</Label>
          <Input id="description" {...register("description")} placeholder="e.g., Monthly rent payment" />
          {errors.description && <p className="text-sm text-red-600">{errors.description.message}</p>}
        </div>

        {/* Category */}
        <div className="space-y-2">
          <Label>Category *</Label>
          <Select
            value={categoryValue}
            onValueChange={(value) => setValue("category", value, { shouldValidate: true })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.category && <p className="text-sm text-red-600">Category is required</p>}
        </div>

        {/* Amount */}
        <div className="space-y-2">
          <Label htmlFor="amount">Amount (ETB) *</Label>
          <Input
            id="amount"
            type="number"
            step="0.01"
            min="0"
            {...register("amount", { valueAsNumber: true })}
            placeholder="0.00"
          />
          {errors.amount && <p className="text-sm text-red-600">{errors.amount.message}</p>}
        </div>

        {/* Cost Date */}
        <div className="space-y-2">
          <Label htmlFor="costDate">Cost Date *</Label>
          <Input
            id="costDate"
            type="date"
            {...register("costDate")}
          />
          {errors.costDate && <p className="text-sm text-red-600">{errors.costDate.message}</p>}
        </div>
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <Label htmlFor="notes">Notes (Optional)</Label>
        <Textarea
          id="notes"
          {...register("notes")}
          placeholder="Additional notes or details about this cost..."
          rows={3}
        />
        {errors.notes && <p className="text-sm text-red-600">{errors.notes.message}</p>}
      </div>

      {/* Form Actions */}
      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : initialData ? "Update Cost" : "Create Cost"}
        </Button>
      </div>
    </form>
  );
}
