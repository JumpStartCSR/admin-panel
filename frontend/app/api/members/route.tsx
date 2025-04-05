// app/api/members/route.ts
import db from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const result = await db.query(`
    SELECT
      u.userid AS key,
      u.name,
      u.email,
      ARRAY_AGG(r.title) AS roles,
      u.status,
      TO_CHAR(u.dateadded, 'DD Mon, YYYY') AS dateadded,
      'Just now' AS lastactive
    FROM "user" u
    LEFT JOIN "user_role" ur ON u.userid = ur.userid
    LEFT JOIN "role" r ON ur.roleid = r.roleid
    GROUP BY u.userid, u.name, u.email, u.status, u.dateadded
    ORDER BY u.userid ASC
  `);

  return NextResponse.json(result.rows);
}

export async function POST(req: Request) {
  const { name, email, roles, organizationid, status } = await req.json();

  const insertUser = await db.query(
    `
    INSERT INTO "user" (name, email, organizationid, status)
    VALUES ($1, $2, $3, $4)
    RETURNING userid
    `,
    [name, email, organizationid, status || "Onboarded"]
  );

  const userid = insertUser.rows[0].userid;

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

  return NextResponse.json({ userid }, { status: 201 });
}
