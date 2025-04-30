import db from "@/lib/db";
import { NextResponse } from "next/server";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { name, startDate, endDate } = await req.json();

    await db.query(
      `
      UPDATE "organization"
      SET name = $1,
          contract_start_date = $2,
          contract_end_date = $3
      WHERE organizationid = $4;
      `,
      [name, startDate, endDate || null, id]
    );

    return NextResponse.json({ updated: true });
  } catch (err) {
    const resolved = await params;
    console.error(`PUT /api/organizations/${resolved.id} error:`, err);
    return new NextResponse("Error updating organization", { status: 500 });
  }
}

export async function DELETE(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await db.query(`DELETE FROM "organization" WHERE organizationid = $1`, [
      id,
    ]);

    return new NextResponse(null, { status: 204 });
  } catch (err) {
    const resolved = await params;
    console.error(`DELETE /api/organizations/${resolved.id} error:`, err);
    return new NextResponse("Error deleting organization", { status: 500 });
  }
}
