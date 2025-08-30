import { NextRequest, NextResponse } from "next/server";
import { getDbConnection } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const lastname = searchParams.get("lastname") || "";
    const firstname = searchParams.get("firstname") || "";
    const middlename = searchParams.get("middlename") || "";
    const extension = searchParams.get("extension") || "";

    const conn = await getDbConnection();

    const [rows] = await conn.execute(
      `SELECT *
       FROM voters_list
       WHERE (? = '' OR voters_lastname LIKE ?)
         AND (? = '' OR voters_firstname LIKE ?)
         AND (? = '' OR voters_middlename LIKE ?)
         AND (? = '' OR voters_extension LIKE ?)`,
      [
        lastname, `%${lastname}%`,
        firstname, `%${firstname}%`,
        middlename, `%${middlename}%`,
        extension, `%${extension}%`
      ]
    );

    await conn.end();

    return NextResponse.json(rows);
  } catch (error: any) {
    console.error("TUPAD search error:", error);
    return NextResponse.json({ error: "Failed to search Tupad applicants" }, { status: 500 });
  }
}
