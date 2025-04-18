import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function PUT(
  req: Request,
  { params }: { params: { id: string; userid: string } }
) {
  const groupid = parseInt(params.id);
  const userid = parseInt(params.userid);
  const { role } = await req.json();

  if (isNaN(groupid) || isNaN(userid) || !role) {
    return NextResponse.json(
      { error: "Invalid group ID, user ID, or role" },
      { status: 400 }
    );
  }

  // Check if user exists in the group already
  const existing = await db.query(
    `SELECT 1 FROM holmz_schema.user_group WHERE groupid = $1 AND userid = $2`,
    [groupid, userid]
  );

  if (existing.rowCount === 0) {
    return NextResponse.json(
      { error: "User is not in the group" },
      { status: 404 }
    );
  }

  // Update the user's group role
  await db.query(
    `UPDATE holmz_schema.user_group
     SET group_role = $1
     WHERE groupid = $2 AND userid = $3`,
    [role, groupid, userid]
  );

  return NextResponse.json({ updated: true });
}

export async function DELETE(
  _: Request,
  { params }: { params: { id: string; userid: string } }
) {
  const groupid = parseInt(params.id);
  const userid = parseInt(params.userid);

  if (isNaN(groupid) || isNaN(userid)) {
    return NextResponse.json(
      { error: "Invalid group ID or user ID" },
      { status: 400 }
    );
  }

  // First, get the role ID of GM for possible cleanup
  const gmRoleRes = await db.query(
    `SELECT roleid FROM holmz_schema.role WHERE title = 'GM'`
  );
  const gmRoleId = gmRoleRes.rows[0]?.roleid;

  // Delete from user_group
  await db.query(
    `DELETE FROM holmz_schema.user_group
     WHERE groupid = $1 AND userid = $2`,
    [groupid, userid]
  );

  // If they no longer manage any groups, remove GM role from user
  const stillGM = await db.query(
    `SELECT 1 FROM holmz_schema.user_group
     WHERE userid = $1 AND group_role = 'GM'`,
    [userid]
  );

  if (stillGM.rowCount === 0) {
    await db.query(
      `DELETE FROM holmz_schema.user_role
       WHERE userid = $1 AND roleid = $2`,
      [userid, gmRoleId]
    );
  }

  return new NextResponse(null, { status: 204 });
}
