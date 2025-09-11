"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MedicineForm } from "@/components/medicine-form";
import { CreateMedicineDto, medicineApi } from "@/lib/api";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function CreateMedicinePage() {
  interface HttpErrorLike { response?: { data?: { message?: string } } }
  const router = useRouter();

  const handleCreate = async (data: CreateMedicineDto) => {
    try {
      await medicineApi.create(data);
      toast.success("Medicine created successfully");
      router.push("/medicines");
    } catch (error: unknown) {
      const message = (error as HttpErrorLike)?.response?.data?.message ?? "Failed to create medicine";
      toast.error(message);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>Create Medicine</CardTitle>
        </CardHeader>
        <CardContent>
          <MedicineForm onSubmit={(data) => handleCreate(data as CreateMedicineDto)} onCancel={() => router.back()} />
        </CardContent>
      </Card>
    </div>
  );
}


