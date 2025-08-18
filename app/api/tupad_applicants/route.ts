// File: app/api/tupad_applicants/route.ts
import { NextRequest, NextResponse } from "next/server";
import mysql from "mysql2/promise";

// MySQL connection config
const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: parseInt(process.env.DB_PORT || "3306"),
};

/**
 * GET: Fetch all Tupad applicants.
 *
 * This function retrieves all records from the 'tupad_applicants' table.
 * It's responsible for handling requests to the base API endpoint.
 *
 * @returns A JSON response containing all applicants or an error message.
 */
export async function GET() {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute("SELECT * FROM tupad_applicants ORDER BY id DESC");
    await connection.end();
    return NextResponse.json(rows);
  } catch (error) {
    console.error("GET (all) Error:", error);
    return NextResponse.json({ error: "Failed to fetch applicants" }, { status: 500 });
  }
}

/**
 * POST: Add a new Tupad applicant.
 *
 * This function handles the creation of a new applicant record in the database.
 * It takes the applicant's data from the request body and inserts it into the table.
 *
 * @param request The incoming Next.js request.
 * @returns A JSON response indicating success or an error message.
 */
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const connection = await mysql.createConnection(dbConfig);

    const [result] = await connection.execute(
      `INSERT INTO tupad_applicants (
        firstname, middlename, lastname, extension, birthday, age, sex, civil_status, barangay,
        city_municipality, province, district, type_of_id, id_number, contact_number, bank_account_no,
        type_of_beneficiary, occupation, monthly_income, dependent_name
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.firstname,
        data.middlename,
        data.lastname,
        data.extension,
        data.birthday,
        data.age,
        data.sex,
        data.civil_status,
        data.barangay,
        data.city_municipality,
        data.province,
        data.district,
        data.type_of_id,
        data.id_number,
        data.contact_number,
        data.bank_account_no,
        data.type_of_beneficiary,
        data.occupation,
        data.monthly_income,
        data.dependent_name,
      ]
    );
    await connection.end();
    return NextResponse.json({ success: true, insertId: (result as any).insertId });
  } catch (error) {
    console.error("POST Error:", error);
    return NextResponse.json({ error: "Failed to add applicant" }, { status: 500 });
  }
}
