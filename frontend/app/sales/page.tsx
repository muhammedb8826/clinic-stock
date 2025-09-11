"use client";

import { useEffect, useState } from "react";
import { salesApi, Sale } from "@/lib/api";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function SalesPage() {
  const [data, setData] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { salesApi.list().then(setData).finally(() => setLoading(false)); }, []);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Sales</h1>
        <Link href="/sales/create"><Button>New Sale</Button></Link>
      </div>
      <div className="overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Sale #</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={4} className="text-center py-8 text-gray-500">Loading...</TableCell></TableRow>
            ) : data.length === 0 ? (
              <TableRow><TableCell colSpan={4} className="text-center py-8 text-gray-500">No sales</TableCell></TableRow>
            ) : (
              data.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">{s.saleNumber}</TableCell>
                  <TableCell>{s.saleDate?.slice(0,10)}</TableCell>
                  <TableCell>{s.customerName ?? '-'}</TableCell>
                  <TableCell>{Number(s.totalAmount).toFixed(2)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}


