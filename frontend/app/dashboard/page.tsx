"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { inventoryApi, salesApi } from "@/lib/api";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

export default function DashboardPage() {
  const [inventoryValue, setInventoryValue] = useState(0);
  const [lowStock, setLowStock] = useState(0);
  const [expiring, setExpiring] = useState(0);
  const [daily, setDaily] = useState<Array<{ day: string; total: string }>>([]);
  const [monthly, setMonthly] = useState<Array<{ month: string; total: string }>>([]);

  useEffect(() => {
    (async () => {
      const summary = await inventoryApi.summary();
      setInventoryValue(summary.totalValue);
      setLowStock(summary.lowStockItems);
      setExpiring(summary.expiringItems);
      setDaily(await salesApi.reportDaily());
      setMonthly(await salesApi.reportMonthly());
    })();
  }, []);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Reports Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card><CardHeader><CardTitle>Inventory Value</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{new Intl.NumberFormat('en-ET', { style: 'currency', currency: 'ETB' }).format(inventoryValue)}</div></CardContent></Card>
        <Card><CardHeader><CardTitle>Low Stock Items</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{lowStock}</div></CardContent></Card>
        <Card><CardHeader><CardTitle>Expiring Soon (30d)</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{expiring}</div></CardContent></Card>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card><CardHeader><CardTitle>Daily Sales</CardTitle></CardHeader><CardContent>
          <ChartContainer config={{ sales: { label: 'Sales', color: 'var(--primary)' } }} className="aspect-auto h-[250px] w-full">
            <AreaChart data={daily.map(d => ({ date: d.day, sales: Number(d.total) }))}>
              <defs>
                <linearGradient id="fillDaily" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-sales)" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="var(--color-sales)" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} minTickGap={24} />
              <YAxis tickFormatter={(v) => new Intl.NumberFormat('en-ET', { style: 'currency', currency: 'ETB', maximumFractionDigits: 0 }).format(v as number)} width={80} />
              <ChartTooltip cursor={false} content={<ChartTooltipContent labelFormatter={(value) => String(value)} />} />
              <Area dataKey="sales" type="natural" fill="url(#fillDaily)" stroke="var(--color-sales)" />
            </AreaChart>
          </ChartContainer>
        </CardContent></Card>
        <Card><CardHeader><CardTitle>Monthly Sales</CardTitle></CardHeader><CardContent>
          <ChartContainer config={{ sales: { label: 'Sales', color: 'var(--primary)' } }} className="aspect-auto h-[250px] w-full">
            <AreaChart data={monthly.map(m => ({ date: m.month, sales: Number(m.total) }))}>
              <defs>
                <linearGradient id="fillMonthly" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-sales)" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="var(--color-sales)" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} minTickGap={24} />
              <YAxis tickFormatter={(v) => new Intl.NumberFormat('en-ET', { style: 'currency', currency: 'ETB', maximumFractionDigits: 0 }).format(v as number)} width={80} />
              <ChartTooltip cursor={false} content={<ChartTooltipContent labelFormatter={(value) => String(value)} />} />
              <Area dataKey="sales" type="natural" fill="url(#fillMonthly)" stroke="var(--color-sales)" />
            </AreaChart>
          </ChartContainer>
        </CardContent></Card>
      </div>
    </div>
  );
}