// app/api/organizations/[id]/route.ts
import db from "@/lib/db";
import { NextResponse } from "next/server";

export async function PUT(req: Request, context: { params: { id: string } }) {
  try {
    const { id } = context.params;
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
    console.error(`PUT /api/organizations/${context.params.id} error:`, err);
    return new NextResponse("Error updating organization", { status: 500 });
  }
}

export async function DELETE(_: Request, context: { params: { id: string } }) {
  try {
    const { id } = context.params;

    await db.query(`DELETE FROM "organization" WHERE organizationid = $1`, [
      id,
    ]);

    return new NextResponse(null, { status: 204 });
  } catch (err) {
    console.error(`DELETE /api/organizations/${context.params.id} error:`, err);
    return new NextResponse("Error deleting organization", { status: 500 });
  }
}
