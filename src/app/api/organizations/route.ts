import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const orgs = await prisma.organization.findMany({
      orderBy: [{ isDefault: "desc" }, { name: "asc" }],
      include: {
        _count: {
          select: {
            invoices: true,
            estimates: true,
            products: true,
            customers: true,
            farmBatches: true,
          },
        },
      },
    });
    return NextResponse.json(orgs);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      name,
      type = "COMPANY",
      legalName,
      taxId,
      registrationNumber,
      email,
      phone,
      website,
      currency = "INR",
      currencySymbol = "₹",
      address,
      city,
      state,
      country = "India",
      zipCode,
      bankName,
      bankAccount,
      bankIfscSwift,
      bankBranch,
      upiId,
      invoicePrefix = "INV-",
      estimatePrefix = "EST-",
      challanPrefix = "DC-",
      notesTerms,
      isDefault = false,
    } = body;

    if (!name) {
      return NextResponse.json({ error: "Organization name is required" }, { status: 400 });
    }

    if (isDefault) {
      await prisma.organization.updateMany({
        where: { isDefault: true },
        data: { isDefault: false },
      });
    }

    const org = await prisma.organization.create({
      data: {
        name,
        type,
        legalName,
        taxId,
        registrationNumber,
        email,
        phone,
        website,
        currency,
        currencySymbol,
        address,
        city,
        state,
        country,
        zipCode,
        bankName,
        bankAccount,
        bankIfscSwift,
        bankBranch,
        upiId,
        invoicePrefix,
        estimatePrefix,
        challanPrefix,
        notesTerms,
        isDefault,
      },
    });

    return NextResponse.json(org, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
