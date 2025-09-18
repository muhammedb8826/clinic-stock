"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { dashboardApi, DashboardStats } from "@/lib/api";
import { toast } from "sonner";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [salesPage, setSalesPage] = useState(1);
  const [allSalesPage, setAllSalesPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const data = await dashboardApi.getStats();
        setStats(data);
      } catch {
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-ET', {
      style: 'currency',
      currency: 'ETB'
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-ET');
  };


  // Prepare chart data
  const chartData = stats ? Object.entries(stats.monthlySales).map(([month, amount]) => ({
    month: month,
    sales: amount
  })) : [];

  // Pagination functions
  const getCurrentPageItems = (items: unknown[], page: number) => {
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return items.slice(startIndex, endIndex);
  };

  const getTotalPages = (items: unknown[]) => {
    return Math.ceil(items.length / itemsPerPage);
  };

  if (loading || !stats) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-8 text-gray-500">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
      </div>

      {/* Updated Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">All Medicines</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.overview.totalMedicines}</div>
            <p className="text-xs text-muted-foreground">Active medicines</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.overview.lowStockCount}</div>
            <p className="text-xs text-muted-foreground">≤10 quantity</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expired</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.overview.expiredCount}</div>
            <p className="text-xs text-muted-foreground">Past expiry</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Profit</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-indigo-600">{formatPrice(stats.profit.total)}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>
      </div>

      {/* Second Row - Remaining Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profit This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{formatPrice(stats.profit.currentMonth)}</div>
            <p className="text-xs text-muted-foreground">Current month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.overview.totalSales}</div>
            <p className="text-xs text-muted-foreground">{formatPrice(stats.overview.totalSalesAmount)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sales This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.currentMonthSales.count}</div>
            <p className="text-xs text-muted-foreground">{formatPrice(stats.currentMonthSales.amount)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Sales Bar Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Sales by Month</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => formatPrice(Number(value))} />
                <Bar dataKey="sales" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top 5 Best Selling Products */}
        <Card>
          <CardHeader>
            <CardTitle>Top 5 Best Selling Products</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.topSellingMedicines.length === 0 ? (
              <p className="text-sm text-gray-500">No sales data available</p>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Quantity Sold</TableHead>
                      <TableHead>Revenue</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {getCurrentPageItems(stats.topSellingMedicines, currentPage).map((item) => {
                      const typedItem = item as { medicine: { id: number; name: string }; totalQuantity: number; totalRevenue: number };
                      return (
                      <TableRow key={typedItem.medicine.id}>
                        <TableCell className="font-medium">{typedItem.medicine.name}</TableCell>
                        <TableCell>{typedItem.totalQuantity}</TableCell>
                        <TableCell>{formatPrice(typedItem.totalRevenue)}</TableCell>
                      </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
                
                {getTotalPages(stats.topSellingMedicines) > 1 && (
                  <div className="flex items-center justify-between mt-4">
                    <div className="text-sm text-gray-500">
                      Page {currentPage} of {getTotalPages(stats.topSellingMedicines)}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                      >
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(Math.min(getTotalPages(stats.topSellingMedicines), currentPage + 1))}
                        disabled={currentPage === getTotalPages(stats.topSellingMedicines)}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Current Month Sales Table */}
        <Card>
          <CardHeader>
            <CardTitle>Current Month Sales</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.currentMonthSales.sales.length === 0 ? (
              <p className="text-sm text-gray-500">No sales this month</p>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Sale #</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {getCurrentPageItems(stats.currentMonthSales.sales, salesPage).map((sale) => {
                      const typedSale = sale as { id: number; saleNumber: string; customerName?: string; saleDate: string; totalAmount: number };
                      return (
                        <TableRow key={typedSale.id}>
                          <TableCell className="font-medium">{typedSale.saleNumber}</TableCell>
                          <TableCell>{typedSale.customerName || 'Walk-in'}</TableCell>
                          <TableCell>{formatDate(typedSale.saleDate)}</TableCell>
                          <TableCell>{formatPrice(Number(typedSale.totalAmount))}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
                
                {getTotalPages(stats.currentMonthSales.sales) > 1 && (
                  <div className="flex items-center justify-between mt-4">
                    <div className="text-sm text-gray-500">
                      Page {salesPage} of {getTotalPages(stats.currentMonthSales.sales)}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSalesPage(Math.max(1, salesPage - 1))}
                        disabled={salesPage === 1}
                      >
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSalesPage(Math.min(getTotalPages(stats.currentMonthSales.sales), salesPage + 1))}
                        disabled={salesPage === getTotalPages(stats.currentMonthSales.sales)}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* All Sales Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Sales</CardTitle>
        </CardHeader>
        <CardContent>
          {stats.recentSales.length === 0 ? (
            <p className="text-sm text-gray-500">No sales available</p>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Sale #</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Profit</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                    {getCurrentPageItems(stats.recentSales, allSalesPage).map((sale) => {
                      const typedSale = sale as { id: number; saleNumber: string; customerName?: string; saleDate: string; totalAmount: number; calculatedProfit?: number };
                      return (
                        <TableRow key={typedSale.id}>
                          <TableCell className="font-medium">{typedSale.saleNumber}</TableCell>
                          <TableCell>{typedSale.customerName || 'Walk-in'}</TableCell>
                          <TableCell>{formatDate(typedSale.saleDate)}</TableCell>
                          <TableCell>{formatPrice(Number(typedSale.totalAmount))}</TableCell>
                          <TableCell>
                            {typedSale.calculatedProfit ? formatPrice(typedSale.calculatedProfit) : '-'}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                </TableBody>
              </Table>
              
              {getTotalPages(stats.recentSales) > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-gray-500">
                    Page {allSalesPage} of {getTotalPages(stats.recentSales)}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setAllSalesPage(Math.max(1, allSalesPage - 1))}
                      disabled={allSalesPage === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setAllSalesPage(Math.min(getTotalPages(stats.recentSales), allSalesPage + 1))}
                      disabled={allSalesPage === getTotalPages(stats.recentSales)}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}