//app/api/tupad_applicants/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createPool } from "mysql2/promise";

// MySQL pool config
const pool = createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  connectionLimit: 20,
});

// --- Helpers ---
type RawRow = {
  date: any;
  hospital: any;
  patient_lastname: any;
  patient_firstname: any;
  patient_middlename: any;
  patient_extension: any;
  birthday: any;
  age: any;
  address: any;
  city: any;
  province: any;
  diagnosis: any;
  assistance_type: any;
  recommended_amount: any;
  applicant_lastname: any;
  applicant_firstname: any;
  applicant_middlename: any;
  applicant_extension: any;
  relationship: any;
  contact_number: any;
};

const toDateOrNull = (v: any): string | null => {
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
  toDateOrNull(row.date),
  toStr(row.hospital),
  toStr(row.patient_lastname),
  toStr(row.patient_firstname),
  toStr(row.patient_middlename),
  toStr(row.patient_extension),
  toDateOrNull(row.birthday),
  toInt(row.age),
  toStr(row.address),
  toStr(row.city),
  toStr(row.province),
  toStr(row.diagnosis),
  toStr(row.assistance_type),
  toStr(row.recommended_amount),
  toStr(row.applicant_lastname),
  toStr(row.applicant_firstname),
  toStr(row.applicant_middlename),
  toStr(row.applicant_extension),
  toStr(row.relationship),
  toStr(row.contact_number),
];

// --- GET: fetch all applicants ---
export async function GET() {
  try {
    const [rows] = await pool.query("SELECT * FROM doh_applicants ORDER BY id DESC");
    return NextResponse.json(rows);
  } catch (error) {
    console.error("GET Error:", error);
    return NextResponse.json({ error: "Failed to fetch applicants" }, { status: 500 });
  }
}

// --- POST: handles both manual insert and bulk Excel upload ---
export async function POST(req: NextRequest) {
  try {
    // Detect bulk upload (FormData with `json` key)
    if (req.headers.get("content-type")?.includes("multipart/form-data")) {
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

      // Remove fully-empty rows
      const nonEmpty = applicants.filter((row) =>
        Object.values(row || {}).some((v) => v !== null && v !== "")
      );

      if (nonEmpty.length === 0) {
        return NextResponse.json({ error: "No valid rows to insert" }, { status: 400 });
      }

      // Map values
      const values = nonEmpty.map(mapToValues);

      const sql = `INSERT INTO doh_applicants (
        date, hospital, patient_lastname, patient_firstname, patient_middlename, patient_extension,
        birthday, age, address, city, province, diagnosis, assistance_type, recommended_amount,
        applicant_lastname, applicant_firstname, applicant_middlename, applicant_extension,
        relationship, contact_number
      ) VALUES ?`;

      const conn = await pool.getConnection();
      try {
        await conn.beginTransaction();
        await conn.query(sql, [values]);
        await conn.commit();
      } catch (err: any) {
        await conn.rollback();
        console.error("Bulk SQL Insert Error:", err?.message || err);
        return NextResponse.json({ error: err?.message || "Database error during insert" }, { status: 500 });
      } finally {
        conn.release();
      }

      return NextResponse.json({ message: "Bulk upload successful", inserted: values.length });
    }

    // --- Manual single insert ---
    const data = await req.json();
    const sql = `INSERT INTO doh_applicants (
      date, hospital, patient_lastname, patient_firstname, patient_middlename, patient_extension,
      birthday, age, address, city, province, diagnosis, assistance_type, recommended_amount,
      applicant_lastname, applicant_firstname, applicant_middlename, applicant_extension,
      relationship, contact_number
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    const [result] = await pool.execute(sql, mapToValues(data));
    return NextResponse.json({ success: true, insertId: (result as any).insertId });
  } catch (err: any) {
    console.error("POST Error:", err?.message || err);
    return NextResponse.json({ error: err?.message || "Unexpected server error" }, { status: 500 });
  }
}
