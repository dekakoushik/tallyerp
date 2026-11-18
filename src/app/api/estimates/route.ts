import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculateInvoiceTotals } from "@/lib/formatters";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const orgId = searchParams.get("organizationId");
    const status = searchParams.get("status");
    const query = searchParams.get("q");

    if (!orgId) {
      return NextResponse.json({ error: "organizationId is required" }, { status: 400 });
    }

    const where: any = { organizationId: orgId };
    if (status && status !== "ALL") {
      where.status = status;
    }
    if (query) {
      where.OR = [
        { estimateNumber: { contains: query } },
        { referenceNumber: { contains: query } },
        { customer: { name: { contains: query } } },
      ];
    }

    const estimates = await prisma.estimate.findMany({
      where,
      orderBy: { issueDate: "desc" },
      include: {
        customer: true,
        _count: {
          select: { items: true },
        },
      },
    });

    return NextResponse.json(estimates);
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
      estimateNumber: customEstimateNum,
      referenceNumber,
      issueDate = new Date(),
      expiryDate,
      status = "PENDING",
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
        { error: "At least one item is required on the estimate" },
        { status: 400 }
      );
    }

    const org = await prisma.organization.findUnique({
      where: { id: organizationId },
    });

    if (!org) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    let finalEstimateNumber = customEstimateNum;
    if (!finalEstimateNumber) {
      finalEstimateNumber = `${org.estimatePrefix}${org.nextEstimateNumber}`;
    }

    const calcTotals = calculateInvoiceTotals(items, discountType, discountValue);

    const calculatedExpiryDate = expiryDate
      ? new Date(expiryDate)
      : new Date(Date.now() + 30 * 86400000);

    const estimate = await prisma.$transaction(async (tx) => {
      const created = await tx.estimate.create({
        data: {
          organizationId,
          customerId,
          estimateNumber: finalEstimateNumber,
          referenceNumber,
          issueDate: new Date(issueDate),
          expiryDate: calculatedExpiryDate,
          status,
          subTotal: calcTotals.subTotal,
          discountType,
          discountValue: parseFloat(discountValue) || 0,
          discountAmount: calcTotals.discountAmount,
          taxAmount: calcTotals.taxAmount,
          totalAmount: calcTotals.totalAmount,
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

      if (!customEstimateNum) {
        await tx.organization.update({
          where: { id: organizationId },
          data: { nextEstimateNumber: { increment: 1 } },
        });
      }

      return created;
    });

    return NextResponse.json(estimate, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
