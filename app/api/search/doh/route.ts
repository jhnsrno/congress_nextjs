import { NextRequest, NextResponse } from "next/server";
import { getDbConnection } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const lastname = searchParams.get("lastname") || "";
    const firstname = searchParams.get("firstname") || "";
    const middlename = searchParams.get("middlename") || "";
    const extension = searchParams.get("extension") || "";
    const birthday = searchParams.get("birthday") || "";

    const conn = await getDbConnection();

    const [rows] = await conn.execute(
      `SELECT *
       FROM doh_applicants
       WHERE (? = '' OR patient_lastname LIKE ?)
         AND (? = '' OR patient_firstname LIKE ?)
         AND (? = '' OR patient_middlename LIKE ?)
         AND (? = '' OR patient_extension LIKE ?)
         AND (? = '' OR birthday = ?)`,
      [
        lastname, `%${lastname}%`,
        firstname, `%${firstname}%`,
        middlename, `%${middlename}%`,
        extension, `%${extension}%`,
        birthday, birthday
      ]
    );

    await conn.end();

    return NextResponse.json(rows);
  } catch (error: any) {
    console.error("DOH search error:", error);
    return NextResponse.json({ error: "Failed to search DOH applicants" }, { status: 500 });
  }
}
