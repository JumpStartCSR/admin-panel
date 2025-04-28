import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function POST(req: Request) {
  const { pb_user_id, date, timeused, login } = await req.json();

  if (!pb_user_id || !date) {
    return NextResponse.json(
      { error: "pb_user_id and date are required" },
      { status: 400 }
    );
  }

  const userRes = await db.query(
    `SELECT userid FROM holmz_schema."user" WHERE pb_user_id = $1`,
    [pb_user_id]
  );

  const userid = userRes.rows[0]?.userid;
  if (typeof userid === "undefined") {
    return NextResponse.json(
      { error: "User not found in PostgreSQL" },
      { status: 404 }
    );
  }

  const existing = await db.query(
    `SELECT * FROM holmz_schema.user_activity_log WHERE userid = $1 AND date = $2`,
    [userid, date]
  );

  if (existing.rowCount === 0) {
    await db.query(
      `INSERT INTO holmz_schema.user_activity_log
        (userid, date, timeusedperday, loginsperday, timeusedpersession, created_at)
       VALUES ($1, $2, $3, $4, $3, NOW())`,
      [userid, date, timeused || 0, login ? 1 : 0]
    );
  } else {
    await db.query(
      `UPDATE holmz_schema.user_activity_log
       SET timeusedperday = timeusedperday + $1,
           timeusedpersession = $1,
           loginsperday = loginsperday + $2,
           created_at = NOW()
       WHERE userid = $3 AND date = $4`,
      [timeused || 0, login ? 1 : 0, userid, date]
    );
  }

  return NextResponse.json({ success: true });
}
