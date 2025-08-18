// File: app/api/tupad_applicants/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import mysql, { RowDataPacket } from "mysql2/promise"; // <-- Import RowDataPacket

// MySQL connection config
const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: parseInt(process.env.DB_PORT || "3306"),
};

/**
 * GET: Fetch a single applicant by ID.
 *
 * This function retrieves a specific applicant record using the ID from the URL parameters.
 *
 * @param request The incoming Next.js request.
 * @param params An object containing the dynamic route parameters, including the applicant's ID.
 * @returns A JSON response containing the applicant's data or an error message.
 */
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const connection = await mysql.createConnection(dbConfig);
    // Explicitly cast the result to an array of RowDataPacket to resolve the TypeScript error
    const [rows] = await connection.execute<RowDataPacket[]>("SELECT * FROM tupad_applicants WHERE id = ?", [params.id]);
    await connection.end();
    return NextResponse.json(rows[0] || null);
  } catch (error) {
    console.error("GET (by ID) Error:", error);
    return NextResponse.json({ error: "Failed to fetch applicant" }, { status: 500 });
  }
}

/**
 * PUT: Update an existing applicant by ID.
 *
 * This function is responsible for updating an applicant's data based on their ID.
 * It reads the new data from the request body and updates the database record.
 *
 * @param request The incoming Next.js request.
 * @param params An object containing the dynamic route parameters, including the applicant's ID.
 * @returns A JSON response indicating success and the number of affected rows.
 */
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const data = await request.json();
    const connection = await mysql.createConnection(dbConfig);

    const [result] = await connection.execute(
      `UPDATE tupad_applicants SET 
        firstname = ?, middlename = ?, lastname = ?, extension = ?, birthday = ?, age = ?, sex = ?, 
        civil_status = ?, barangay = ?, city_municipality = ?, province = ?, district = ?, 
        type_of_id = ?, id_number = ?, contact_number = ?, bank_account_no = ?, 
        type_of_beneficiary = ?, occupation = ?, monthly_income = ?, dependent_name = ?
      WHERE id = ?`,
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
        id,
      ]
    );
    await connection.end();
    return NextResponse.json({ success: true, affectedRows: (result as any).affectedRows });
  } catch (error) {
    console.error("PUT Error:", error);
    return NextResponse.json({ error: "Failed to update applicant" }, { status: 500 });
  }
}

/**
 * DELETE: Delete an applicant by ID.
 *
 * This function removes an applicant record from the database using their ID.
 *
 * @param request The incoming Next.js request.
 * @param params An object containing the dynamic route parameters, including the applicant's ID.
 * @returns A JSON response indicating success and the number of affected rows.
 */
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const connection = await mysql.createConnection(dbConfig);

    const [result] = await connection.execute(
      "DELETE FROM tupad_applicants WHERE id = ?",
      [id]
    );
    await connection.end();
    return NextResponse.json({ success: true, affectedRows: (result as any).affectedRows });
  } catch (error) {
    console.error("DELETE Error:", error);
    return NextResponse.json({ error: "Failed to delete applicant" }, { status: 500 });
  }
}
