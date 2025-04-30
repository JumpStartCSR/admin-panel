import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const organizationId = searchParams.get("organizationId");

  if (typeof organizationId === "undefined") {
    return NextResponse.json(
      { error: "organizationId is required" },
      { status: 400 }
    );
  }

  const result = await db.query(
    `
    SELECT
      g.groupid AS key,
      g.name,
      g.description,
      g.priority,
      g.status,
      TO_CHAR(g.created_date, 'DD Mon, YYYY') AS created_date,
      ARRAY_AGG(u.name) FILTER (WHERE ug.group_role = 'GM') AS managers,
      COUNT(DISTINCT ug.userid) AS member_count
    FROM holmz_schema."group" g
    LEFT JOIN holmz_schema.user_group ug ON g.groupid = ug.groupid
    LEFT JOIN holmz_schema."user" u ON ug.userid = u.userid
    WHERE g.organizationid = $1
    GROUP BY g.groupid
    ORDER BY g.created_date DESC
    `,
    [organizationId]
  );

  return NextResponse.json(result.rows);
}

export async function POST(req: Request) {
  const { name, description, priority, status, organizationid, managers } =
    await req.json();

  if (typeof name === "undefined" || typeof organizationid === "undefined") {
    return NextResponse.json(
      { error: "Missing required fields." },
      { status: 400 }
    );
  }

  const insertGroup = await db.query(
    `
    INSERT INTO holmz_schema."group" (name, description, priority, status, organizationid, created_date)
    VALUES ($1, $2, $3, $4, $5, NOW())
    RETURNING groupid
    `,
    [
      name,
      description || "",
      priority || "Medium",
      status || "Active",
      organizationid,
    ]
  );

  const groupid = insertGroup.rows[0]?.groupid;
  if (!groupid)
    return NextResponse.json(
      { error: "Failed to create group." },
      { status: 500 }
    );

  const gmRoleRes = await db.query(
    `SELECT roleid FROM holmz_schema.role WHERE title = 'GM'`
  );
  const gmRoleId = gmRoleRes.rows[0]?.roleid;

  const validUsers = await db.query(
    `SELECT userid FROM holmz_schema."user" WHERE organizationid = $1`,
    [organizationid]
  );
  const validUserIds = validUsers.rows.map((u: any) => u.userid);

  for (const userid of managers || []) {
    if (!validUserIds.includes(userid)) continue;

    await db.query(
      `INSERT INTO holmz_schema.user_group (userid, groupid, group_role) VALUES ($1, $2, 'GM')`,
      [userid, groupid]
    );

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

  return NextResponse.json({ groupid }, { status: 201 });
}
