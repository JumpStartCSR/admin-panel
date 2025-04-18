import db from "@/lib/db";
import { NextResponse } from "next/server";

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const userid = parseInt(params.id);
  const { status, roles } = await req.json();

  const gmRoleRes = await db.query(
    `SELECT roleid FROM "role" WHERE title = 'GM'`
  );
  const gmRoleId = gmRoleRes.rows[0]?.roleid;

  const isRemovingGM = !roles.includes("GM");

  if (isRemovingGM && gmRoleId) {
    const stillManaging = await db.query(
      `SELECT 1 FROM "user_group" WHERE userid = $1 AND group_role = 'GM'`,
      [userid]
    );

    if (stillManaging.rowCount > 0) {
      return NextResponse.json(
        {
          error:
            "Cannot remove GM role. User is still assigned as a Group Manager. Remove them from all groups first.",
        },
        { status: 400 }
      );
    }
  }

  await db.query(`UPDATE "user" SET status = $1 WHERE userid = $2`, [
    status,
    userid,
  ]);

  await db.query(`DELETE FROM "user_role" WHERE userid = $1`, [userid]);

  for (const role of roles) {
    const roleRes = await db.query(
      `SELECT roleid FROM "role" WHERE title = $1`,
      [role]
    );
    const roleid = roleRes.rows[0]?.roleid;

    if (roleid == 0 || roleid == 1 || roleid == 2 || roleid == 3) {
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
