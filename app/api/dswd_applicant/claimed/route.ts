import { NextRequest, NextResponse } from "next/server";
import { createPool } from "mysql2/promise";

const pool = createPool({
  host: process.env.DB_HOST!,
  user: process.env.DB_USER!,
  password: process.env.DB_PASSWORD!,
  database: process.env.DB_NAME!,
  connectionLimit: 20, // okay for sequential 200-row batches
});

// Optional: simple GET to list recent rows (handy after upload)
export async function GET() {
  try {
    const [rows] = await pool.query("SELECT * FROM dswd_encoded WHERE application_status = 'claimed' ORDER BY id DESC");
    return NextResponse.json(rows);
  } catch (err: any) {
    console.error("GET /dswd_applicant error:", err?.message || err);
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
  }
}

type RawRow = {
  entered_date?: any;
  entered_by?: any;
  beneficiary_no?: any;
  date_accomplished?: any;
  region?: any;
  province?: any;
  city?: any;
  barangay?: any;
  district?: any;
  lastname?: any;
  firstname?: any;
  middlename?: any;
  extraname?: any;
  sex?: any;
  civil_status?: any;
  dob?: any;
  age?: any;
  mode_of_admission?: any;
  type_of_assistance1?: any;
  amount1?: any;
  beneficiary_category?: any;
  sub_category?: any;
  relationship?: any;
  lastname2?: any;
  firstname2?: any;
  middlename2?: any;
  extension?: any;
  sex2?: any;
  status2?: any;
  dob2?: any;
  age2?: any;
  contact2?: any;
  mode_of_assistance?: any;
  interviewer?: any;
  license_number?: any;
};

// Helpers: keep inserts predictable/safe
const toDateOrNull = (v: any): string | null => {
  // Accept ISO "YYYY-MM-DD" or null; anything else → null
  if (v == null || v === "") return null;
  if (typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v)) return v;
  return null;
};

const toInt = (v: any): number => {
  const n = Number(v);
  return Number.isFinite(n) ? Math.trunc(n) : 0;
};

const toStr = (v: any): string => (v == null ? "" : String(v).trim());

const mapToValues = (row: RawRow): any[] => [
  toDateOrNull(row.entered_date),      // 1
  toStr(row.entered_by),               // 2
  toStr(row.beneficiary_no),           // 3
  toDateOrNull(row.date_accomplished), // 4
  toStr(row.region),                   // 5
  toStr(row.province),                 // 6
  toStr(row.city),                     // 7
  toStr(row.barangay),                 // 8
  toStr(row.district),                 // 9
  toStr(row.lastname),                 // 10
  toStr(row.firstname),                // 11
  toStr(row.middlename),               // 12
  toStr(row.extraname),                // 13
  toStr(row.sex),                      // 14
  toStr(row.civil_status),             // 15
  toDateOrNull(row.dob),               // 16
  toInt(row.age),                      // 17
  toStr(row.mode_of_admission),        // 18
  toStr(row.type_of_assistance1),      // 19
  toStr(row.amount1),                  // 20 (assumed VARCHAR in DB)
  toStr(row.beneficiary_category),     // 21
  toStr(row.sub_category),             // 22
  toStr(row.relationship),             // 23
  toStr(row.lastname2),                // 24
  toStr(row.firstname2),               // 25
  toStr(row.middlename2),              // 26
  toStr(row.extension),                // 27
  toStr(row.sex2),                     // 28
  toStr(row.status2),                  // 29
  toDateOrNull(row.dob2),              // 30
  toInt(row.age2),                     // 31
  toStr(row.contact2),                 // 32
  toStr(row.mode_of_assistance),       // 33
  toStr(row.interviewer),              // 34
  toStr(row.license_number),           // 35
];

export async function POST(req: NextRequest) {
  // NOTE: This route expects a single batch per request (your frontend sends 200 rows per POST).
  try {
    const formData = await req.formData();
    const jsonString = formData.get("json");
    if (!jsonString || typeof jsonString !== "string") {
      return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
    }

    let applicants: RawRow[];
    try {
      applicants = JSON.parse(jsonString);
    } catch {
      return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
    }

    if (!Array.isArray(applicants)) {
      return NextResponse.json({ error: "Payload must be an array" }, { status: 400 });
    }

    // Remove fully-empty rows (all fields null/empty string)
    const nonEmpty = applicants.filter((row) =>
      Object.values(row || {}).some((v) => v !== null && v !== "")
    );
    if (nonEmpty.length === 0) {
      return NextResponse.json({ error: "No valid rows to insert" }, { status: 400 });
    }

    // Map to the exact column order (35 columns)
    const values = nonEmpty.map(mapToValues);

    // Sanity check: all rows must have 35 values
    const badRowIndex = values.findIndex((arr) => arr.length !== 35);
    if (badRowIndex !== -1) {
      return NextResponse.json(
        { error: `Internal mapping error: row ${badRowIndex} has ${values[badRowIndex].length} columns` },
        { status: 500 }
      );
    }

    const sql = `
      INSERT INTO dswd_encoded (
        entered_date, entered_by, beneficiary_no, date_accomplished, region,
        province, city, barangay, district,
        lastname, firstname, middlename, extraname, sex, civil_status, dob, age, mode_of_admission,
        type_of_assistance1, amount1, beneficiary_category, sub_category, relationship,
        lastname2, firstname2, middlename2, extension, sex2, status2, dob2, age2, contact2,
        mode_of_assistance, interviewer, license_number
      ) VALUES ?
    `;

    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      // VALUES ? expects an array of rows: [ [..35..], [..35..], ... ]
      await conn.query(sql, [values]);
      await conn.commit();
    } catch (err: any) {
      await conn.rollback();
      // Surface the exact SQL error (e.g., "Data too long", "Incorrect date value", etc.)
      console.error("SQL Insert Error:", err?.message || err);
      return NextResponse.json(
        { error: err?.message || "Database error during insert" },
        { status: 500 }
      );
    } finally {
      conn.release();
    }

    return NextResponse.json({ message: "Upload successful", inserted: values.length });
  } catch (err: any) {
    console.error("Upload error:", err?.message || err);
    return NextResponse.json({ error: err?.message || "Unexpected server error" }, { status: 500 });
  }
}