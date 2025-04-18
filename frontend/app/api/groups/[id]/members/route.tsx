import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

// GET /api/groups/[groupid]/members
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const groupid = parseInt(params.id);

  const result = await db.query(
    `
    SELECT u.userid AS key, u.name, u.status, 
           CASE ug.group_role 
             WHEN 'GM' THEN 'Group Manager'
             ELSE 'Member'
           END AS role
    FROM holmz_schema.user_group ug
    JOIN holmz_schema."user" u ON u.userid = ug.userid
    WHERE ug.groupid = $1
    `,
    [groupid]
  );

  return NextResponse.json(result.rows);
}

// POST /api/groups/[groupid]/members
export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const groupid = parseInt(params.id);
  const { userIds, role } = await req.json();

  if (!Array.isArray(userIds) || userIds.length === 0 || !role) {
    return NextResponse.json(
      { error: "Missing user IDs or role." },
      { status: 400 }
    );
  }

  const gmRoleRes = await db.query(
    `SELECT roleid FROM holmz_schema.role WHERE title = 'GM'`
  );
  const gmRoleId = gmRoleRes.rows[0]?.roleid;

  for (const userid of userIds) {
    await db.query(
      `INSERT INTO holmz_schema.user_group (userid, groupid, group_role)
   VALUES ($1, $2, $3)
   ON CONFLICT (userid, groupid) DO UPDATE SET group_role = EXCLUDED.group_role`,
      [userid, groupid, role]
    );

    if (
      role === "GM" &&
      (gmRoleId == 0 || gmRoleId == 1 || gmRoleId == 2 || gmRoleId == 3)
    ) {
      const hasGMRole = await db.query(
        `SELECT 1 FROM holmz_schema.user_role WHERE userid = $1 AND roleid = $2`,
        [userid, gmRoleId]
      );

      if (hasGMRole.rowCount === 0) {
        await db.query(
          `INSERT INTO holmz_schema.user_role (userid, roleid) VALUES ($1, $2)`,
          [userid, gmRoleId]
        );
      }
    }
  }

  return NextResponse.json({ added: true });
}

// DELETE /api/groups/[groupid]/members/[userid]
export async function DELETE(
  req: Request,
  {
    params,
  }: {
    params: { groupid: string; userid: string };
  }
) {
  const groupid = parseInt(params.groupid);
  const userid = parseInt(params.userid);

  const gmRoleRes = await db.query(
    `SELECT roleid FROM holmz_schema.role WHERE title = 'GM'`
  );
  const gmRoleId = gmRoleRes.rows[0]?.roleid;

  await db.query(
    `DELETE FROM holmz_schema.user_group
     WHERE groupid = $1 AND userid = $2`,
    [groupid, userid]
  );

  const stillGM = await db.query(
    `SELECT 1 FROM holmz_schema.user_group
     WHERE userid = $1 AND group_role = 'GM'`,
    [userid]
  );

  if (stillGM.rowCount === 0) {
    await db.query(
      `DELETE FROM holmz_schema.user_role WHERE userid = $1 AND roleid = $2`,
      [userid, gmRoleId]
    );
  }

  return new NextResponse(null, { status: 204 });
}
