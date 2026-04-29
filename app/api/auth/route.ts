import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function POST(req: NextRequest) {
  const { loginInput, isInternal } = await req.json();
  try {
    const query = isInternal
      ? "SELECT participant_id, name FROM participants WHERE roll_number=$1"
      : "SELECT participant_id, name FROM participants WHERE LOWER(email)=$1";
    const val = isInternal ? loginInput : loginInput.toLowerCase();
    const { rows } = await pool.query(query, [val]);
    if (rows.length > 0) return NextResponse.json({ user: rows[0] });
    return NextResponse.json({ user: null });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
