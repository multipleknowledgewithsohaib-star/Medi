import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { getReportDateCutoff } from "../../../lib/reportDates";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const reportDateCutoff = getReportDateCutoff();
        const startDate = new Date("2010-01-01");
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Today's Sales
        const daySales = await prisma.sale.findMany({
            where: {
                date: {
                    gte: today,
                },
            },
        });

        const todaySalesAmount = daySales.reduce((sum, s) => sum + s.total, 0);

        // Total Revenue (From 2025)
        const allSales = await prisma.sale.findMany({
            where: {
                date: {
                    gte: startDate,
                }
            }
        });
        const totalRevenue = allSales.reduce((sum, s) => sum + s.total, 0);

        // Expiring Soon (Count 30 days)
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

        const [
            expiringSoonCount,
            recentSales,
            expiryAlerts,
            topSelling,
            stockProducts,
        ] = await Promise.all([
            prisma.batch.count({
                where: {
                    expiryDate: {
                        lte: thirtyDaysFromNow,
                        gte: new Date(),
                    },
                },
            }),
            prisma.saleItem.findMany({
                take: 5,
                where: {
                    sale: {
                        date: {
                            gte: startDate,
                        }
                    }
                },
                orderBy: {
                    sale: {
                        date: 'desc'
                    }
                },
                include: {
                    product: true,
                    sale: true,
                }
            }),
            prisma.batch.findMany({
                where: {
                    expiryDate: {
                        lte: thirtyDaysFromNow,
                    }
                },
                include: {
                    product: true
                },
                take: 5
            }),
            prisma.saleItem.groupBy({
                where: {
                    sale: {
                        date: {
                            gte: startDate,
                        }
                    }
                },
                by: ['productId'],
                _sum: {
                    quantity: true,
                    price: true
                },
                orderBy: {
                    _sum: {
                        quantity: 'desc'
                    }
                },
                take: 4
            }),
            prisma.product.findMany({
                select: {
                    id: true,
                    name: true,
                    stock: true,
                    batches: {
                        select: {
                            quantity: true,
                        },
                    },
                },
            }),
        ]);

        const productStockMap = new Map(stockProducts.map((product) => {
            const computedStock = product.batches.length > 0
                ? product.batches.reduce((sum, batch) => sum + (Number(batch.quantity) || 0), 0)
                : Number(product.stock) || 0;
            return [product.id, { name: product.name, stock: computedStock }];
        }));

        const lowStockItems = Array.from(productStockMap.values()).filter((product) => product.stock < 20).length;

        const topSellingProducts = topSelling.map((item) => {
            const product = productStockMap.get(item.productId);
            return {
                name: product?.name,
                sold: item._sum.quantity,
                revenue: item._sum.price,
                stock: product?.stock ?? 0
            };
        });

        return NextResponse.json({
            stats: {
                todaySales: todaySalesAmount,
                totalRevenue: totalRevenue,
                lowStock: lowStockItems,
                expiringSoon: expiringSoonCount
            },
            recentSales: recentSales.map(item => ({
                id: item.id,
                medicine: item.product.name,
                quantity: item.quantity,
                amount: item.price * item.quantity,
                time: item.sale.date
            })),
            expiryAlerts: expiryAlerts.map(b => {
                const diff = Math.ceil((new Date(b.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                return {
                    id: b.id,
                    medicine: b.product.name,
                    batch: b.batchNo,
                    days: diff,
                    quantity: b.quantity,
                    type: diff < 15 ? "critical" : diff < 30 ? "warning" : "info"
                };
            }),
            topSellingProducts
        });
    } catch (error) {
        console.error("Dashboard API Error:", error);
        return NextResponse.json({ error: "Failed to fetch dashboard data" }, { status: 500 });
    }
}
