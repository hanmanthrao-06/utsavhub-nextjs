import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

// Ensure table exists
async function ensureTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS announcements (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      fest_name TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      is_active BOOLEAN DEFAULT TRUE
    )
  `);
}

export async function GET() {
  try {
    await ensureTable();
    const { rows } = await pool.query(
      "SELECT * FROM announcements WHERE is_active=TRUE ORDER BY created_at DESC"
    );
    return NextResponse.json({ announcements: rows });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const { title, message, festName } = await req.json();
  try {
    await ensureTable();
    const { rows } = await pool.query(
      "INSERT INTO announcements (title, message, fest_name) VALUES ($1,$2,$3) RETURNING *",
      [title, message, festName || null]
    );
    return NextResponse.json({ success: true, announcement: rows[0] });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json();
  try {
    await pool.query("UPDATE announcements SET is_active=FALSE WHERE id=$1", [id]);
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
