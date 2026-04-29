import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
  try {
    const [fests, events, regs] = await Promise.all([
      pool.query("SELECT COUNT(*) FROM main_events"),
      pool.query("SELECT COUNT(*) FROM sub_events"),
      pool.query("SELECT COUNT(*) FROM registrations"),
    ]);
    return NextResponse.json({
      fests:  parseInt(fests.rows[0].count),
      events: parseInt(events.rows[0].count),
      regs:   parseInt(regs.rows[0].count),
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
