// =============================================
// ⚠️ TRIGGER PURPOSE:
// This trigger ensures that a user always has at least one role.
// If a user’s last role is removed (via DELETE from user_role),
// this trigger will automatically assign the 'Individual' role.
//
// ✅ This is a *fail-safe* to prevent users from being role-less,
// especially in edge cases where business logic fails at the app layer.
//
// ⚠️ WARNING:
// - This trigger only fires on DELETE from user_role.
// - App logic should still handle role updates explicitly.
// - Make sure app-level code does NOT rely solely on this behavior.
//
// 📌 Defined on: holmz_schema.user_role
// =============================================

// -- CREATE FUNCTION
/*
CREATE OR REPLACE FUNCTION holmz_schema.ensure_user_has_role()
RETURNS TRIGGER AS $$
DECLARE
  remaining_roles INT;
  individual_role_id INT;
BEGIN
  -- Count how many roles remain for the user
  SELECT COUNT(*) INTO remaining_roles
  FROM holmz_schema.user_role
  WHERE userid = OLD.userid;

  -- If no roles remain, assign 'Individual'
  IF remaining_roles = 0 THEN
    SELECT roleid INTO individual_role_id
    FROM holmz_schema.role
    WHERE title = 'Individual';

    INSERT INTO holmz_schema.user_role (userid, roleid)
    VALUES (OLD.userid, individual_role_id)
    ON CONFLICT DO NOTHING;
  END IF;

  RETURN OLD;
END;
$$ LANGUAGE plpgsql;
*/

// -- CREATE TRIGGER
/*
CREATE TRIGGER trg_assign_individual_on_role_removal
AFTER DELETE ON holmz_schema.user_role
FOR EACH ROW
EXECUTE FUNCTION holmz_schema.ensure_user_has_role();
*/

import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const userid = parseInt(params.id);
  const { status, roles } = await req.json();

  if (isNaN(userid) || !Array.isArray(roles)) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

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

  const uniqueRoles = [...new Set(roles)];

  for (const role of uniqueRoles) {
    const roleRes = await db.query(
      `SELECT roleid FROM "role" WHERE title = $1`,
      [role]
    );
    const roleid = roleRes.rows[0]?.roleid;

    if (roleid === 0 || roleid === 1 || roleid === 2 || roleid === 3) {
      await db.query(
        `INSERT INTO "user_role" (userid, roleid)
         VALUES ($1, $2)
         ON CONFLICT DO NOTHING`,
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
