import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const data: any = { ...body };
    if (data.areaAcres !== undefined) data.areaAcres = parseFloat(data.areaAcres);
    if (data.expectedYield !== undefined) data.expectedYield = parseFloat(data.expectedYield);
    if (data.actualYield !== undefined) data.actualYield = parseFloat(data.actualYield);
    if (data.costIncurred !== undefined) data.costIncurred = parseFloat(data.costIncurred);
    if (data.revenueEarned !== undefined) data.revenueEarned = parseFloat(data.revenueEarned);
    if (data.plantedDate) data.plantedDate = new Date(data.plantedDate);
    if (data.expectedHarvestDate) data.expectedHarvestDate = new Date(data.expectedHarvestDate);
    if (data.harvestDate) data.harvestDate = new Date(data.harvestDate);

    const updated = await prisma.farmBatch.update({
      where: { id },
      data,
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.farmBatch.delete({
      where: { id },
    });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
