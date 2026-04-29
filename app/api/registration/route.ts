import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: NextRequest) {
  const { userId, subEventId, festId, isGroup, teamSize, members } = await req.json();
  const code = uuidv4().replace(/-/g, "").slice(0, 8);

  try {
    if (!isGroup) {
      await pool.query(
        `INSERT INTO registrations (participant_id, sub_event_id, main_event_id, registration_code)
         VALUES ($1,$2,$3,$4)`,
        [userId, subEventId, festId, code]
      );
    } else {
      const { rows } = await pool.query(
        `INSERT INTO registrations (participant_id, sub_event_id, main_event_id, registration_code, team_size)
         VALUES ($1,$2,$3,$4,$5) RETURNING registration_id`,
        [userId, subEventId, festId, code, teamSize]
      );
      const regId = rows[0].registration_id;
      for (const m of members) {
        await pool.query(
          "INSERT INTO team_members (registration_id, name) VALUES ($1,$2)",
          [regId, `${m.name} (${m.roll}) <${m.email}>`]
        );
      }
    }
    return NextResponse.json({ success: true, code });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  try {
    const { rows } = await pool.query(
      `SELECT r.registration_id, r.registration_code, r.registration_date,
              s.name, s.category, s.type, s.venue, s.day, s.time,
              m.name as fest_name, r.team_size
       FROM registrations r
       JOIN sub_events s  ON r.sub_event_id=s.sub_event_id
       JOIN main_events m ON r.main_event_id=m.main_event_id
       WHERE r.participant_id=$1 ORDER BY r.registration_date DESC`,
      [userId]
    );
    return NextResponse.json({ registrations: rows });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
