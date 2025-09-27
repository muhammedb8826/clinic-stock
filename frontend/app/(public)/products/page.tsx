"use client";

import { useEffect, useMemo, useState } from "react";
import { medicineApi, Medicine } from "@/lib/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ShoppingCart } from "lucide-react";
import { toast } from "sonner";

export default function ProductsPage() {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  useEffect(() => {
    loadMedicines();
  }, []);

  const loadMedicines = async () => {
    try {
      const response = await medicineApi.getAll({
        page: 1,
        limit: 1000,
        isActive: true,
      });
      // Only show in-stock items
      const inStockMedicines = response.medicines.filter(
        (m) => (m.quantity ?? 0) > 0
      );
      setMedicines(inStockMedicines);
    } catch (error) {
      console.error("Failed to load medicines:", error);
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const categories = useMemo(() => {
    const names = Array.from(
      new Set(
        medicines
          .map((m) => m.category?.name)
          .filter((n): n is string => Boolean(n?.trim()))
      )
    );
    return ["All", ...names];
  }, [medicines]);

  const filteredMedicines = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return medicines.filter((m) => {
      const matchesTerm =
        !term ||
        m.name.toLowerCase().includes(term) ||
        m.category?.name?.toLowerCase().includes(term);
      const matchesCat =
        selectedCategory === "All" ||
        m.category?.name === selectedCategory;
      return matchesTerm && matchesCat;
    });
  }, [medicines, searchTerm, selectedCategory]);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-ET", {
      style: "currency",
      currency: "ETB",
      maximumFractionDigits: 2,
    }).format(price);

  const getStockStatus = (quantity: number) => {
    if (quantity <= 0)
      return { label: "Out of Stock", variant: "destructive" as const };
    if (quantity <= 10)
      return { label: "Low Stock", variant: "secondary" as const };
    return { label: "In Stock", variant: "default" as const };
  };

  const handleAddToCart = (medicine: Medicine) => {
    toast.success(`${medicine.name} added to cart`);
    // TODO: Hook into real cart
  };

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">
            Veterinary Drugs & Agri Inputs
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            All items shown are currently <span className="font-medium">in stock</span> and ready for order.
          </p>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search by product or category…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Category chips (optional) */}
        {categories.length > 1 && (
          <div className="mb-8 overflow-x-auto">
            <div className="flex gap-2 w-max">
              {categories.map((c) => {
                const active = selectedCategory === c;
                return (
                  <Button
                    key={c}
                    size="sm"
                    variant={active ? "default" : "outline"}
                    onClick={() => setSelectedCategory(c)}
                    className={
                      active
                        ? "bg-blue-600 hover:bg-blue-700"
                        : "border-blue-200 text-blue-700 hover:bg-blue-50"
                    }
                  >
                    {c}
                  </Button>
                );
              })}
            </div>
          </div>
        )}

        {/* Grid */}
        <div className="mb-4 flex items-center justify-between">
          {!loading && (
            <h2 className="text-sm text-gray-500">
              Showing <span className="font-medium text-gray-700">{filteredMedicines.length}</span>{" "}
              {filteredMedicines.length === 1 ? "item" : "items"}
            </h2>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <div className="h-1 w-full bg-gradient-to-r from-emerald-400 via-blue-500 to-emerald-400" />
                <CardHeader className="animate-pulse">
                  <div className="h-4 w-24 bg-gray-200 rounded mb-2" />
                  <div className="h-5 w-3/4 bg-gray-200 rounded mb-1" />
                  <div className="h-4 w-1/2 bg-gray-200 rounded" />
                </CardHeader>
                <CardContent className="pt-0 animate-pulse">
                  <div className="h-8 w-32 bg-gray-200 rounded mb-3" />
                  <div className="h-10 w-full bg-gray-200 rounded" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredMedicines.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredMedicines.map((medicine) => {
              const stockStatus = getStockStatus(medicine.quantity);
              return (
                <Card
                  key={medicine.id}
                  className="hover:shadow-lg transition-shadow overflow-hidden"
                >
                  {/* Gradient accent */}
                  <div className="h-1 w-full bg-gradient-to-r from-emerald-400 via-blue-500 to-emerald-400" />
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start mb-2">
                      <Badge variant={stockStatus.variant} className="text-xs">
                        {stockStatus.label}
                      </Badge>
                      {medicine.category?.name && (
                        <Badge variant="outline" className="text-xs">
                          {medicine.category.name}
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-lg line-clamp-2">
                      {medicine.name}
                    </CardTitle>
                    <CardDescription className="text-sm">
                      Quantity: {medicine.quantity} units
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      <div className="flex items-baseline justify-between">
                        <span className="text-2xl font-extrabold text-blue-700">
                          {formatPrice(medicine.sellingPrice)}
                        </span>
                      </div>
                      <Button
                        className="w-full"
                        onClick={() => handleAddToCart(medicine)}
                        disabled={medicine.quantity <= 0}
                      >
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        {medicine.quantity <= 0 ? "Out of Stock" : "Add to Cart"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center">
              <Search className="h-7 w-7 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No products found
            </h3>
            <p className="text-gray-600">
              {searchTerm
                ? "Try adjusting your search or clear the category filter."
                : "No items are currently in stock."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
