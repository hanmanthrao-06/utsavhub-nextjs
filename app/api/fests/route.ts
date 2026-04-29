import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
  try {
    const { rows: fests } = await pool.query(
      "SELECT main_event_id, name FROM main_events ORDER BY main_event_id"
    );
    const { rows: counts } = await pool.query(
      `SELECT m.main_event_id, COUNT(s.sub_event_id) as count
       FROM main_events m LEFT JOIN sub_events s ON m.main_event_id=s.main_event_id
       GROUP BY m.main_event_id`
    );
    const countMap: Record<number, number> = {};
    counts.forEach((r) => { countMap[r.main_event_id] = parseInt(r.count); });
    return NextResponse.json({ fests, countMap });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
