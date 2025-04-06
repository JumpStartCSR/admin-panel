// app/api/organizations/route.ts
import db from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const result = await db.query(`
      SELECT 
        organizationid AS key,
        name,
        TO_CHAR(contract_start_date, 'DD Mon, YYYY') AS "startDate",
        TO_CHAR(contract_end_date, 'DD Mon, YYYY') AS "endDate"
      FROM "organization"
      ORDER BY organizationid ASC;
    `);
    return NextResponse.json(result.rows);
  } catch (err) {
    console.error("GET /api/organizations error:", err);
    return new NextResponse("Error fetching organizations", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { name, startDate, endDate } = await req.json();

    await db.query(
      `
      INSERT INTO "organization" (name, contract_start_date, contract_end_date)
      VALUES ($1, $2, $3);
      `,
      [name, startDate, endDate || null]
    );

    return new NextResponse(null, { status: 201 });
  } catch (err) {
    console.error("POST /api/organizations error:", err);
    return new NextResponse("Error creating organization", { status: 500 });
  }
}
