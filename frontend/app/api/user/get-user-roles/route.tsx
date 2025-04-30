import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function POST(req: Request) {
  const { pb_user_id } = await req.json();

  try {
    const result = await db.query(
      `
      SELECT r.title
      FROM "user_role" ur
      JOIN "role" r ON ur.roleid = r.roleid
      WHERE ur.userid = (
        SELECT u.userid
        FROM "user" u
        WHERE u.pb_user_id = $1
      )
    `,
      [pb_user_id]
    );

    if (result.rowCount === 0) {
      return NextResponse.json({ roles: [] });
    }

    const roles = result.rows.map((row: any) => row.title);
    return NextResponse.json({ roles });
  } catch (err) {
    console.error("Role fetch error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
