import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const orgId = searchParams.get("organizationId");

    if (!orgId) {
      return NextResponse.json({ error: "organizationId is required" }, { status: 400 });
    }

    // 1. Total revenue and outstanding amounts
    const invoices = await prisma.invoice.findMany({
      where: { organizationId: orgId },
      select: {
        id: true,
        invoiceNumber: true,
        issueDate: true,
        dueDate: true,
        status: true,
        totalAmount: true,
        paidAmount: true,
        balanceAmount: true,
        customer: { select: { name: true } },
      },
      orderBy: { issueDate: "desc" },
    });

    const totalInvoiced = invoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
    const totalCollected = invoices.reduce((sum, inv) => sum + inv.paidAmount, 0);
    const totalOutstanding = invoices.reduce((sum, inv) => sum + inv.balanceAmount, 0);
    const overdueCount = invoices.filter(
      (inv) => inv.balanceAmount > 0 && new Date(inv.dueDate) < new Date()
    ).length;

    // 2. Total expenses
    const expenses = await prisma.expense.findMany({
      where: { organizationId: orgId },
      select: { amount: true },
    });
    const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);

    // 3. Estimates count
    const estimatesCount = await prisma.estimate.count({
      where: { organizationId: orgId },
    });

    // 4. Low stock products
    const lowStockProducts = await prisma.product.findMany({
      where: {
        organizationId: orgId,
        trackInventory: true,
        stockQuantity: { lte: 10 },
      },
      take: 5,
    });

    // 5. Active farm batches
    const farmBatches = await prisma.farmBatch.findMany({
      where: { organizationId: orgId },
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    // 6. Recent invoices
    const recentInvoices = invoices.slice(0, 5);

    // 7. Recent payments
    const recentPayments = await prisma.payment.findMany({
      where: { organizationId: orgId },
      orderBy: { paymentDate: "desc" },
      take: 5,
      include: { customer: true },
    });

    return NextResponse.json({
      metrics: {
        totalInvoiced,
        totalCollected,
        totalOutstanding,
        totalExpenses,
        netIncome: totalCollected - totalExpenses,
        overdueCount,
        estimatesCount,
        invoicesCount: invoices.length,
      },
      recentInvoices,
      recentPayments,
      lowStockProducts,
      farmBatches,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
