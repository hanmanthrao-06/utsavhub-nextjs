"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";

const FEST_PALETTE = [
  { bg:"#F0D9EF", border:"#e0c4de", text:"#7a4a8a", accent:"#9b6aaa", light:"#fdf5ff" },
  { bg:"#FCDCE1", border:"#f0c4cc", text:"#a04060", accent:"#c0546a", light:"#fff5f7" },
  { bg:"#FFE6BB", border:"#f0d090", text:"#8a5a10", accent:"#b07d2a", light:"#fffbf0" },
  { bg:"#E9ECCE", border:"#d4d8a8", text:"#5a6020", accent:"#6a7a2a", light:"#f8f9f0" },
  { bg:"#CDE9DC", border:"#a8d8c0", text:"#2a6a4a", accent:"#3a7a5a", light:"#f0fbf6" },
  { bg:"#C4DFE5", border:"#a0c8d4", text:"#2a5a70", accent:"#4a8fa0", light:"#f0f8fb" },
];

const CAT_COLORS: Record<string, [string, string]> = {
  technical:   ["#C4DFE5","#4a8fa0"], coding:    ["#C4DFE5","#4a8fa0"],
  cultural:    ["#FCDCE1","#c0546a"], theatre:   ["#FCDCE1","#c0546a"],
  quiz:        ["#CDE9DC","#3a7a5a"], debate:    ["#CDE9DC","#3a7a5a"],
  music:       ["#FFE6BB","#b07d2a"], dance:     ["#FCDCE1","#c0546a"],
  arts:        ["#F0D9EF","#9b6aaa"], design:    ["#F0D9EF","#9b6aaa"],
  literary:    ["#E9ECCE","#6a7a2a"], management:["#E9ECCE","#6a7a2a"],
  gaming:      ["#FCDCE1","#c0546a"], media:     ["#C4DFE5","#4a8fa0"],
  electronics: ["#C4DFE5","#4a8fa0"], innovation:["#FFE6BB","#b07d2a"],
  photography: ["#E9ECCE","#6a7a2a"], spiritual: ["#CDE9DC","#3a7a5a"],
};

function catStyle(cat: string): [string, string] {
  return CAT_COLORS[(cat || "").toLowerCase()] || ["#f0f0f0", "#666"];
}

interface Fest { main_event_id: number; name: string; }
interface Event { sub_event_id: number; name: string; category: string; type: string; venue: string; day: string; time: string; }
interface Member { name: string; roll: string; email: string; }

