import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const estimate = await prisma.estimate.findUnique({
      where: { id },
      include: {
        items: true,
        organization: true,
      },
    });

    if (!estimate) {
      return NextResponse.json({ error: "Estimate not found" }, { status: 404 });
    }

    if (estimate.status === "CONVERTED" && estimate.convertedInvoiceId) {
      return NextResponse.json(
        { error: "This estimate has already been converted to an invoice." },
        { status: 400 }
      );
    }

    const org = estimate.organization;
    const invoiceNumber = `${org.invoicePrefix}${org.nextInvoiceNumber}`;
    const dueDate = new Date(Date.now() + 15 * 86400000);

    const invoice = await prisma.$transaction(async (tx) => {
      // Create invoice from estimate details
      const newInvoice = await tx.invoice.create({
        data: {
          organizationId: estimate.organizationId,
          customerId: estimate.customerId,
          invoiceNumber,
          referenceNumber: `From ${estimate.estimateNumber}`,
          issueDate: new Date(),
          dueDate,
          status: "UNPAID",
          type: "TAX_INVOICE",
          subTotal: estimate.subTotal,
          discountType: estimate.discountType,
          discountValue: estimate.discountValue,
          discountAmount: estimate.discountAmount,
          taxAmount: estimate.taxAmount,
          totalAmount: estimate.totalAmount,
          paidAmount: 0,
          balanceAmount: estimate.totalAmount,
          notes: estimate.notes,
          terms: estimate.terms,
          items: {
            create: estimate.items.map((item) => ({
              productId: item.productId,
              itemName: item.itemName,
              description: item.description,
              quantity: item.quantity,
              unit: item.unit,
              unitPrice: item.unitPrice,
              discountPercent: item.discountPercent,
              taxRate: item.taxRate,
              taxAmount: item.taxAmount,
              total: item.total,
            })),
          },
        },
      });

      // Update estimate status and link
      await tx.estimate.update({
        where: { id },
        data: {
          status: "CONVERTED",
          convertedInvoiceId: newInvoice.id,
        },
      });

      // Increment org nextInvoiceNumber
      await tx.organization.update({
        where: { id: estimate.organizationId },
        data: { nextInvoiceNumber: { increment: 1 } },
      });

      // Update customer balance
      await tx.customer.update({
        where: { id: estimate.customerId },
        data: {
          currentBalance: { increment: estimate.totalAmount },
        },
      });

      // Deduct inventory
      for (const item of estimate.items) {
        if (item.productId) {
          const prod = await tx.product.findUnique({
            where: { id: item.productId },
          });
          if (prod && prod.trackInventory) {
            await tx.product.update({
              where: { id: item.productId },
              data: { stockQuantity: { decrement: item.quantity } },
            });
          }
        }
      }

      return newInvoice;
    });

    return NextResponse.json(invoice, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
