import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const orgId = searchParams.get("organizationId");
    const query = searchParams.get("q");

    if (!orgId) {
      return NextResponse.json({ error: "organizationId is required" }, { status: 400 });
    }

    const where: any = { organizationId: orgId };
    if (query) {
      where.OR = [
        { name: { contains: query } },
        { companyName: { contains: query } },
        { email: { contains: query } },
        { phone: { contains: query } },
      ];
    }

    const customers = await prisma.customer.findMany({
      where,
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: { invoices: true, estimates: true },
        },
      },
    });

    return NextResponse.json(customers);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      organizationId,
      name,
      companyName,
      type = "CUSTOMER",
      email,
      phone,
      taxId,
      billingAddress,
      shippingAddress,
      city,
      state,
      zipCode,
      country = "United States",
      creditLimit = 0,
      notes,
    } = body;

    if (!organizationId || !name) {
      return NextResponse.json(
        { error: "Organization ID and Customer Name are required" },
        { status: 400 }
      );
    }

    const customer = await prisma.customer.create({
      data: {
        organizationId,
        name,
        companyName,
        type,
        email,
        phone,
        taxId,
        billingAddress,
        shippingAddress,
        city,
        state,
        zipCode,
        country,
        creditLimit: parseFloat(creditLimit) || 0,
        notes,
      },
    });

    return NextResponse.json(customer, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
