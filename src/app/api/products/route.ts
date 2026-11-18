import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const orgId = searchParams.get("organizationId");
    const isAgri = searchParams.get("isAgricultural");
    const query = searchParams.get("q");

    if (!orgId) {
      return NextResponse.json({ error: "organizationId is required" }, { status: 400 });
    }

    const where: any = { organizationId: orgId };
    if (isAgri === "true") {
      where.isAgricultural = true;
    }
    if (query) {
      where.OR = [
        { name: { contains: query } },
        { sku: { contains: query } },
        { description: { contains: query } },
      ];
    }

    const products = await prisma.product.findMany({
      where,
      orderBy: { name: "asc" },
      include: {
        category: true,
      },
    });

    return NextResponse.json(products);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      organizationId,
      categoryId,
      sku,
      name,
      description,
      unit = "unit",
      salePrice = 0,
      costPrice = 0,
      taxRate = 0,
      hsnSacCode,
      stockQuantity = 0,
      lowStockAlert = 5,
      isAgricultural = false,
      grade,
      trackInventory = true,
    } = body;

    if (!organizationId || !name) {
      return NextResponse.json(
        { error: "organizationId and name are required" },
        { status: 400 }
      );
    }

    const product = await prisma.product.create({
      data: {
        organizationId,
        categoryId: categoryId || null,
        sku,
        name,
        description,
        unit,
        salePrice: parseFloat(salePrice) || 0,
        costPrice: parseFloat(costPrice) || 0,
        taxRate: parseFloat(taxRate) || 0,
        hsnSacCode,
        stockQuantity: parseFloat(stockQuantity) || 0,
        lowStockAlert: parseFloat(lowStockAlert) || 5,
        isAgricultural: Boolean(isAgricultural),
        grade,
        trackInventory: Boolean(trackInventory),
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
