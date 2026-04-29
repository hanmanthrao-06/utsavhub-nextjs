import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

// Add a new sub-event
export async function POST(req: NextRequest) {
  const { name, category, type, venue, day, time, festId } = await req.json();
  try {
    const { rows } = await pool.query(
      `INSERT INTO sub_events (name, category, type, venue, day, time, main_event_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING sub_event_id, name`,
      [name, category, type, venue, day, time, festId]
    );
    return NextResponse.json({ success: true, event: rows[0] });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

// Delete a sub-event
export async function DELETE(req: NextRequest) {
  const { subEventId } = await req.json();
  try {
    // Delete registrations first
    await pool.query("DELETE FROM registrations WHERE sub_event_id=$1", [subEventId]);
    await pool.query("DELETE FROM sub_events WHERE sub_event_id=$1", [subEventId]);
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
