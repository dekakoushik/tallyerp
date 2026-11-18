import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const orgId = searchParams.get("organizationId");
    const invoiceId = searchParams.get("invoiceId");

    if (!orgId) {
      return NextResponse.json({ error: "organizationId is required" }, { status: 400 });
    }

    const where: any = { organizationId: orgId };
    if (invoiceId) {
      where.invoiceId = invoiceId;
    }

    const payments = await prisma.payment.findMany({
      where,
      orderBy: { paymentDate: "desc" },
      include: {
        customer: true,
        invoice: {
          select: {
            id: true,
            invoiceNumber: true,
            totalAmount: true,
          },
        },
      },
    });

    return NextResponse.json(payments);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      organizationId,
      invoiceId,
      customerId: customCustId,
      amount,
      paymentMethod = "BANK_TRANSFER",
      paymentDate = new Date(),
      reference,
      notes,
    } = body;

    const payAmount = parseFloat(amount);
    if (!organizationId || !payAmount || payAmount <= 0) {
      return NextResponse.json(
        { error: "Organization ID and a valid payment amount are required" },
        { status: 400 }
      );
    }

    let customerId = customCustId;
    let invoice: any = null;

    if (invoiceId) {
      invoice = await prisma.invoice.findUnique({
        where: { id: invoiceId },
      });
      if (!invoice) {
        return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
      }
      customerId = invoice.customerId;
    }

    if (!customerId) {
      return NextResponse.json({ error: "Customer ID is required" }, { status: 400 });
    }

    const paymentCount = await prisma.payment.count({
      where: { organizationId },
    });
    const paymentNumber = `PAY-${1000 + paymentCount + 1}`;

    const payment = await prisma.$transaction(async (tx) => {
      const createdPayment = await tx.payment.create({
        data: {
          organizationId,
          invoiceId: invoiceId || null,
          customerId,
          paymentNumber,
          paymentDate: new Date(paymentDate),
          amount: payAmount,
          paymentMethod,
          reference,
          notes,
        },
      });

      // Update invoice if linked
      if (invoiceId && invoice) {
        const newPaidAmount = invoice.paidAmount + payAmount;
        const newBalance = Math.max(0, invoice.totalAmount - newPaidAmount);
        const newStatus = newBalance <= 0 ? "PAID" : "PARTIAL";

        await tx.invoice.update({
          where: { id: invoiceId },
          data: {
            paidAmount: newPaidAmount,
            balanceAmount: newBalance,
            status: newStatus,
          },
        });
      }

      // Update customer balance
      await tx.customer.update({
        where: { id: customerId },
        data: {
          currentBalance: { decrement: payAmount },
        },
      });

      return createdPayment;
    });

    return NextResponse.json(payment, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
