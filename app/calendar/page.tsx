"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import listPlugin from "@fullcalendar/list";

const FEST_BASE_DATES: Record<string, string> = {
  "Samyuti":           "2026-03-28",
  "OJAS":              "2026-04-20",
  "Sports":            "2026-02-15",
  "Workshops":         "2026-05-01",
  "Srujana Tech Fest": "2025-09-13",
  "Innovation Summit": "2026-08-10",
  "Cultural Carnival": "2026-11-05",
};
const FEST_COLORS = ["#b388c8","#c0546a","#b07d2a","#6a7a2a","#3a7a5a","#4a8fa0"];

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

function dayOffset(dayStr: string): number {
  const m = (dayStr || "").match(/\d+/);
  return m ? parseInt(m[0]) - 1 : 0;
}

export default function CalendarPage() {
  const router = useRouter();
  const [user, setUser] = useState<{participant_id:number;name:string}|null>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [fests, setFests] = useState<{main_event_id:number;name:string}[]>([]);
  const [registered, setRegistered] = useState<number[]>([]);
  const [selected, setSelected] = useState<any>(null);

  useEffect(() => {
    const u = sessionStorage.getItem("user");
    if (!u) { router.push("/"); return; }
    const parsed = JSON.parse(u);
    setUser(parsed);

    Promise.all([
      fetch("/api/fests").then(r => r.json()),
      fetch(`/api/registration?userId=${parsed.participant_id}`).then(r => r.json()),
    ]).then(([festData, regData]) => {
      const festList = festData.fests || [];
      setFests(festList);
      const regIds = (regData.registrations || []).map((r:any) => r.sub_event_id);
      setRegistered(regIds);

      // Load all events for all fests
      Promise.all(
        festList.map((f:any) =>
          fetch(`/api/events?festId=${f.main_event_id}`).then(r => r.json()).then(d => ({ fest: f, events: d.events || [] }))
        )
      ).then(results => {
        const calEvents: any[] = [];
        results.forEach(({ fest, events: evs }, fi) => {
          const baseDate = FEST_BASE_DATES[fest.name] || "2026-03-01";
          const color = FEST_COLORS[fi % FEST_COLORS.length];
          evs.forEach((e: any) => {
            const offset = dayOffset(e.day);
            const date = addDays(baseDate, offset);
            const isReg = regIds.includes(e.sub_event_id);
            calEvents.push({
              id: String(e.sub_event_id),
              title: e.name,
              start: date,
              backgroundColor: isReg ? color : color + "44",
              borderColor: isReg ? "#1a1a2e" : color,
              textColor: isReg ? "#fff" : "#1a1a2e",
              extendedProps: { fest: fest.name, category: e.category, venue: e.venue, time: e.time, registered: isReg },
            });
          });
        });
        setEvents(calEvents);
      });
    });
  }, [router]);

  if (!user) return null;

  return (
    <div className="min-h-screen" style={{ background:"linear-gradient(160deg,#faf8ff 0%,#f5f0fa 30%,#eef6f8 60%,#f0f8f4 100%)" }}>
      <Navbar userName={user.name} />
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="text-center mb-8 animate-fade-in-down">
          <h1 className="font-playfair text-4xl font-bold text-[#1a1a2e] mb-2">Event Calendar</h1>
          <p className="text-[#aaa] text-sm">All fests and competitions at a glance</p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 mb-6 items-center">
          <span className="text-xs text-[#aaa] font-semibold uppercase tracking-widest">Fests:</span>
          {fests.map((f, i) => (
            <div key={f.main_event_id} className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full" style={{ background: FEST_COLORS[i % FEST_COLORS.length] }} />
              <span className="text-xs text-[#555] font-medium">{f.name}</span>
            </div>
          ))}
          <div className="flex items-center gap-1.5 ml-4">
            <div className="w-3 h-3 rounded-full bg-[#1a1a2e]" />
            <span className="text-xs text-[#555] font-medium">Registered</span>
          </div>
        </div>

        {/* Calendar */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#f0eef8]">
          <style>{`
            .fc { font-family: 'Inter', sans-serif; }
            .fc-toolbar-title { font-family: 'Playfair Display', serif; font-size: 1.3rem; font-weight: 700; color: #1a1a2e; }
            .fc-button { background: #1a1a2e !important; border-color: #1a1a2e !important; border-radius: 8px !important; font-size: 0.78rem !important; }
            .fc-button:hover { background: #2d2d4e !important; }
            .fc-button-active { background: #9b6aaa !important; border-color: #9b6aaa !important; }
            .fc-daygrid-day:hover { background: #faf8ff !important; }
            .fc-col-header-cell { background: #f8f7ff; color: #555; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; }
            .fc-event { border-radius: 6px; font-size: 0.72rem; padding: 1px 5px; font-weight: 600; cursor: pointer; }
            .fc-day-today { background: #faf0ff !important; }
          `}</style>
          <FullCalendar
            plugins={[dayGridPlugin, listPlugin]}
            initialView="dayGridMonth"
            initialDate="2026-03-01"
            headerToolbar={{ left:"prev,next today", center:"title", right:"dayGridMonth,listMonth" }}
            events={events}
            height={620}
            dayMaxEvents={3}
            eventClick={(info) => setSelected(info.event)}
          />
        </div>

        {/* Event detail popup */}
        {selected && (
          <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4" onClick={() => setSelected(null)}>
            <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl animate-fade-in-up" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-start mb-4">
                <h2 className="font-playfair text-xl font-bold text-[#1a1a2e]">{selected.title}</h2>
                <button onClick={() => setSelected(null)} className="text-[#aaa] hover:text-[#555] text-xl">×</button>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                {[
                  { label:"Fest",     val: selected.extendedProps.fest },
                  { label:"Category", val: selected.extendedProps.category },
                  { label:"Venue",    val: selected.extendedProps.venue },
                  { label:"Time",     val: selected.extendedProps.time },
                ].map(item => (
                  <div key={item.label}>
                    <div className="text-[10px] text-[#aaa] uppercase tracking-widest mb-0.5">{item.label}</div>
                    <div className="font-medium text-[#1a1a2e]">{item.val || "—"}</div>
                  </div>
                ))}
              </div>
              {selected.extendedProps.registered && (
                <div className="mt-4 inline-block bg-[#edf8f3] text-[#3a7a5a] border border-[#c0e8d0] px-4 py-1.5 rounded-full text-xs font-semibold">
                  You are registered for this event
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
