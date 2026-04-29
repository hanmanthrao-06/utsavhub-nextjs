import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const festId = searchParams.get("festId");
  const userId = searchParams.get("userId");

  try {
    const { rows: events } = await pool.query(
      `SELECT sub_event_id, name, category, type, venue, day, time
       FROM sub_events WHERE main_event_id=$1 ORDER BY name`,
      [festId]
    );

    let registered: number[] = [];
    if (userId) {
      const { rows } = await pool.query(
        "SELECT sub_event_id FROM registrations WHERE participant_id=$1",
        [userId]
      );
      registered = rows.map((r) => r.sub_event_id);
    }

    return NextResponse.json({ events, registered });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
