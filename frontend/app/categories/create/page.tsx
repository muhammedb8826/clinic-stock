"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CategoryForm } from "@/components/category-form";
import { CreateCategoryDto, categoryApi } from "@/lib/api";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function CreateCategoryPage() {
  const router = useRouter();

  const onCreate = async (data: CreateCategoryDto) => {
    await categoryApi.create(data);
    toast.success("Category created");
    router.push("/categories");
  };

  return (
    <div className="container mx-auto p-6">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>Create Category</CardTitle>
        </CardHeader>
        <CardContent>
          <CategoryForm onSubmit={(data) => onCreate(data as CreateCategoryDto)} onCancel={() => router.back()} />
        </CardContent>
      </Card>
    </div>
  );
}


