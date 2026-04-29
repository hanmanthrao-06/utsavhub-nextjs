import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const participantId = searchParams.get("id");
  try {
    const { rows: profile } = await pool.query(
      `SELECT p.*, sc.school_name as school_display
       FROM participants p
       LEFT JOIN schools sc ON p.school_id = sc.school_id
       WHERE p.participant_id = $1`,
      [participantId]
    );
    const { rows: registrations } = await pool.query(
      `SELECT r.registration_id, r.registration_code, r.registration_date,
              s.name as event, s.category, s.type, s.venue, s.day, s.time,
              m.name as fest, r.team_size
       FROM registrations r
       JOIN sub_events s ON r.sub_event_id = s.sub_event_id
       JOIN main_events m ON r.main_event_id = m.main_event_id
       WHERE r.participant_id = $1
       ORDER BY r.registration_date DESC`,
      [participantId]
    );
    return NextResponse.json({ profile: profile[0], registrations });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const { participantId, subEventId } = await req.json();
  try {
    await pool.query(
      "DELETE FROM registrations WHERE participant_id=$1 AND sub_event_id=$2",
      [participantId, subEventId]
    );
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
