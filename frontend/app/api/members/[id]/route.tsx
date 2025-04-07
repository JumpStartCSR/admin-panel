import db from "@/lib/db";
import { NextResponse } from "next/server";

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const userid = parseInt(params.id);
  const { name, status, roles } = await req.json();

  // Update user data
  await db.query(
    `
    UPDATE "user"
    SET name = $1, status = $2
    WHERE userid = $3
    `,
    [name, status, userid]
  );

  // Remove old roles
  await db.query(`DELETE FROM "user_role" WHERE userid = $1`, [userid]);

  // Add updated roles
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

  // Delete user and cascade roles
  await db.query(`DELETE FROM "user" WHERE userid = $1`, [userid]);

  return new NextResponse(null, { status: 204 });
}
