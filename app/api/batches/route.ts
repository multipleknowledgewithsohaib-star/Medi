import { NextResponse } from "next/server";
import { ADMIN_ROLE, POS_ROLE } from "@/lib/auth/access";
import { requireAuthenticatedUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
    const auth = await requireAuthenticatedUser([ADMIN_ROLE, POS_ROLE]);
    if ("response" in auth) {
        return auth.response;
    }

    try {
        const where = auth.user.role === POS_ROLE && auth.user.branchId
            ? { branchId: auth.user.branchId }
            : {};

        const batches = await prisma.batch.findMany({
            where,
            orderBy: { createdAt: "desc" },
            include: {
                product: {
                    select: {
                        name: true,
                        category: true,
                        salePrice: true
                    }
                },
                supplier: {
                    select: {
                        name: true
                    }
                }
            }
        });

        // Flatten mapping to match the frontend expectations in stock/page.tsx
        const normalizedBatches = batches.map(b => ({
            ...b,
            productName: b.product?.name || "Unknown Medicine",
            category: b.product?.category || "General",
            salePrice: b.product?.salePrice || 0
        }));

        return NextResponse.json(normalizedBatches);
    } catch (error: unknown) {
        console.error("Failed to load batches:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Failed to load batches" },
            { status: 500 }
        );
    }
}
