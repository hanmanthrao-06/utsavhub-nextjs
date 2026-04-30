import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
  try {
    const [analytics, regs, metrics] = await Promise.all([
      pool.query(`
        SELECT sc.school_name, p.department, p.participant_type, s.name as sub_event, m.name as fest
        FROM sub_events s
        JOIN main_events m ON s.main_event_id=m.main_event_id
        LEFT JOIN registrations r ON s.sub_event_id=r.sub_event_id
        LEFT JOIN participants p ON r.participant_id=p.participant_id
        LEFT JOIN schools sc ON p.school_id=sc.school_id
        WHERE p.participant_id IS NOT NULL
      `),
      pool.query(`
        SELECT r.registration_code, r.registration_date, p.name, p.roll_number,
               p.email, p.participant_type, s.name as event, m.name as fest,
               sc.school_name
        FROM registrations r
        JOIN participants p ON r.participant_id=p.participant_id
        JOIN sub_events s ON r.sub_event_id=s.sub_event_id
        JOIN main_events m ON r.main_event_id=m.main_event_id
        LEFT JOIN schools sc ON p.school_id=sc.school_id
        ORDER BY r.registration_date DESC LIMIT 500
      `),
      pool.query(`
        SELECT
          (SELECT COUNT(*) FROM registrations) as regs,
          (SELECT COUNT(*) FROM participants) as parts,
          (SELECT COUNT(*) FROM main_events) as fests,
          (SELECT COUNT(*) FROM sub_events) as events
      `),
    ]);
    return NextResponse.json({
      analytics: analytics.rows,
      registrations: regs.rows,
      metrics: metrics.rows[0],
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
