import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculateInvoiceTotals } from "@/lib/formatters";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const orgId = searchParams.get("organizationId");
    const status = searchParams.get("status");
    const customerId = searchParams.get("customerId");
    const query = searchParams.get("q");

    if (!orgId) {
      return NextResponse.json({ error: "organizationId is required" }, { status: 400 });
    }

    const where: any = { organizationId: orgId };
    if (status && status !== "ALL") {
      where.status = status;
    }
    if (customerId) {
      where.customerId = customerId;
    }
    if (query) {
      where.OR = [
        { invoiceNumber: { contains: query } },
        { referenceNumber: { contains: query } },
        { customer: { name: { contains: query } } },
        { customer: { companyName: { contains: query } } },
      ];
    }

    const invoices = await prisma.invoice.findMany({
      where,
      orderBy: { issueDate: "desc" },
      include: {
        customer: true,
        _count: {
          select: { items: true, payments: true },
        },
      },
    });

    return NextResponse.json(invoices);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      organizationId,
      customerId,
      invoiceNumber: customInvoiceNum,
      referenceNumber,
      issueDate = new Date(),
      dueDate,
      status = "UNPAID",
      type = "TAX_INVOICE",
      discountType = "FIXED",
      discountValue = 0,
      notes,
      terms,
      items = [],
    } = body;

    if (!organizationId || !customerId) {
      return NextResponse.json(
        { error: "organizationId and customerId are required" },
        { status: 400 }
      );
    }

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: "At least one item is required on the invoice" },
        { status: 400 }
      );
    }

    const org = await prisma.organization.findUnique({
      where: { id: organizationId },
    });

    if (!org) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    // Determine invoice number
    let finalInvoiceNumber = customInvoiceNum;
    if (!finalInvoiceNumber) {
      finalInvoiceNumber = `${org.invoicePrefix}${org.nextInvoiceNumber}`;
    }

    // Calculate totals
    const calcTotals = calculateInvoiceTotals(items, discountType, discountValue);

    const calculatedDueDate = dueDate
      ? new Date(dueDate)
      : new Date(Date.now() + 15 * 86400000);

    // Database transaction to create invoice, invoice items, decrement stock, and update customer balance
    const newInvoice = await prisma.$transaction(async (tx) => {
      const invoice = await tx.invoice.create({
        data: {
          organizationId,
          customerId,
          invoiceNumber: finalInvoiceNumber,
          referenceNumber,
          issueDate: new Date(issueDate),
          dueDate: calculatedDueDate,
          status,
          type,
          subTotal: calcTotals.subTotal,
          discountType,
          discountValue: parseFloat(discountValue) || 0,
          discountAmount: calcTotals.discountAmount,
          taxAmount: calcTotals.taxAmount,
          totalAmount: calcTotals.totalAmount,
          paidAmount: 0,
          balanceAmount: calcTotals.totalAmount,
          notes: notes || null,
          terms: terms || org.notesTerms,
          items: {
            create: items.map((item: any) => {
              const qty = parseFloat(item.quantity) || 1;
              const price = parseFloat(item.unitPrice) || 0;
              const disc = parseFloat(item.discountPercent) || 0;
              const tax = parseFloat(item.taxRate) || 0;

              const base = qty * price;
              const discVal = base * (disc / 100);
              const taxable = Math.max(0, base - discVal);
              const taxVal = taxable * (tax / 100);
              const itemTotal = taxable + taxVal;

              return {
                productId: item.productId || null,
                itemName: item.itemName,
                description: item.description || null,
                quantity: qty,
                unit: item.unit || "unit",
                unitPrice: price,
                discountPercent: disc,
                taxRate: tax,
                taxAmount: Math.round(taxVal * 100) / 100,
                total: Math.round(itemTotal * 100) / 100,
              };
            }),
          },
        },
        include: {
          customer: true,
          items: true,
        },
      });

      // Update next invoice number if auto-generated
      if (!customInvoiceNum) {
        await tx.organization.update({
          where: { id: organizationId },
          data: { nextInvoiceNumber: { increment: 1 } },
        });
      }

      // Update customer balance
      await tx.customer.update({
        where: { id: customerId },
        data: {
          currentBalance: { increment: calcTotals.totalAmount },
        },
      });

      // Deduct inventory where applicable
      for (const item of items) {
        if (item.productId) {
          const prod = await tx.product.findUnique({
            where: { id: item.productId },
          });
          if (prod && prod.trackInventory) {
            await tx.product.update({
              where: { id: item.productId },
              data: {
                stockQuantity: { decrement: parseFloat(item.quantity) || 1 },
              },
            });
          }
        }
      }

      return invoice;
    });

    return NextResponse.json(newInvoice, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
