import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const orgId = searchParams.get("organizationId");

    if (!orgId) {
      return NextResponse.json({ error: "organizationId is required" }, { status: 400 });
    }

    const expenses = await prisma.expense.findMany({
      where: { organizationId: orgId },
      orderBy: { date: "desc" },
      include: { category: true },
    });

    return NextResponse.json(expenses);
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
      title,
      vendor,
      amount,
      date = new Date(),
      paymentMethod = "CASH",
      reference,
      description,
    } = body;

    if (!organizationId || !title || !amount) {
      return NextResponse.json(
        { error: "organizationId, title, and amount are required" },
        { status: 400 }
      );
    }

    const expense = await prisma.expense.create({
      data: {
        organizationId,
        categoryId: categoryId || null,
        title,
        vendor,
        amount: parseFloat(amount) || 0,
        date: new Date(date),
        paymentMethod,
        reference,
        description,
      },
    });

    return NextResponse.json(expense, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
