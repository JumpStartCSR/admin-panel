import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const groupid = parseInt(params.id);
  const { name, description, priority, status, managers } = await req.json();

  await db.query(
    `
    UPDATE holmz_schema."group"
    SET name = $1, description = $2, priority = $3, status = $4
    WHERE groupid = $5
    `,
    [name, description, priority, status, groupid]
  );

  await db.query(
    `DELETE FROM holmz_schema.user_group WHERE groupid = $1 AND group_role = 'GM'`,
    [groupid]
  );

  const gmRoleRes = await db.query(
    `SELECT roleid FROM holmz_schema.role WHERE title = 'GM'`
  );
  const gmRoleId = gmRoleRes.rows[0]?.roleid;

  const groupOrgRes = await db.query(
    `SELECT organizationid FROM holmz_schema."group" WHERE groupid = $1`,
    [groupid]
  );
  const organizationid = groupOrgRes.rows[0]?.organizationid;

  const validUsers = await db.query(
    `SELECT userid FROM holmz_schema."user" WHERE organizationid = $1`,
    [organizationid]
  );
  const validUserIds = validUsers.rows.map((u) => u.userid);

  for (const userid of managers || []) {
    if (!validUserIds.includes(userid)) continue;

    await db.query(
      `INSERT INTO holmz_schema.user_group (userid, groupid, group_role)
       VALUES ($1, $2, 'GM')`,
      [userid, groupid]
    );

    const hasGMRole = await db.query(
      `SELECT 1 FROM holmz_schema.user_role WHERE userid = $1 AND roleid = $2`,
      [userid, gmRoleId]
    );

    if (hasGMRole.rowCount === 0) {
      await db.query(
        `INSERT INTO holmz_schema.user_role (userid, roleid)
         VALUES ($1, $2)`,
        [userid, gmRoleId]
      );
    }
  }

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
