import db from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  context: { params: { userId: string } }
) {
  const { userId } = await context.params;

  try {
    const result = await db.query(
      `
      SELECT o.organizationid, o.name
      FROM "user" u
      JOIN "organization" o ON u.organizationid = o.organizationid
      WHERE u.pb_user_id = $1
      `,
      [userId]
    );

    if (result.rows.length === 0) {
      return new NextResponse("Organization not found", { status: 404 });
    }

    return NextResponse.json({
      id: result.rows[0].organizationid,
      name: result.rows[0].name,
    });
  } catch (err) {
    console.error("Error fetching organization info:", err);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
