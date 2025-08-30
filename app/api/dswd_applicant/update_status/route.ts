// app/api/dswd_applicant/update_status/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createPool } from "mysql2/promise";

const pool = createPool({
  host: process.env.DB_HOST!,
  user: process.env.DB_USER!,
  password: process.env.DB_PASSWORD!,
  database: process.env.DB_NAME!,
});

export async function POST(req: NextRequest) {
  try {
    const { rows, status } = await req.json(); // <- expect {rows: [], status: "PULL-OUT"}

    if (!rows || !status) {
      return NextResponse.json(
        { error: "Rows or status missing" },
        { status: 400 }
      );
    }

    const conn = await pool.getConnection();
    try {
      for (const row of rows) {
        await conn.query(
          `UPDATE dswd_encoded 
           SET application_status = ?
           WHERE date_accomplished = ? 
             AND lastname = ? 
             AND firstname = ? 
             AND middlename = ? 
             AND extraname = ?
             AND dob = ?`,
          [
            status,
            row.date_accomplished,
            row.lastname,
            row.firstname,
            row.middlename,
            row.extraname,
            row.dob,
          ]
        );
      }
    } finally {
      conn.release();
    }

    return NextResponse.json({
      message: `Successfully updated ${rows.length} rows to ${status}`,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
