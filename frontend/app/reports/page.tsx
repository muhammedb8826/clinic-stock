"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { salesApi } from "@/lib/api";
import { toast } from "sonner";
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

interface DailyReport {
  day: string;
  total: number;
  count: number;
}

interface WeeklyReport {
  week: string;
  total: number;
  count: number;
}

interface MonthlyReport {
  month: string;
  total: number;
  count: number;
}

export default function ReportsPage() {
  const [dailyReports, setDailyReports] = useState<DailyReport[]>([]);
  const [weeklyReports, setWeeklyReports] = useState<WeeklyReport[]>([]);
  const [monthlyReports, setMonthlyReports] = useState<MonthlyReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  useEffect(() => {
    const loadReports = async () => {
      try {
        const [dailyData, weeklyData, monthlyData] = await Promise.all([
          salesApi.reportDaily(),
          getWeeklyReports(),
          salesApi.reportMonthly()
        ]);

        setDailyReports(dailyData.map(item => ({
          day: item.day,
          total: parseFloat(item.total),
          count: 0 // We'll calculate this separately
        })));

        setWeeklyReports(weeklyData);

        setMonthlyReports(monthlyData.map(item => ({
          month: item.month,
          total: parseFloat(item.total),
          count: 0 // We'll calculate this separately
        })));

      } catch {
        toast.error("Failed to load reports");
      } finally {
        setLoading(false);
      }
    };

    loadReports();
  }, []);

  // Calculate weekly reports from daily data
  const getWeeklyReports = async (): Promise<WeeklyReport[]> => {
    try {
      const dailyData = await salesApi.reportDaily();
      const weeklyMap = new Map<string, { total: number; count: number }>();

      dailyData.forEach(item => {
        const date = new Date(item.day);
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay()); // Start of week (Sunday)
        const weekKey = weekStart.toISOString().substring(0, 10);

        const existing = weeklyMap.get(weekKey) || { total: 0, count: 0 };
        weeklyMap.set(weekKey, {
          total: existing.total + parseFloat(item.total),
          count: existing.count + 1
        });
      });

      return Array.from(weeklyMap.entries()).map(([week, data]) => ({
        week,
        total: data.total,
        count: data.count
      })).sort((a, b) => b.week.localeCompare(a.week));
    } catch {
      return [];
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-ET', {
      style: 'currency',
      currency: 'ETB'
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-ET', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatWeek = (weekString: string) => {
    const date = new Date(weekString);
    const endDate = new Date(date);
    endDate.setDate(date.getDate() + 6);
    return `${formatDate(weekString)} - ${formatDate(endDate.toISOString())}`;
  };

  const formatMonth = (monthString: string) => {
    const date = new Date(monthString + '-01');
    return date.toLocaleDateString('en-ET', {
      year: 'numeric',
      month: 'long'
    });
  };

  // Prepare chart data
  const getChartData = () => {
    switch (activeTab) {
      case 'daily':
        return dailyReports.map(report => ({
          period: new Date(report.day).toLocaleDateString('en-ET', { month: 'short', day: 'numeric' }),
          sales: report.total
        }));
      case 'weekly':
        return weeklyReports.map(report => ({
          period: `Week of ${new Date(report.week).toLocaleDateString('en-ET', { month: 'short', day: 'numeric' })}`,
          sales: report.total
        }));
      case 'monthly':
        return monthlyReports.map(report => ({
          period: new Date(report.month + '-01').toLocaleDateString('en-ET', { month: 'short', year: 'numeric' }),
          sales: report.total
        }));
      default:
        return [];
    }
  };

  const getCurrentReports = () => {
    switch (activeTab) {
      case 'daily':
        return dailyReports;
      case 'weekly':
        return weeklyReports;
      case 'monthly':
        return monthlyReports;
      default:
        return [];
    }
  };

  const getTotalSales = () => {
    const reports = getCurrentReports();
    return reports.reduce((sum, report) => sum + report.total, 0);
  };

  const getAverageSales = () => {
    const reports = getCurrentReports();
    if (reports.length === 0) return 0;
    return reports.reduce((sum, report) => sum + report.total, 0) / reports.length;
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-8 text-gray-500">Loading reports...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Sales Reports</h1>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-2">
        <Button
          variant={activeTab === 'daily' ? 'default' : 'outline'}
          onClick={() => setActiveTab('daily')}
        >
          Daily Reports
        </Button>
        <Button
          variant={activeTab === 'weekly' ? 'default' : 'outline'}
          onClick={() => setActiveTab('weekly')}
        >
          Weekly Reports
        </Button>
        <Button
          variant={activeTab === 'monthly' ? 'default' : 'outline'}
          onClick={() => setActiveTab('monthly')}
        >
          Monthly Reports
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPrice(getTotalSales())}</div>
            <p className="text-xs text-muted-foreground">{getCurrentReports().length} periods</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average per Period</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPrice(getAverageSales())}</div>
            <p className="text-xs text-muted-foreground">Mean sales amount</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Best Period</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {getCurrentReports().length > 0 
                ? formatPrice(Math.max(...getCurrentReports().map(r => r.total)))
                : formatPrice(0)
              }
            </div>
            <p className="text-xs text-muted-foreground">Highest sales amount</p>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      <Card>
        <CardHeader>
          <CardTitle>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Sales Chart</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={getChartData()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis />
                <Tooltip formatter={(value) => formatPrice(Number(value))} />
                <Line type="monotone" dataKey="sales" stroke="#3b82f6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Reports Table */}
      <Card>
        <CardHeader>
          <CardTitle>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Sales List</CardTitle>
        </CardHeader>
        <CardContent>
          {getCurrentReports().length === 0 ? (
            <p className="text-sm text-gray-500">No {activeTab} sales data available</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    {activeTab === 'daily' ? 'Date' : activeTab === 'weekly' ? 'Week' : 'Month'}
                  </TableHead>
                  <TableHead>Sales Count</TableHead>
                  <TableHead>Total Amount</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {getCurrentReports().map((report, index) => {
                  const isBest = report.total === Math.max(...getCurrentReports().map(r => r.total));
                  const isAboveAverage = report.total > getAverageSales();
                  
                  const getDateLabel = () => {
                    if (activeTab === 'daily') {
                      return formatDate((report as DailyReport).day);
                    } else if (activeTab === 'weekly') {
                      return formatWeek((report as WeeklyReport).week);
                    } else {
                      return formatMonth((report as MonthlyReport).month);
                    }
                  };
                  
                  return (
                    <TableRow key={index}>
                      <TableCell className="font-medium">
                        {getDateLabel()}
                      </TableCell>
                      <TableCell>{report.count}</TableCell>
                      <TableCell>{formatPrice(report.total)}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {isBest && <Badge variant="default">Best</Badge>}
                          {isAboveAverage && !isBest && <Badge variant="secondary">Above Avg</Badge>}
                          {!isAboveAverage && !isBest && <Badge variant="outline">Below Avg</Badge>}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
