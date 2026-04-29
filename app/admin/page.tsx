"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const ADMIN_EMAIL = "varshitha0512@gmail.com";
const ADMIN_PASS  = "admin@123";
const ADMIN_TOKEN = "ADMIN_SECURE_TOKEN_2026";
const COLORS = ["#b388c8","#7bbfcc","#f4a0b0","#f5c87a","#a8c87a","#88b8c8"];

export default function AdminPage() {
  const router = useRouter();
  const [user, setUser] = useState<{participant_id:number;name:string}|null>(null);
  const [authed, setAuthed] = useState(false);
  const [email, setEmail] = useState(""); const [pass, setPass] = useState(""); const [token, setToken] = useState("");
  const [loginErr, setLoginErr] = useState("");
  const [data, setData] = useState<any>(null);
  const [compareBy, setCompareBy] = useState("Schools");
  const [selectedFest, setSelectedFest] = useState("All");
  const [chartData, setChartData] = useState<{name:string;value:number}[]>([]);

  // Event management state
  const [allFests, setAllFests] = useState<{main_event_id:number;name:string}[]>([]);
  const [allEvents, setAllEvents] = useState<{sub_event_id:number;name:string;category:string;type:string;venue:string;day:string;time:string;fest_name:string}[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newEvent, setNewEvent] = useState({ name:"", category:"Technical", type:"Solo", venue:"", day:"Day 1", time:"", festId:"" });
  const [addMsg, setAddMsg] = useState("");

  useEffect(() => {
    const u = sessionStorage.getItem("user");
    if (u) setUser(JSON.parse(u));
    const a = sessionStorage.getItem("adminAuth");
    if (a === "true") { setAuthed(true); loadData(); }
  }, []);

  async function loadData() {
    const res = await fetch("/api/admin");
    const d = await res.json();
    setData(d);
    // Load fests and events for management
    const festRes = await fetch("/api/fests");
    const festData = await festRes.json();
    setAllFests(festData.fests || []);
    if (festData.fests?.length > 0) {
      setNewEvent(prev => ({ ...prev, festId: String(festData.fests[0].main_event_id) }));
    }
    // Load all events
    const evRes = await fetch("/api/admin/events");
    const evData = await evRes.json();
    setAllEvents(evData.events || []);
  }

  async function addEvent() {
    if (!newEvent.name.trim()) { setAddMsg("Event name is required."); return; }
    const res = await fetch("/api/events/manage", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...newEvent, festId: parseInt(newEvent.festId) }),
    });
    const d = await res.json();
    if (d.success) {
      setAddMsg("Event added successfully!");
      setShowAddForm(false);
      setNewEvent(prev => ({ ...prev, name:"", venue:"", time:"" }));
      loadData();
    } else {
      setAddMsg(d.error || "Failed to add event.");
    }
  }

  async function deleteEvent(subEventId: number, name: string) {
    if (!confirm(`Delete "${name}"? This will also remove all registrations for this event.`)) return;
    const res = await fetch("/api/events/manage", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subEventId }),
    });
    const d = await res.json();
    if (d.success) { loadData(); }
  }

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (email.trim().toLowerCase() === ADMIN_EMAIL && pass === ADMIN_PASS && token === ADMIN_TOKEN) {
      setAuthed(true);
      sessionStorage.setItem("adminAuth","true");
      loadData();
    } else {
      setLoginErr("Invalid credentials.");
    }
  }

  useEffect(() => {
    if (!data) return;
    const rows = data.analytics || [];
    let filtered = rows;
    if (selectedFest !== "All") filtered = rows.filter((r:any) => r.fest === selectedFest);
    const counts: Record<string,number> = {};
    filtered.forEach((r:any) => {
      const key = compareBy === "Schools" ? r.school_name : compareBy === "Departments" ? r.department : r.participant_type;
      if (key) counts[key] = (counts[key]||0) + 1;
    });
    setChartData(Object.entries(counts).map(([name,value]) => ({ name: name||"Unknown", value })).sort((a,b) => b.value-a.value).slice(0,10));
  }, [data, compareBy, selectedFest]);

  const fests = data ? [...new Set((data.analytics||[]).map((r:any) => r.fest).filter(Boolean))] as string[] : [];

  return (
    <div className="min-h-screen" style={{ background:"linear-gradient(160deg,#faf8ff 0%,#f5f0fa 30%,#eef6f8 60%,#f0f8f4 100%)" }}>
      <Navbar userName={user?.name} />
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-6 md:py-10">

        {!authed ? (
          <div className="max-w-md mx-auto">
            <div className="text-center mb-8">
              <h1 className="font-playfair text-4xl font-bold text-[#1a1a2e] mb-2">Admin Dashboard</h1>
              <p className="text-[#aaa] text-sm">Secure access for administrators only</p>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-[#f0eef8]">
              <h2 className="font-semibold text-[#1a1a2e] text-lg mb-5 text-center">Admin Login</h2>
              <form onSubmit={handleLogin} className="space-y-4">
                <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email"
                  className="w-full bg-[#fafafa] border border-[#eee] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#b388c8] transition-all" />
                <input value={pass} onChange={e=>setPass(e.target.value)} type="password" placeholder="Password"
                  className="w-full bg-[#fafafa] border border-[#eee] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#b388c8] transition-all" />
                <input value={token} onChange={e=>setToken(e.target.value)} type="password" placeholder="Access Token"
                  className="w-full bg-[#fafafa] border border-[#eee] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#b388c8] transition-all" />
                {loginErr && <p className="text-red-500 text-xs">{loginErr}</p>}
                <button type="submit" className="w-full py-3 rounded-full text-sm font-bold text-white transition-all hover:-translate-y-0.5"
                  style={{ background:"linear-gradient(135deg,#9b6aaa,#4a8fa0)" }}>Login</button>
              </form>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="font-playfair text-3xl font-bold text-[#1a1a2e]">Dashboard</h1>
                <p className="text-[#aaa] text-sm mt-1">Real-time analytics across all fests</p>
              </div>
              <button onClick={() => { setAuthed(false); sessionStorage.removeItem("adminAuth"); }}
                className="text-sm font-semibold text-[#c0546a] bg-[#fff5f7] px-4 py-2 rounded-full border border-[#f0c4cc] hover:bg-[#fce8ec] transition-all">
                Logout
              </button>
            </div>

            {/* Metrics */}
            {data?.metrics && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {[
                  { icon:"📝", num:parseInt(data.metrics.regs).toLocaleString(), label:"Registrations" },
                  { icon:"👥", num:parseInt(data.metrics.parts).toLocaleString(), label:"Participants" },
                  { icon:"🎊", num:data.metrics.fests, label:"Fests" },
                  { icon:"🎪", num:data.metrics.events, label:"Sub Events" },
                ].map((m,i) => (
                  <div key={i} className="bg-white rounded-2xl p-5 text-center shadow-sm border border-[#f0eef8] hover:shadow-md hover:-translate-y-1 transition-all">
                    <div className="text-2xl mb-1">{m.icon}</div>
                    <div className="font-playfair text-2xl font-bold text-[#1a1a2e]">{m.num}</div>
                    <div className="text-xs text-[#aaa] uppercase tracking-widest mt-1">{m.label}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Analytics */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#f0eef8] mb-6">
              <h2 className="font-semibold text-[#1a1a2e] text-base mb-4">Participation Analytics</h2>
              <div className="flex gap-3 mb-6 flex-wrap">
                {["Schools","Departments","Internal vs External"].map(opt => (
                  <button key={opt} onClick={() => setCompareBy(opt)}
                    className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${compareBy===opt ? "bg-[#1a1a2e] text-white" : "bg-[#f5f5f5] text-[#555] hover:bg-[#eee]"}`}>
                    {opt}
                  </button>
                ))}
                <select value={selectedFest} onChange={e=>setSelectedFest(e.target.value)}
                  className="bg-[#fafafa] border border-[#eee] rounded-xl px-3 py-1.5 text-sm focus:outline-none">
                  <option>All</option>
                  {fests.map(f => <option key={f}>{f}</option>)}
                </select>
              </div>
              {chartData.length > 0 && (
                <div className="grid grid-cols-2 gap-6">
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({name,percent}) => `${name} ${(percent*100).toFixed(0)}%`}>
                        {chartData.map((_,i) => <Cell key={i} fill={COLORS[i%COLORS.length]} />)}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={chartData}>
                      <XAxis dataKey="name" tick={{ fontSize:10 }} angle={-20} textAnchor="end" />
                      <YAxis tick={{ fontSize:10 }} />
                      <Tooltip />
                      <Bar dataKey="value" radius={[6,6,0,0]}>
                        {chartData.map((_,i) => <Cell key={i} fill={COLORS[i%COLORS.length]} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* Event Management */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#f0eef8] mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-[#1a1a2e] text-base">Event Management</h2>
                <button onClick={() => { setShowAddForm(!showAddForm); setAddMsg(""); }}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:-translate-y-0.5"
                  style={{ background: "linear-gradient(135deg,#9b6aaa,#4a8fa0)" }}>
                  {showAddForm ? "Cancel" : "+ Add Event"}
                </button>
              </div>

              {/* Add Event Form */}
              {showAddForm && (
                <div className="bg-[#faf8ff] border border-[#ede8ff] rounded-xl p-5 mb-5">
                  <h3 className="font-semibold text-[#1a1a2e] text-sm mb-4">Add New Event</h3>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <label className="text-xs text-[#888] font-semibold mb-1 block">Event Name *</label>
                      <input value={newEvent.name} onChange={e => setNewEvent(p => ({...p, name: e.target.value}))}
                        placeholder="e.g. Hackathon"
                        className="w-full bg-white border border-[#eee] rounded-lg px-3 py-2 text-sm text-[#1a1a2e] focus:outline-none focus:border-[#b388c8] transition-all" />
                    </div>
                    <div>
                      <label className="text-xs text-[#888] font-semibold mb-1 block">Fest</label>
                      <select value={newEvent.festId} onChange={e => setNewEvent(p => ({...p, festId: e.target.value}))}
                        className="w-full bg-white border border-[#eee] rounded-lg px-3 py-2 text-sm text-[#1a1a2e] focus:outline-none focus:border-[#b388c8] transition-all">
                        {allFests.map(f => <option key={f.main_event_id} value={f.main_event_id}>{f.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-[#888] font-semibold mb-1 block">Category</label>
                      <select value={newEvent.category} onChange={e => setNewEvent(p => ({...p, category: e.target.value}))}
                        className="w-full bg-white border border-[#eee] rounded-lg px-3 py-2 text-sm text-[#1a1a2e] focus:outline-none focus:border-[#b388c8] transition-all">
                        {["Technical","Cultural","Quiz","Gaming","Literary","Music","Dance","Media","Management","Arts","Theatre","Debate","Photography","Spiritual","Electronics","Design","Innovation","Coding"].map(c => <option key={c}>{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-[#888] font-semibold mb-1 block">Type</label>
                      <select value={newEvent.type} onChange={e => setNewEvent(p => ({...p, type: e.target.value}))}
                        className="w-full bg-white border border-[#eee] rounded-lg px-3 py-2 text-sm text-[#1a1a2e] focus:outline-none focus:border-[#b388c8] transition-all">
                        <option>Solo</option><option>Group</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-[#888] font-semibold mb-1 block">Venue</label>
                      <input value={newEvent.venue} onChange={e => setNewEvent(p => ({...p, venue: e.target.value}))}
                        placeholder="e.g. Auditorium"
                        className="w-full bg-white border border-[#eee] rounded-lg px-3 py-2 text-sm text-[#1a1a2e] focus:outline-none focus:border-[#b388c8] transition-all" />
                    </div>
                    <div>
                      <label className="text-xs text-[#888] font-semibold mb-1 block">Day</label>
                      <input value={newEvent.day} onChange={e => setNewEvent(p => ({...p, day: e.target.value}))}
                        placeholder="e.g. Day 1"
                        className="w-full bg-white border border-[#eee] rounded-lg px-3 py-2 text-sm text-[#1a1a2e] focus:outline-none focus:border-[#b388c8] transition-all" />
                    </div>
                    <div>
                      <label className="text-xs text-[#888] font-semibold mb-1 block">Time</label>
                      <input value={newEvent.time} onChange={e => setNewEvent(p => ({...p, time: e.target.value}))}
                        placeholder="e.g. 10:00-12:00pm"
                        className="w-full bg-white border border-[#eee] rounded-lg px-3 py-2 text-sm text-[#1a1a2e] focus:outline-none focus:border-[#b388c8] transition-all" />
                    </div>
                  </div>
                  {addMsg && <p className={`text-xs mb-3 ${addMsg.includes("success") ? "text-green-600" : "text-red-500"}`}>{addMsg}</p>}
                  <button onClick={addEvent}
                    className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:-translate-y-0.5"
                    style={{ background: "linear-gradient(135deg,#9b6aaa,#4a8fa0)" }}>
                    Add Event
                  </button>
                </div>
              )}

              {/* Events List */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#f0eef8]">
                      {["Event","Fest","Category","Type","Venue","Day","Time","Action"].map(h => (
                        <th key={h} className="text-left py-2 px-3 text-xs text-[#aaa] font-semibold uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {allEvents.map((ev: any) => (
                      <tr key={ev.sub_event_id} className="border-b border-[#f9f9f9] hover:bg-[#faf8ff] transition-colors">
                        <td className="py-2 px-3 font-medium text-[#1a1a2e]">{ev.name}</td>
                        <td className="py-2 px-3 text-xs text-[#888]">{ev.fest_name}</td>
                        <td className="py-2 px-3 text-xs text-[#888]">{ev.category}</td>
                        <td className="py-2 px-3"><span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${ev.type==="Group"?"bg-[#e8f4ff] text-[#4a7fa0]":"bg-[#f0f8f0] text-[#3a7a5a]"}`}>{ev.type}</span></td>
                        <td className="py-2 px-3 text-xs text-[#888]">{ev.venue||"—"}</td>
                        <td className="py-2 px-3 text-xs text-[#888]">{ev.day||"—"}</td>
                        <td className="py-2 px-3 text-xs text-[#888]">{ev.time||"—"}</td>
                        <td className="py-2 px-3">
                          <button onClick={() => deleteEvent(ev.sub_event_id, ev.name)}
                            className="text-xs text-[#c0546a] bg-[#fff5f7] px-3 py-1 rounded-lg border border-[#f0c4cc] hover:bg-[#fce8ec] transition-all font-semibold">
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {allEvents.length === 0 && <p className="text-center text-[#bbb] text-sm py-6">No events found</p>}
              </div>
            </div>

            {/* Registrations table */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#f0eef8]">
              <h2 className="font-semibold text-[#1a1a2e] text-base mb-4">Recent Registrations</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#f0eef8]">
                      {["Code","Date","Name","Roll","Email","Type","Event","Fest"].map(h => (
                        <th key={h} className="text-left py-2 px-3 text-xs text-[#aaa] font-semibold uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {(data?.registrations||[]).map((r:any, i:number) => (
                      <tr key={i} className="border-b border-[#f9f9f9] hover:bg-[#faf8ff] transition-colors">
                        <td className="py-2 px-3 font-mono text-xs text-[#9b6aaa]">{r.registration_code}</td>
                        <td className="py-2 px-3 text-xs text-[#888]">{r.registration_date ? new Date(r.registration_date).toLocaleDateString() : "—"}</td>
                        <td className="py-2 px-3 font-medium text-[#1a1a2e]">{r.name}</td>
                        <td className="py-2 px-3 text-xs text-[#888]">{r.roll_number||"—"}</td>
                        <td className="py-2 px-3 text-xs text-[#888]">{r.email||"—"}</td>
                        <td className="py-2 px-3"><span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${r.participant_type==="internal"?"bg-[#e8f4ff] text-[#4a7fa0]":"bg-[#fff5f7] text-[#c0546a]"}`}>{r.participant_type}</span></td>
                        <td className="py-2 px-3 text-xs text-[#555]">{r.event}</td>
                        <td className="py-2 px-3 text-xs text-[#888]">{r.fest}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
