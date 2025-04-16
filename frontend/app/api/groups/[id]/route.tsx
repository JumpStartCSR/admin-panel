import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const groupid = parseInt(params.id);
  const { name, description, priority, status } = await req.json();

  await db.query(
    `
    UPDATE holmz_schema."group"
    SET name = $1, description = $2, priority = $3, status = $4
    WHERE groupid = $5
    `,
    [name, description, priority, status, groupid]
  );

  return NextResponse.json({ updated: true });
}

export async function DELETE(
  _: Request,
  { params }: { params: { id: string } }
) {
  const groupid = parseInt(params.id);

  try {
    await db.query(`DELETE FROM holmz_schema."group" WHERE groupid = $1`, [
      groupid,
    ]);
    return new NextResponse(null, { status: 204 });
  } catch (err: any) {
    console.error("Delete error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
