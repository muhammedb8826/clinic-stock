"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Search, ShoppingCart } from "lucide-react";

/* ------------------------- Helpers ------------------------- */

const formatPrice = (price: number) =>
  new Intl.NumberFormat("en-ET", {
    style: "currency",
    currency: "ETB",
    maximumFractionDigits: 2,
  }).format(Number(price) || 0);

function stockPill(quantity: number) {
  if (quantity <= 0)
    return {
      label: "Out of Stock",
      cls: "bg-red-50 text-red-700 border-red-200",
    } as const;
  if (quantity <= 10)
    return {
      label: "Low Stock",
      cls: "bg-amber-50 text-amber-700 border-amber-200",
    } as const;
  return {
    label: "In Stock",
    cls: "bg-emerald-50 text-emerald-700 border-emerald-200",
  } as const;
}

/* ------------------------- Page ------------------------- */

export default function ProductsPage() {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [sortBy, setSortBy] = useState<"relevance" | "priceAsc" | "priceDesc" | "nameAsc">("relevance");

  useEffect(() => {
    loadMedicines();
  }, []);

  const loadMedicines = async () => {
    setLoading(true);
    try {
      const response = await medicineApi.getAll({
        page: 1,
        limit: 1000,
        isActive: true,
      });
      const inStock = (response.medicines || []).filter((m) => (m.quantity ?? 0) > 0);
      setMedicines(inStock);
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

  const categoryCounts = useMemo(() => {
    const counts = new Map<string, number>();
    medicines.forEach((m) => {
      const key = m.category?.name || "Uncategorized";
      counts.set(key, (counts.get(key) || 0) + 1);
    });
    return counts;
  }, [medicines]);

  const filtered = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return medicines.filter((m) => {
      const matchesTerm =
        !term ||
        m.name.toLowerCase().includes(term) ||
        m.category?.name?.toLowerCase().includes(term);
      const matchesCat = selectedCategory === "All" || m.category?.name === selectedCategory;
      return matchesTerm && matchesCat;
    });
  }, [medicines, searchTerm, selectedCategory]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    switch (sortBy) {
      case "priceAsc":
        return arr.sort((a, b) => Number(a.sellingPrice) - Number(b.sellingPrice));
      case "priceDesc":
        return arr.sort((a, b) => Number(b.sellingPrice) - Number(a.sellingPrice));
      case "nameAsc":
        return arr.sort((a, b) => a.name.localeCompare(b.name));
      default:
        return arr; // relevance = current order
    }
  }, [filtered, sortBy]);

  const handleAddToCart = (medicine: Medicine) => {
    toast.success(`${medicine.name} added to cart`);
    // TODO: integrate real cart
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("All");
    setSortBy("relevance");
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
            All items shown are currently{" "}
            <span className="font-medium">in stock</span> and ready for order.
          </p>
        </div>

        {/* Toolbar */}
        <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full md:max-w-xl">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search by product or category…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex items-center gap-2">
            <Select value={sortBy} onValueChange={(v: typeof sortBy) => setSortBy(v)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="relevance">Sort: Relevance</SelectItem>
                <SelectItem value="priceAsc">Price: Low → High</SelectItem>
                <SelectItem value="priceDesc">Price: High → Low</SelectItem>
                <SelectItem value="nameAsc">Name: A → Z</SelectItem>
              </SelectContent>
            </Select>

            {(searchTerm || selectedCategory !== "All" || sortBy !== "relevance") && (
              <Button variant="outline" onClick={clearFilters}>
                Clear
              </Button>
            )}
          </div>
        </div>

        {/* Category chips */}
        {categories.length > 1 && (
          <div className="mb-8 overflow-x-auto">
            <div className="flex gap-2 w-max">
              {categories.map((c) => {
                const active = selectedCategory === c;
                const count =
                  c === "All"
                    ? medicines.length
                    : categoryCounts.get(c) ?? 0;
                return (
                  <Button
                    key={c}
                    size="sm"
                    variant={active ? "default" : "outline"}
                    onClick={() => setSelectedCategory(c)}
                    className={
                      active
                        ? "bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700"
                        : "border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                    }
                  >
                    {c} {count ? `(${count})` : ""}
                  </Button>
                );
              })}
            </div>
          </div>
        )}

        {/* Result count */}
        <div className="mb-4 flex items-center justify-between">
          {!loading && (
            <h2 className="text-sm text-gray-500">
              Showing{" "}
              <span className="font-medium text-gray-700">
                {sorted.length}
              </span>{" "}
              {sorted.length === 1 ? "item" : "items"}
            </h2>
          )}
        </div>

        {/* Grid */}
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
        ) : sorted.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sorted.map((m) => {
              const s = stockPill(m.quantity);
              return (
                <Card key={m.id} className="hover:shadow-lg transition-shadow overflow-hidden">
                  <div className="h-1 w-full bg-gradient-to-r from-emerald-400 via-blue-500 to-emerald-400" />
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start mb-2">
                      <Badge className={`text-xs border ${s.cls}`}>{s.label}</Badge>
                      {m.category?.name && (
                        <Badge variant="outline" className="text-xs border-emerald-200 text-emerald-700">
                          {m.category.name}
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-lg line-clamp-2">{m.name}</CardTitle>
                    <CardDescription className="text-sm">
                      Quantity: {m.quantity} units
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      <div className="flex items-baseline justify-between">
                        <span className="text-2xl font-extrabold text-blue-700">
                          {formatPrice(m.sellingPrice)}
                        </span>
                      </div>
                      <Button
                        className="w-full bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700"
                        onClick={() => handleAddToCart(m)}
                        disabled={m.quantity <= 0}
                      >
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        {m.quantity <= 0 ? "Out of Stock" : "Add to Cart"}
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
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
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
