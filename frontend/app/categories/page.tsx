"use client";

import { useEffect, useState } from "react";
import { categoryApi, Category, CreateCategoryDto, UpdateCategoryDto } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CategoryForm } from "@/components/category-form";
import { Edit, Plus, Trash2, Search } from "lucide-react";
import { toast } from "sonner";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selected, setSelected] = useState<Category | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      const res = await categoryApi.list({ search: search || undefined, page, limit: 10 });
      setCategories(res.categories);
      setTotal(res.total);
      setTotalPages(Math.max(1, Math.ceil(res.total / res.limit)));
    } catch (e) {
      toast.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [search, page]);

  const onCreate = async (data: CreateCategoryDto) => {
    await categoryApi.create(data);
    toast.success("Category created");
    setCreateOpen(false);
    load();
  };

  const onUpdate = async (data: UpdateCategoryDto) => {
    if (!selected) return;
    await categoryApi.update(selected.id, data);
    toast.success("Category updated");
    setEditOpen(false);
    setSelected(null);
    load();
  };

  const onDelete = async (id: number) => {
    if (!confirm("Delete this category?")) return;
    await categoryApi.remove(id);
    toast.success("Category deleted");
    load();
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Categories</h1>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 mr-2" /> New Category</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create Category</DialogTitle></DialogHeader>
            <CategoryForm onSubmit={(data) => onCreate(data as CreateCategoryDto)} onCancel={() => setCreateOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input placeholder="Search categories..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
          </div>
        </CardContent>
      </Card>

      <div className="overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Active</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={4} className="text-center py-8 text-gray-500">Loading...</TableCell></TableRow>
            ) : categories.length === 0 ? (
              <TableRow><TableCell colSpan={4} className="text-center py-8 text-gray-500">No categories</TableCell></TableRow>
            ) : (
              categories.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell className="max-w-[400px] truncate">{c.description ?? '-'}</TableCell>
                  <TableCell>{c.isActive ? 'Yes' : 'No'}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Dialog open={editOpen && selected?.id === c.id} onOpenChange={(o) => { setEditOpen(o); if (!o) setSelected(null); }}>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" onClick={() => { setSelected(c); setEditOpen(true); }}>
                            <Edit className="w-4 h-4 mr-1" /> Edit
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader><DialogTitle>Edit Category</DialogTitle></DialogHeader>
                          <CategoryForm initialData={c} onSubmit={onUpdate} onCancel={() => { setEditOpen(false); setSelected(null); }} />
                        </DialogContent>
                      </Dialog>
                      <Button variant="destructive" size="sm" onClick={() => onDelete(c.id)}>
                        <Trash2 className="w-4 h-4 mr-1" /> Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}


