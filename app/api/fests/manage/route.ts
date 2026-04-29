import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function POST(req: NextRequest) {
  const { name } = await req.json();
  try {
    const { rows } = await pool.query(
      "INSERT INTO main_events (name) VALUES ($1) RETURNING main_event_id, name",
      [name]
    );
    return NextResponse.json({ success: true, fest: rows[0] });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const { festId } = await req.json();
  try {
    // Delete registrations for events in this fest
    await pool.query(
      "DELETE FROM registrations WHERE sub_event_id IN (SELECT sub_event_id FROM sub_events WHERE main_event_id=$1)",
      [festId]
    );
    // Delete events
    await pool.query("DELETE FROM sub_events WHERE main_event_id=$1", [festId]);
    // Delete fest
    await pool.query("DELETE FROM main_events WHERE main_event_id=$1", [festId]);
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
