import db from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const organizationId = searchParams.get("organizationId");

  const baseQuery = `
    SELECT
      u.userid AS key,
      u.name,
      u.email,
      ARRAY_AGG(r.title) AS roles,
      u.status,
      TO_CHAR(u.dateadded, 'DD Mon, YYYY') AS dateadded,
      COALESCE(
      TO_CHAR(
        latest_log.latest_activity AT TIME ZONE 'UTC' AT TIME ZONE 'America/Los_Angeles',
        'DD Mon, YYYY'),'—') AS lastactive,
      latest_log.loginsperday,
      latest_log.timeusedperday,
      total_log.totallogins
    FROM "user" u
    LEFT JOIN "user_role" ur ON u.userid = ur.userid
    LEFT JOIN "role" r ON ur.roleid = r.roleid

    -- latest activity log per user
    LEFT JOIN (
      SELECT DISTINCT ON (userid)
        userid,
        created_at AS latest_activity,
        loginsperday,
        timeusedperday
      FROM user_activity_log
      ORDER BY userid, created_at DESC
    ) latest_log ON u.userid = latest_log.userid

    -- total logins summed across all days
    LEFT JOIN (
      SELECT userid, SUM(loginsperday)::INTEGER AS totallogins
      FROM user_activity_log
      GROUP BY userid
    ) total_log ON u.userid = total_log.userid

    ${organizationId ? `WHERE u.organizationid = $1` : ""}
    GROUP BY
      u.userid, u.name, u.email, u.status, u.dateadded,
      latest_log.latest_activity, latest_log.loginsperday, latest_log.timeusedperday,
      total_log.totallogins
    ORDER BY u.userid ASC
  `;

  const result = organizationId
    ? await db.query(baseQuery, [organizationId])
    : await db.query(baseQuery);

  return NextResponse.json(result.rows);
}

export async function POST(req: Request) {
  const { pbUserID, name, roles, status, organizationid } = await req.json();

  const insertUser = await db.query(
    `
    INSERT INTO "user" (pb_user_id, name, organizationid, status)
    VALUES ($1, $2, $3, $4)
    RETURNING userid
    `,
    [pbUserID, name, organizationid, status || "Onboarded"]
  );

  const userid = insertUser.rows[0]?.userid;

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

  return NextResponse.json({ userid }, { status: 201 });
}
