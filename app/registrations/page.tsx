"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";

const FEST_COLORS = ["#F0D9EF","#FCDCE1","#FFE6BB","#E9ECCE","#CDE9DC","#C4DFE5"];
const FEST_TEXT   = ["#9b6aaa","#c0546a","#b07d2a","#6a7a2a","#3a7a5a","#4a8fa0"];
const CAT_COLORS: Record<string, [string,string]> = {
  technical:["#C4DFE5","#4a8fa0"], cultural:["#FCDCE1","#c0546a"],
  quiz:["#CDE9DC","#3a7a5a"], music:["#FFE6BB","#b07d2a"],
  arts:["#F0D9EF","#9b6aaa"], literary:["#E9ECCE","#6a7a2a"],
  dance:["#FCDCE1","#c0546a"], management:["#E9ECCE","#6a7a2a"],
};

interface Reg {
  registration_id: number; registration_code: string; registration_date: string;
  name: string; category: string; type: string; venue: string; day: string; time: string;
  fest_name: string; team_size: number;
}

export default function RegistrationsPage() {
  const router = useRouter();
  const [user, setUser] = useState<{participant_id:number;name:string}|null>(null);
  const [regs, setRegs] = useState<Reg[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const u = sessionStorage.getItem("user");
    if (!u) { router.push("/"); return; }
    const parsed = JSON.parse(u);
    setUser(parsed);
    fetch(`/api/registration?userId=${parsed.participant_id}`)
      .then(r => r.json())
      .then(d => { setRegs(d.registrations || []); setLoading(false); });
  }, [router]);

  if (!user) return null;

  // Group by fest
  const grouped: Record<string, Reg[]> = {};
  regs.forEach(r => {
    if (!grouped[r.fest_name]) grouped[r.fest_name] = [];
    grouped[r.fest_name].push(r);
  });
  const festNames = Object.keys(grouped);

  return (
    <div className="min-h-screen" style={{ background:"linear-gradient(160deg,#faf8ff 0%,#f5f0fa 30%,#eef6f8 60%,#f0f8f4 100%)" }}>
      <Navbar userName={user.name} />
      <div className="max-w-5xl mx-auto px-4 md:px-6 py-6 md:py-10">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in-down">
          <h1 className="font-playfair text-4xl font-bold text-[#1a1a2e] mb-2">My Registrations</h1>
          <p className="text-[#aaa] text-sm">All your event registrations in one place</p>
        </div>

        {/* Summary */}
        {regs.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 animate-fade-in">
            {[
              { num: regs.length, label: "Events Registered" },
              { num: festNames.length, label: "Fests" },
              { num: regs.filter(r => r.team_size > 1).length, label: "Group Entries" },
            ].map((s,i) => (
              <div key={i} className="bg-white border border-[#f0eef8] rounded-2xl p-5 text-center shadow-sm hover:shadow-md hover:-translate-y-1 transition-all">
                <div className="font-playfair text-3xl font-bold text-[#1a1a2e]">{s.num}</div>
                <div className="text-xs text-[#aaa] uppercase tracking-widest mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {loading ? (
          <div className="text-center py-16 text-[#aaa]">Loading...</div>
        ) : regs.length === 0 ? (
          <div className="text-center py-16">
            <div className="font-playfair text-xl font-bold text-[#1a1a2e] mb-2">No registrations yet</div>
            <p className="text-[#bbb] text-sm mb-6">Head to Events to register for your first fest</p>
            <button onClick={() => router.push("/events")}
              className="px-6 py-2.5 rounded-full text-sm font-semibold text-white"
              style={{ background:"linear-gradient(135deg,#9b6aaa,#4a8fa0)" }}>
              Browse Events
            </button>
          </div>
        ) : (
          festNames.map((festName, fi) => {
            const fc = FEST_COLORS[fi % FEST_COLORS.length];
            const ft = FEST_TEXT[fi % FEST_TEXT.length];
            return (
              <div key={festName} className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-sm font-bold px-4 py-1.5 rounded-full" style={{ background:fc, color:ft }}>{festName}</span>
                  <span className="text-xs text-[#aaa]">{grouped[festName].length} events</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {grouped[festName].map(r => {
                    const [cbg, ccolor] = CAT_COLORS[(r.category||"").toLowerCase()] || ["#f0f0f0","#666"];
                    return (
                      <div key={r.registration_id}
                        className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all animate-fade-in-up"
                        style={{ borderLeft:`4px solid ${fc}`, border:`1.5px solid #f0eef8`, borderLeftWidth:"4px", borderLeftColor:fc }}>
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <div className="font-semibold text-[#1a1a2e] text-sm">{r.name}</div>
                            <div className="text-xs text-[#aaa] mt-0.5">{r.fest_name}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-[10px] text-[#bbb] uppercase tracking-widest">Reg Code</div>
                            <div className="font-mono font-bold text-sm tracking-widest" style={{ color:ft }}>{r.registration_code || "—"}</div>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1.5 mb-2">
                          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full" style={{ background:cbg, color:ccolor }}>{r.category||"—"}</span>
                          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#f5f5f5] text-[#888]">{r.type||"Solo"}</span>
                          {r.team_size > 1 && <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#e8f4ff] text-[#4a7fa0]">Team of {r.team_size}</span>}
                        </div>
                        <div className="flex flex-wrap gap-3 text-xs text-[#bbb]">
                          <span>{r.venue||"—"}</span><span>{r.day||"—"}</span><span>{r.time||"—"}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
