"use client";

import { useEffect, useState } from "react";
import { salesApi, Sale, medicineApi, Medicine } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";

export default function SalesListPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        const [salesResponse, medicinesResponse] = await Promise.all([
          salesApi.list(),
          medicineApi.getAll({ page: 1, limit: 1000 })
        ]);
        setSales(salesResponse);
        setMedicines(medicinesResponse.medicines);
      } catch {
        toast.error("Failed to load data");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const filteredSales = sales.filter(sale =>
    sale.saleNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sale.customerName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-ET', {
      style: 'currency',
      currency: 'ETB'
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-ET');
  };

  const getMedicineName = (medicineId: number) => {
    const medicine = medicines.find(m => m.id === medicineId);
    return medicine ? medicine.name : `Medicine ID: ${medicineId}`;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Sales List</h1>
      </div>

      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Input
            placeholder="Search by sale number or customer name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>

        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading sales...</div>
        ) : filteredSales.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No sales found</div>
        ) : (
          <div className="grid gap-4">
            {filteredSales.map((sale) => (
              <Card key={sale.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Sale #{sale.saleNumber}</CardTitle>
                    <Badge variant="outline">{formatPrice(sale.totalAmount)}</Badge>
                  </div>
                  <div className="text-sm text-gray-600">
                    <p><strong>Date:</strong> {formatDate(sale.saleDate)}</p>
                    {sale.customerName && <p><strong>Customer:</strong> {sale.customerName}</p>}
                    {sale.customerPhone && <p><strong>Phone:</strong> {sale.customerPhone}</p>}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <h4 className="font-medium">Items:</h4>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Medicine</TableHead>
                          <TableHead>Quantity</TableHead>
                          <TableHead>Unit Price</TableHead>
                          <TableHead>Total</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {sale.items.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell>{getMedicineName(item.medicineId)}</TableCell>
                            <TableCell>{item.quantity}</TableCell>
                            <TableCell>{formatPrice(item.unitPrice)}</TableCell>
                            <TableCell>{formatPrice(item.totalPrice)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    {(sale.discount > 0 || sale.tax > 0) && (
                      <div className="flex justify-end space-x-4 text-sm">
                        {sale.discount > 0 && <span>Discount: -{formatPrice(sale.discount)}</span>}
                        {sale.tax > 0 && <span>Tax: +{formatPrice(sale.tax)}</span>}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
