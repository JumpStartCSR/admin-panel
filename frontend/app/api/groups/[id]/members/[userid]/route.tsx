import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string; userid: string }> }
) {
  const { id, userid } = await params;
  const groupid = parseInt(id);
  const userId = parseInt(userid);
  const { role } = await req.json();

  if (isNaN(groupid) || isNaN(userId) || !role) {
    return NextResponse.json(
      { error: "Invalid group ID, user ID, or role" },
      { status: 400 }
    );
  }

  const gmRoleRes = await db.query(
    `SELECT roleid FROM holmz_schema.role WHERE title = 'GM'`
  );
  const gmRoleId = gmRoleRes.rows[0]?.roleid;

  const existing = await db.query(
    `SELECT group_role FROM holmz_schema.user_group WHERE groupid = $1 AND userid = $2`,
    [groupid, userId]
  );

  if (existing.rowCount === 0) {
    return NextResponse.json(
      { error: "User is not in the group" },
      { status: 404 }
    );
  }

  const oldRole = existing.rows[0].group_role;

  // Prevent removing last GM
  if (oldRole === "GM" && role !== "GM") {
    const gmCountRes = await db.query(
      `SELECT COUNT(*) FROM holmz_schema.user_group WHERE groupid = $1 AND group_role = 'GM'`,
      [groupid]
    );
    const gmCount = parseInt(gmCountRes.rows[0].count);
    if (gmCount === 1) {
      return NextResponse.json(
        { error: "At least one Group Manager is required." },
        { status: 400 }
      );
    }
  }

  // Update group role
  await db.query(
    `UPDATE holmz_schema.user_group SET group_role = $1 WHERE groupid = $2 AND userid = $3`,
    [role, groupid, userId]
  );

  if (role === "GM") {
    const hasGMRole = await db.query(
      `SELECT 1 FROM holmz_schema.user_role WHERE userid = $1 AND roleid = $2`,
      [userId, gmRoleId]
    );
    if (hasGMRole.rowCount === 0) {
      await db.query(
        `INSERT INTO holmz_schema.user_role (userid, roleid) VALUES ($1, $2)`,
        [userId, gmRoleId]
      );
    }
  } else if (oldRole === "GM") {
    const stillGM = await db.query(
      `SELECT 1 FROM holmz_schema.user_group WHERE userid = $1 AND group_role = 'GM'`,
      [userId]
    );
    if (stillGM.rowCount === 0) {
      await db.query(
        `DELETE FROM holmz_schema.user_role WHERE userid = $1 AND roleid = $2`,
        [userId, gmRoleId]
      );
    }
  }

  return NextResponse.json({ updated: true });
}

export async function DELETE(
  _: Request,
  { params }: { params: Promise<{ id: string; userid: string }> }
) {
  const { id, userid } = await params;
  const groupid = parseInt(id);
  const userId = parseInt(userid);

  if (isNaN(groupid) || isNaN(userId)) {
    return NextResponse.json(
      { error: "Invalid group ID or user ID" },
      { status: 400 }
    );
  }

  const gmRoleRes = await db.query(
    `SELECT roleid FROM holmz_schema.role WHERE title = 'GM'`
  );
  const gmRoleId = gmRoleRes.rows[0]?.roleid;

  const roleRes = await db.query(
    `SELECT group_role FROM holmz_schema.user_group WHERE userid = $1 AND groupid = $2`,
    [userId, groupid]
  );
  const role = roleRes.rows[0]?.group_role;

  // Prevent removing last GM
  if (role === "GM") {
    const gmCountRes = await db.query(
      `SELECT COUNT(*) FROM holmz_schema.user_group WHERE groupid = $1 AND group_role = 'GM'`,
      [groupid]
    );
    const gmCount = parseInt(gmCountRes.rows[0].count);
    if (gmCount === 1) {
      return NextResponse.json(
        { error: "Cannot remove the last Group Manager." },
        { status: 400 }
      );
    }
  }

  await db.query(
    `DELETE FROM holmz_schema.user_group WHERE groupid = $1 AND userid = $2`,
    [groupid, userId]
  );

  if (role === "GM") {
    const stillGM = await db.query(
      `SELECT 1 FROM holmz_schema.user_group WHERE userid = $1 AND group_role = 'GM'`,
      [userId]
    );
    if (stillGM.rowCount === 0) {
      await db.query(
        `DELETE FROM holmz_schema.user_role WHERE userid = $1 AND roleid = $2`,
        [userId, gmRoleId]
      );
    }
  }

  return new NextResponse(null, { status: 204 });
}
