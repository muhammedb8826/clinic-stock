import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Medicine } from '../medicines/entities/medicine.entity';
import { Sale } from '../sales/entities/sale.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Medicine) private readonly medicineRepo: Repository<Medicine>,
    @InjectRepository(Sale) private readonly saleRepo: Repository<Sale>,
  ) {}

  async getStats() {
    const today = new Date();
    
    // Get all medicines
    const medicines = await this.medicineRepo.find({
      where: { isActive: true },
      relations: ['category']
    });

    // Get all sales with items and medicine relations
    const sales = await this.saleRepo.find({
      relations: ['items', 'items.medicine'],
      order: { createdAt: 'DESC' }
    });

    // Calculate statistics
    const totalMedicines = medicines.length;
    
    const lowStockMedicines = medicines.filter(m => m.quantity <= 10);
    const lowStockCount = lowStockMedicines.length;
    
    const expiredMedicines = medicines.filter(m => {
      const expiryDate = new Date(m.expiryDate);
      return expiryDate <= today;
    });
    const expiredCount = expiredMedicines.length;

    const expiringSoonMedicines = medicines.filter(m => {
      const expiryDate = new Date(m.expiryDate);
      const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
    });
    const expiringSoonCount = expiringSoonMedicines.length;

    const totalSales = sales.length;
    const totalSalesAmount = sales.reduce((sum, sale) => sum + Number(sale.totalAmount), 0);

    // Calculate current month sales
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const currentMonthSales = sales.filter(sale => {
      const saleDate = new Date(sale.saleDate);
      return saleDate.getMonth() === currentMonth && saleDate.getFullYear() === currentYear;
    });
    const currentMonthSalesCount = currentMonthSales.length;
    const currentMonthSalesAmount = currentMonthSales.reduce((sum, sale) => sum + Number(sale.totalAmount), 0);

    // Calculate profit metrics
    const totalProfit = sales.reduce((sum, sale) => {
      const saleProfit = sale.items?.reduce((itemSum, item) => {
        if (item.medicine) {
          const profitPerUnit = Number(item.medicine.sellingPrice) - Number(item.medicine.costPrice);
          return itemSum + (profitPerUnit * item.quantity);
        }
        return itemSum;
      }, 0) || 0;
      return sum + saleProfit;
    }, 0);

    const currentMonthProfit = currentMonthSales.reduce((sum, sale) => {
      const saleProfit = sale.items?.reduce((itemSum, item) => {
        if (item.medicine) {
          const profitPerUnit = Number(item.medicine.sellingPrice) - Number(item.medicine.costPrice);
          return itemSum + (profitPerUnit * item.quantity);
        }
        return itemSum;
      }, 0) || 0;
      return sum + saleProfit;
    }, 0);

    // Get all sales with profit calculation
    const salesWithProfit = sales.map(sale => {
      const saleProfit = sale.items?.reduce((itemSum, item) => {
        if (item.medicine) {
          const profitPerUnit = Number(item.medicine.sellingPrice) - Number(item.medicine.costPrice);
          return itemSum + (profitPerUnit * item.quantity);
        }
        return itemSum;
      }, 0) || 0;
      return { ...sale, calculatedProfit: saleProfit };
    });

    const recentSales = salesWithProfit.slice(0, 10);

    // Get top selling medicines (by quantity sold)
    const medicineSales = new Map<number, { medicine: Medicine; totalQuantity: number; totalRevenue: number }>();
    
    sales.forEach(sale => {
      sale.items?.forEach(item => {
        if (item.medicine) {
          const existing = medicineSales.get(item.medicine.id) || { medicine: item.medicine, totalQuantity: 0, totalRevenue: 0 };
          existing.totalQuantity += item.quantity;
          existing.totalRevenue += Number(item.totalPrice);
          medicineSales.set(item.medicine.id, existing);
        }
      });
    });

    const topSellingMedicines = Array.from(medicineSales.values())
      .sort((a, b) => b.totalQuantity - a.totalQuantity)
      .slice(0, 5);

    // Get sales by month for the last 6 months
    const monthlySales = new Map<string, number>();
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    sales
      .filter(sale => new Date(sale.saleDate) >= sixMonthsAgo)
      .forEach(sale => {
        const month = new Date(sale.saleDate).toISOString().substring(0, 7); // YYYY-MM
        const existing = monthlySales.get(month) || 0;
        monthlySales.set(month, existing + Number(sale.totalAmount));
      });

    // Convert monthly sales map to array format
    const monthlySalesArray = Array.from(monthlySales.entries()).map(([month, sales]) => ({
      month,
      sales
    }));

    return {
      totalMedicines,
      lowStockCount,
      expiredCount,
      expiringSoonCount,
      totalSales,
      totalSalesAmount,
      currentMonthSales: {
        count: currentMonthSalesCount,
        amount: currentMonthSalesAmount,
        sales: currentMonthSales
      },
      currentMonthProfit,
      totalProfit,
      lowStockMedicines: lowStockMedicines.slice(0, 10),
      expiredMedicines: expiredMedicines.slice(0, 10),
      expiringSoonMedicines: expiringSoonMedicines.slice(0, 10),
      recentSales,
      topSellingMedicines: topSellingMedicines.map(med => ({
        id: med.medicine.id,
        name: med.medicine.name,
        quantitySold: med.totalQuantity,
        totalRevenue: med.totalRevenue
      })),
      monthlySales: monthlySalesArray
    };
  }
}
