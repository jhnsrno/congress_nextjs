// File: app/api/doh_applicants/[id]/route.ts
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
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const connection = await mysql.createConnection(dbConfig);
    // Explicitly cast the result to an array of RowDataPacket to resolve the TypeScript error
    const [rows] = await connection.execute<RowDataPacket[]>(
      "SELECT * FROM doh_applicants WHERE id = ?",
      [params.id]
    );
    await connection.end();
    return NextResponse.json(rows[0] || null);
  } catch (error) {
    console.error("GET (by ID) Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch applicant" },
      { status: 500 }
    );
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
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const data = await request.json();
    const connection = await mysql.createConnection(dbConfig);

    const [result] = await connection.execute(
      `UPDATE doh_applicants SET 
        date = ?, patient_lastname = ?, patient_firstname = ?, patient_middlename = ?, 
        patient_extension = ?, birthday = ?, age = ?, address = ?, city = ?, province = ?, 
        diagnosis = ?, assistance_type = ?, recommended_amount = ?, applicant_lastname = ?, 
        applicant_firstname = ?, applicant_middlename = ?, applicant_extension = ?, relationship = ?, 
        contact_number = ?
      WHERE id = ?`,
      [
        data.date,
        data.hospital,
        data.patient_lastname,
        data.patient_firstname,
        data.patient_middlename,
        data.patient_extension,
        data.birthday,
        data.age,
        data.address,
        data.city,
        data.province,
        data.diagnosis,
        data.assistance_type,
        data.recommended_amount,
        data.applicant_lastname,
        data.applicant_firstname,
        data.applicant_middlename,
        data.applicant_extension,
        data.relationship,
        data.contact_number,
        id,
      ]
    );
    await connection.end();
    return NextResponse.json({
      success: true,
      affectedRows: (result as any).affectedRows,
    });
  } catch (error) {
    console.error("PUT Error:", error);
    return NextResponse.json(
      { error: "Failed to update applicant" },
      { status: 500 }
    );
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
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const connection = await mysql.createConnection(dbConfig);

    const [result] = await connection.execute(
      "DELETE FROM doh_applicants WHERE id = ?",
      [id]
    );
    await connection.end();
    return NextResponse.json({
      success: true,
      affectedRows: (result as any).affectedRows,
    });
  } catch (error) {
    console.error("DELETE Error:", error);
    return NextResponse.json(
      { error: "Failed to delete applicant" },
      { status: 500 }
    );
  }
}
