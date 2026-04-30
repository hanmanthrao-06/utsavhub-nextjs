import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function POST() {
  try {
    // Insert admin user into participants table
    const query = `
      INSERT INTO participants (name, email, roll_number, participant_type, school_id, department)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (email) DO NOTHING
      RETURNING participant_id, name, email;
    `;

    const values = [
      'Admin User',
      'hanmanthraobd@gmail.com',
      'ADMIN001',
      'admin',
      1,
      'Administration'
    ];

    const result = await pool.query(query, values);

    if (result.rows.length > 0) {
      return NextResponse.json({
        success: true,
        message: 'Admin user added successfully',
        user: result.rows[0]
      });
    } else {
      return NextResponse.json({
        success: false,
        message: 'Admin user already exists'
      });
    }

  } catch (error) {
    console.error('Error adding admin user:', error);
    return NextResponse.json({
      success: false,
      error: String(error)
    }, { status: 500 });
  }
}