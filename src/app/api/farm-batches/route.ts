import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const orgId = searchParams.get("organizationId");
    const status = searchParams.get("status");

    if (!orgId) {
      return NextResponse.json({ error: "organizationId is required" }, { status: 400 });
    }

    const where: any = { organizationId: orgId };
    if (status && status !== "ALL") {
      where.status = status;
    }

    const batches = await prisma.farmBatch.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(batches);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      organizationId,
      batchCode,
      cropOrLivestock,
      fieldLocation,
      areaAcres = 0,
      plantedDate,
      expectedHarvestDate,
      expectedYield = 0,
      actualYield = 0,
      unit = "quintal",
      status = "GROWING",
      costIncurred = 0,
      revenueEarned = 0,
      notes,
    } = body;

    if (!organizationId || !cropOrLivestock) {
      return NextResponse.json(
        { error: "organizationId and cropOrLivestock are required" },
        { status: 400 }
      );
    }

    const count = await prisma.farmBatch.count({ where: { organizationId } });
    const code = batchCode || `BATCH-${new Date().getFullYear()}-${100 + count + 1}`;

    const batch = await prisma.farmBatch.create({
      data: {
        organizationId,
        batchCode: code,
        cropOrLivestock,
        fieldLocation,
        areaAcres: parseFloat(areaAcres) || 0,
        plantedDate: plantedDate ? new Date(plantedDate) : new Date(),
        expectedHarvestDate: expectedHarvestDate ? new Date(expectedHarvestDate) : null,
        expectedYield: parseFloat(expectedYield) || 0,
        actualYield: parseFloat(actualYield) || 0,
        unit,
        status,
        costIncurred: parseFloat(costIncurred) || 0,
        revenueEarned: parseFloat(revenueEarned) || 0,
        notes,
      },
    });

    return NextResponse.json(batch, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
