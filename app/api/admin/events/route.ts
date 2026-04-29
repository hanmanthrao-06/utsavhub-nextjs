import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
  try {
    const { rows } = await pool.query(`
      SELECT s.sub_event_id, s.name, s.category, s.type, s.venue, s.day, s.time, m.name as fest_name
      FROM sub_events s
      JOIN main_events m ON s.main_event_id = m.main_event_id
      ORDER BY m.name, s.name
    `);
    return NextResponse.json({ events: rows });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
