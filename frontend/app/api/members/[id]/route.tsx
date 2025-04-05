// app/api/members/[id]/route.ts
import db from "@/lib/db";
import { NextResponse } from "next/server";

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const userid = parseInt(params.id);
  const { name, email, status, roles } = await req.json();

  await db.query(
    `
    UPDATE "user"
    SET name = $1, email = $2, status = $3
    WHERE userid = $4
    `,
    [name, email, status, userid]
  );

  await db.query(`DELETE FROM "user_role" WHERE userid = $1`, [userid]);

  for (const role of roles) {
    const roleRes = await db.query(
      `SELECT roleid FROM "role" WHERE title = $1`,
      [role]
    );
    const roleid = roleRes.rows[0]?.roleid;
    if (roleid) {
      await db.query(
        `INSERT INTO "user_role" (userid, roleid) VALUES ($1, $2)`,
        [userid, roleid]
      );
    }
  }

  return NextResponse.json({ updated: true });
}

export async function DELETE(
  _: Request,
  { params }: { params: { id: string } }
) {
  const userid = parseInt(params.id);

  await db.query(`DELETE FROM "user" WHERE userid = $1`, [userid]);

  return new NextResponse(null, { status: 204 });
}
