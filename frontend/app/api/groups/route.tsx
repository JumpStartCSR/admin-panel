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
      TO_CHAR(g.created_date, 'DD Mon, YYYY') AS created_date
    FROM holmz_schema."group" g
    WHERE g.organizationid = $1
    ORDER BY g.created_date DESC
    `,
    [organizationId]
  );

  return NextResponse.json(result.rows);
}

export async function POST(req: Request) {
  const { name, description, priority, status, created_date, organizationid } =
    await req.json();

  if (
    typeof organizationid === "undefined" ||
    typeof name === "undefined"
  ) {
    return NextResponse.json(
      { error: "Missing required fields: name, organizationid" },
      { status: 400 }
    );
  }

  const result = await db.query(
    `
    INSERT INTO holmz_schema."group" (name, description, priority, status, created_date, organizationid)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING groupid
    `,
    [
      name,
      description || "",
      priority || "Medium",
      status || "Active",
      created_date || new Date(),
      organizationid,
    ]
  );

  return NextResponse.json(
    { groupid: result.rows[0].groupid },
    { status: 201 }
  );
}
