import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function POST(req: Request) {
  const { pb_user_id } = await req.json();

  try {
    const result = await db.query(
      `SELECT userid FROM "user" WHERE pb_user_id = $1 LIMIT 1`,
      [pb_user_id]
    );

    const exists = result.rows.length > 0;
    return NextResponse.json({ exists });
  } catch (error) {
    console.error("Error checking user existence:", error);
    return NextResponse.json({ exists: false }, { status: 500 });
  }
}
