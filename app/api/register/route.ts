import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: NextRequest) {
  const { name, rollNumber, email, school, isInternal } = await req.json();
  try {
    const { rows } = await pool.query(
      `INSERT INTO participants (name, roll_number, email, participant_type, role, school_id)
       VALUES ($1,$2,$3,$4,$5,(SELECT school_id FROM schools WHERE school_name ILIKE $6 LIMIT 1))
       RETURNING participant_id, name`,
      [name, rollNumber || null, email, isInternal ? "internal" : "external", "student", school]
    );
    return NextResponse.json({ user: rows[0] });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
