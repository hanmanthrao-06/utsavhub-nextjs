"use client";
import { useState, useEffect } from "react";

interface Announcement {
  id: number;
  title: string;
  message: string;
  fest_name: string | null;
  created_at: string;
}

export default function AnnouncementBell() {
  const [open, setOpen] = useState(false);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [seen, setSeen] = useState<number[]>([]);

  useEffect(() => {
    fetch("/api/announcements")
      .then(r => r.json())
      .then(d => setAnnouncements(d.announcements || []));
    const s = JSON.parse(localStorage.getItem("seenAnnouncements") || "[]");
    setSeen(s);
  }, []);

  const unread = announcements.filter(a => !seen.includes(a.id)).length;

  function markAllRead() {
    const ids = announcements.map(a => a.id);
    setSeen(ids);
    localStorage.setItem("seenAnnouncements", JSON.stringify(ids));
  }

  return (
    <div className="relative">
      <button onClick={() => { setOpen(!open); if (!open) markAllRead(); }}
        className="relative p-2 rounded-full hover:bg-[#f5f3ff] transition-all">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#c0546a] text-white text-[9px] font-bold rounded-full flex items-center justify-center">
            {unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-10 w-80 bg-white rounded-2xl shadow-2xl border border-[#f0eef8] z-50 overflow-hidden">
          <div className="px-4 py-3 border-b border-[#f0eef8] flex items-center justify-between">
            <span className="font-semibold text-[#1a1a2e] text-sm">Announcements</span>
            <button onClick={() => setOpen(false)} className="text-[#aaa] hover:text-[#555] text-lg">×</button>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {announcements.length === 0 ? (
              <div className="text-center py-8 text-[#bbb] text-sm">No announcements</div>
            ) : announcements.map(a => (
              <div key={a.id} className="px-4 py-3 border-b border-[#f9f9f9] hover:bg-[#faf8ff] transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-semibold text-[#1a1a2e] text-sm">{a.title}</div>
                    {a.fest_name && (
                      <span className="text-xs bg-[#F0D9EF] text-[#9b6aaa] px-2 py-0.5 rounded-full font-semibold">{a.fest_name}</span>
                    )}
                    <div className="text-xs text-[#666] mt-1">{a.message}</div>
                    <div className="text-xs text-[#bbb] mt-1">{new Date(a.created_at).toLocaleDateString()}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