export default function EventsPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ participant_id: number; name: string } | null>(null);
  const [fests, setFests] = useState<Fest[]>([]);
  const [countMap, setCountMap] = useState<Record<number, number>>({});
  const [selectedFest, setSelectedFest] = useState<Fest | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [registered, setRegistered] = useState<number[]>([]);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("All");
  const [loading, setLoading] = useState(false);
  const [regSuccess, setRegSuccess] = useState<Record<number, string>>({});
  const [groupForms, setGroupForms] = useState<Record<number, { size: number; members: Member[] }>>({});

  useEffect(() => {
    const u = sessionStorage.getItem("user");
    if (!u) { router.push("/"); return; }
    setUser(JSON.parse(u));
    fetch("/api/fests").then(r => r.json()).then(d => {
      setFests(d.fests || []);
      setCountMap(d.countMap || {});
    });
  }, [router]);

  const openFest = useCallback(async (fest: Fest) => {
    setSelectedFest(fest);
    setLoading(true);
    const res = await fetch(`/api/events?festId=${fest.main_event_id}&userId=${user?.participant_id}`);
    const data = await res.json();
    setEvents(data.events || []);
    setRegistered(data.registered || []);
    setLoading(false);
  }, [user]);

  const filteredEvents = events.filter(e =>
    (!search || e.name.toLowerCase().includes(search.toLowerCase())) &&
    (catFilter === "All" || (e.category || "").toLowerCase() === catFilter.toLowerCase())
  );

  const [confirmEvent, setConfirmEvent] = useState<{e: Event; isGroup: boolean} | null>(null);

  async function registerSolo(e: Event) {
    const res = await fetch("/api/registration", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user?.participant_id, subEventId: e.sub_event_id, festId: selectedFest?.main_event_id, isGroup: false }),
    });
    const data = await res.json();
    if (data.success) {
      setRegistered(prev => [...prev, e.sub_event_id]);
      setRegSuccess(prev => ({ ...prev, [e.sub_event_id]: data.code }));
      setConfirmEvent(null);
    }
  }

  async function registerGroup(e: Event) {
    const form = groupForms[e.sub_event_id];
    if (!form) return;
    const incomplete = form.members.some(m => !m.name.trim() || !m.roll.trim() || !m.email.trim());
    if (incomplete) { alert("Please fill all member details (Name, Roll, Email)"); return; }
    const res = await fetch("/api/registration", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user?.participant_id, subEventId: e.sub_event_id, festId: selectedFest?.main_event_id, isGroup: true, teamSize: form.size, members: form.members }),
    });
    const data = await res.json();
    if (data.success) {
      setRegistered(prev => [...prev, e.sub_event_id]);
      setRegSuccess(prev => ({ ...prev, [e.sub_event_id]: data.code }));
    }
  }

  function initGroupForm(subId: number, size: number) {
    setGroupForms(prev => ({
      ...prev,
      [subId]: { size, members: Array(size).fill(null).map(() => ({ name: "", roll: "", email: "" })) }
    }));
  }

  function updateMember(subId: number, idx: number, field: keyof Member, val: string) {
    setGroupForms(prev => {
      const form = { ...prev[subId] };
      form.members = form.members.map((m, i) => i === idx ? { ...m, [field]: val } : m);
      return { ...prev, [subId]: form };
    });
  }

  if (!user) return null;

  const CATS = ["All","Technical","Cultural","Quiz","Gaming","Literary","Music","Dance","Media","Management","Arts","Theatre","Debate","Photography","Spiritual","Electronics","Design","Innovation","Coding"];

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(160deg,#faf8ff 0%,#f5f0fa 30%,#eef6f8 60%,#f0f8f4 100%)" }}>
      <Navbar userName={user.name} />

      {!selectedFest ? (
        /* FEST OVERVIEW */
        <div className="max-w-5xl mx-auto px-4 md:px-6 py-6 md:py-10">
          <div className="text-center mb-10 animate-fade-in-down">
            <h1 className="font-playfair text-4xl font-bold text-[#1a1a2e] mb-2">Explore Fests</h1>
            <p className="text-[#aaa] text-sm">Choose a fest to browse and register for competitions</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {fests.map((fest, i) => {
              const p = FEST_PALETTE[i % FEST_PALETTE.length];
              const count = countMap[fest.main_event_id] || 0;
              return (
                <div key={fest.main_event_id}
                  className="rounded-3xl p-7 cursor-pointer transition-all duration-300 hover:-translate-y-3 hover:shadow-2xl hover:scale-[1.02] animate-fade-in-up"
                  style={{ background: p.light, border: `1.5px solid ${p.border}`, animationDelay: `${i * 0.08}s` }}
                  onClick={() => openFest(fest)}>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="w-11 h-11 rounded-2xl flex items-center justify-center mb-4 text-lg font-bold"
                        style={{ background: p.bg, border: `1.5px solid ${p.border}`, color: p.text }}>
                        ✦
                      </div>
                      <h2 className="font-playfair text-2xl font-bold mb-1" style={{ color: p.text }}>{fest.name}</h2>
                      <p className="text-sm font-medium" style={{ color: p.accent }}>{count} competitions</p>
                    </div>
                    <span className="text-2xl opacity-30 mt-1" style={{ color: p.accent }}>→</span>
                  </div>
                  <div className="mt-4">
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-white/60"
                      style={{ color: p.text, border: `1px solid ${p.border}` }}>
                      {count} events
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* FEST DETAIL */
        <div className="max-w-4xl mx-auto px-4 md:px-6 py-6 md:py-8">
          {/* Back */}
          <button onClick={() => { setSelectedFest(null); setEvents([]); setSearch(""); setCatFilter("All"); }}
            className="flex items-center gap-2 text-sm font-semibold text-[#555] hover:text-[#9b6aaa] mb-6 transition-colors">
            ← Back to Fests
          </button>

          {/* Fest header */}
          {(() => {
            const idx = fests.findIndex(f => f.main_event_id === selectedFest.main_event_id);
            const p = FEST_PALETTE[idx % FEST_PALETTE.length];
            return (
              <div className="rounded-2xl p-6 mb-6 flex items-center justify-between animate-fade-in"
                style={{ background: p.light, border: `1.5px solid ${p.border}` }}>
                <div>
                  <h1 className="font-playfair text-3xl font-bold" style={{ color: p.text }}>{selectedFest.name}</h1>
                  <p className="text-sm mt-1" style={{ color: p.accent }}>{events.length} competitions available</p>
                </div>
                <span className="text-sm font-semibold px-4 py-1.5 rounded-full bg-white"
                  style={{ color: p.accent, border: `1px solid ${p.border}` }}>
                  {registered.length} registered
                </span>
              </div>
            );
          })()}

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search events by name..."
              className="flex-1 bg-white border border-[#eee] rounded-xl px-4 py-2.5 text-sm text-[#1a1a2e] focus:outline-none focus:border-[#b388c8] transition-all" />
            <select value={catFilter} onChange={e => setCatFilter(e.target.value)}
              className="bg-white border border-[#eee] rounded-xl px-4 py-2.5 text-sm text-[#1a1a2e] focus:outline-none focus:border-[#b388c8] transition-all">
              {CATS.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>

          {loading ? (
            <div className="text-center py-16 text-[#aaa]">Loading events...</div>
          ) : filteredEvents.length === 0 ? (
            <div className="text-center py-16 text-[#aaa] text-sm">No events found</div>
          ) : (
            <div className="space-y-4">
              {filteredEvents.map((e, ei) => {
                const isReg = registered.includes(e.sub_event_id);
                const isGroup = (e.type || "").toLowerCase() === "group";
                const [cbg, ccolor] = catStyle(e.category);
                const idx = fests.findIndex(f => f.main_event_id === selectedFest.main_event_id);
                const p = FEST_PALETTE[idx % FEST_PALETTE.length];
                const form = groupForms[e.sub_event_id];

                return (
                  <div key={e.sub_event_id}
                    className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-all animate-fade-in-up"
                    style={{ borderLeft: `4px solid ${p.accent}`, border: `1.5px solid #f0eef8`, borderLeftWidth: "4px", borderLeftColor: p.accent, animationDelay: `${ei * 0.04}s` }}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-[#1a1a2e] text-base mb-2">{e.name}</h3>
                        <div className="flex flex-wrap gap-1.5 mb-2">
                          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full" style={{ background: cbg, color: ccolor }}>{e.category || "—"}</span>
                          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full" style={{ background: isGroup ? "#e8f4ff" : "#f0f8f0", color: isGroup ? "#4a7fa0" : "#3a7a5a" }}>{isGroup ? "Group" : "Solo"}</span>
                        </div>
                        <div className="flex flex-wrap gap-3 text-xs text-[#bbb]">
                          <span>{e.venue || "—"}</span>
                          <span>{e.day || "—"}</span>
                          <span>{e.time || "—"}</span>
                        </div>
                      </div>
                      {isReg && (
                        <div className="ml-4 flex flex-col items-end gap-1">
                          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[#edf8f3] text-[#3a7a5a] border border-[#c0e8d0]">Registered</span>
                          {regSuccess[e.sub_event_id] && (
                            <span className="text-xs font-mono text-[#9b6aaa] tracking-widest">{regSuccess[e.sub_event_id]}</span>
                          )}
                        </div>
                      )}
                    </div>

                    {!isReg && (
                      <div className="mt-4 pt-4 border-t border-[#f5f5f5]">
                        {!isGroup ? (
                          <>
                            {confirmEvent?.e.sub_event_id === e.sub_event_id ? (
                              <div className="bg-[#faf8ff] border border-[#ede8ff] rounded-xl p-4">
                                <p className="text-sm font-semibold text-[#1a1a2e] mb-1">Confirm Registration</p>
                                <p className="text-xs text-[#888] mb-3">Register for <strong>{e.name}</strong> under <strong>{selectedFest?.name}</strong>?</p>
                                <div className="flex gap-2">
                                  <button onClick={() => registerSolo(e)}
                                    className="px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all"
                                    style={{ background: `linear-gradient(135deg, ${p.accent}, #4a8fa0)` }}>
                                    Yes, Register
                                  </button>
                                  <button onClick={() => setConfirmEvent(null)}
                                    className="px-4 py-2 rounded-xl text-sm font-semibold text-[#888] bg-[#f5f5f5] hover:bg-[#eee] transition-all">
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <button onClick={() => setConfirmEvent({ e, isGroup: false })}
                                className="px-5 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:shadow-lg"
                                style={{ background: `linear-gradient(135deg, ${p.accent}, #4a8fa0)` }}>
                                Register for {e.name}
                              </button>
                            )}
                          </>
                        ) : (
                          <div>
                            {/* Step 1: Register as Group button */}
                            {!form && (
                              <button
                                onClick={() => initGroupForm(e.sub_event_id, 2)}
                                className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:shadow-lg"
                                style={{ background: `linear-gradient(135deg, ${p.accent}, #4a8fa0)`, boxShadow: `0 4px 14px ${p.accent}55` }}>
                                Register as Group for {e.name}
                              </button>
                            )}

                            {/* Step 2: Team size + member details */}
                            {form && (
                              <div>
                                <p className="text-xs font-semibold mb-3" style={{ color: p.accent }}>Group Registration — fill member details</p>
                                <div className="flex items-center gap-2 mb-4">
                                  <span className="text-xs text-[#888] font-medium">Team size:</span>
                                  {[2,3,4].map(s => (
                                    <button key={s} onClick={() => initGroupForm(e.sub_event_id, s)}
                                      className="w-9 h-9 rounded-xl text-sm font-bold transition-all border"
                                      style={form.size === s
                                        ? { background: p.accent, color: "white", borderColor: p.accent }
                                        : { background: "#f5f5f5", color: "#555", borderColor: "#eee" }}>
                                      {s}
                                    </button>
                                  ))}
                                  <button onClick={() => setGroupForms(prev => { const n = {...prev}; delete n[e.sub_event_id]; return n; })}
                                    className="ml-auto text-xs text-[#bbb] hover:text-[#c0546a] transition-colors">
                                    Cancel
                                  </button>
                                </div>
                                <div className="space-y-3">
                                  {form.members.map((m, mi) => (
                                    <div key={mi}>
                                      <p className="text-xs font-semibold text-[#888] mb-1.5">Member {mi + 1}</p>
                                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                        <input value={m.name} onChange={e2 => updateMember(e.sub_event_id, mi, "name", e2.target.value)}
                                          placeholder="Full name"
                                          className="bg-[#fafafa] border border-[#eee] rounded-lg px-3 py-2 text-xs text-[#1a1a2e] focus:outline-none focus:border-[#b388c8] transition-all" />
                                        <input value={m.roll} onChange={e2 => updateMember(e.sub_event_id, mi, "roll", e2.target.value)}
                                          placeholder="Roll number"
                                          className="bg-[#fafafa] border border-[#eee] rounded-lg px-3 py-2 text-xs text-[#1a1a2e] focus:outline-none focus:border-[#b388c8] transition-all" />
                                        <input value={m.email} onChange={e2 => updateMember(e.sub_event_id, mi, "email", e2.target.value)}
                                          placeholder="Email"
                                          className="bg-[#fafafa] border border-[#eee] rounded-lg px-3 py-2 text-xs text-[#1a1a2e] focus:outline-none focus:border-[#b388c8] transition-all" />
                                      </div>
                                    </div>
                                  ))}
                                  <button onClick={() => registerGroup(e)}
                                    className="mt-1 px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:shadow-lg"
                                    style={{ background: `linear-gradient(135deg, ${p.accent}, #4a8fa0)`, boxShadow: `0 4px 14px ${p.accent}55` }}>
                                    Confirm Group Registration
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
