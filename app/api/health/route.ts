import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getReportDateCutoff } from "@/lib/reportDates";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const reportDateCutoff = getReportDateCutoff();
        const [
            products,
            suppliers,
            purchases,
            batches,
            sales,
            purchaseTotals,
            saleTotals,
            batchTotals,
        ] = await Promise.all([
            prisma.product.count(),
            prisma.supplier.count(),
            prisma.purchase.count({
                where: { date: { lte: reportDateCutoff } },
            }),
            prisma.batch.count(),
            prisma.sale.count({
                where: { date: { lte: reportDateCutoff } },
            }),
            prisma.purchase.aggregate({
                where: { date: { lte: reportDateCutoff } },
                _sum: { total: true },
            }),
            prisma.sale.aggregate({
                where: { date: { lte: reportDateCutoff } },
                _sum: { total: true },
            }),
            prisma.batch.aggregate({
                _sum: { quantity: true },
            }),
        ]);

        return NextResponse.json({
            status: "ok",
            reportDateCutoff: reportDateCutoff.toISOString(),
            counts: {
                products,
                suppliers,
                purchases,
                batches,
                sales,
            },
            totals: {
                purchaseAmount: purchaseTotals._sum.total || 0,
                saleAmount: saleTotals._sum.total || 0,
                batchQuantity: batchTotals._sum.quantity || 0,
            },
        });
    } catch (error) {
        return NextResponse.json(
            {
                status: "error",
                error: error instanceof Error ? error.message : "Health check failed",
            },
            { status: 500 }
        );
    }
}
