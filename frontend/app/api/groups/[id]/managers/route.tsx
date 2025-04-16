import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const groupid = parseInt(params.id);

  try {
    const result = await db.query(
      `
      SELECT u.userid, u.name
      FROM holmz_schema.user_group ug
      JOIN holmz_schema."user" u ON ug.userid = u.userid
      WHERE ug.groupid = $1 AND ug.group_role = 'GM'
      `,
      [groupid]
    );

    return NextResponse.json(result.rows);
  } catch (err: any) {
    console.error("Failed to fetch group managers:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
