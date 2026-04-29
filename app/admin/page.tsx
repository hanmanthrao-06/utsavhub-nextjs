"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import {
  BarChart, Bar, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  PieChart, Pie, Cell, XAxis, YAxis, Tooltip, Legend,
  CartesianGrid, ResponsiveContainer
} from "recharts";

const ADMINS = [
  { email: "varshitha0512@gmail.com", pass: "admin@123",  token: "ADMIN_SECURE_TOKEN_2026" },
  { email: "hanmanthraobd@gmail.com", pass: "vayu2006",   token: "hanmanthrao06" },
];
const COLORS = ["#b388c8","#7bbfcc","#f4a0b0","#f5c87a","#a8c87a","#88b8c8","#c8a8b3","#a8c8b3","#c8c8a8","#a8b3c8"];

export default function AdminPage() {
  const router = useRouter();
  const chartRef = useRef<HTMLDivElement>(null);
  const [user, setUser] = useState<{participant_id:number;name:string}|null>(null);
  const [authed, setAuthed] = useState(false);
  const [email, setEmail] = useState(""); const [pass, setPass] = useState(""); const [token, setToken] = useState("");
  const [loginErr, setLoginErr] = useState("");
  const [data, setData] = useState<any>(null);

  // Graph Builder state
  const [xAxis, setXAxis] = useState("school");
  const [yAxis, setYAxis] = useState("count");
  const [chartType, setChartType] = useState("bar");
  const [filterFest, setFilterFest] = useState("All");
  const [filterType, setFilterType] = useState("All");
  const [customMode, setCustomMode] = useState(false);
  const [customSelection, setCustomSelection] = useState<string[]>([]);
  const [chartData, setChartData] = useState<{name:string;value:number}[]>([]);

  const [regSearch, setRegSearch] = useState("");
  const [regSortBy, setRegSortBy] = useState("date_desc");
  const [selectedParticipant, setSelectedParticipant] = useState<any>(null);
  const [participantProfile, setParticipantProfile] = useState<any>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  // Announcements
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [newAnnouncement, setNewAnnouncement] = useState({ title:"", message:"", festName:"" });
  const [annMsg, setAnnMsg] = useState("");
  // Fest management
  const [showAddFest, setShowAddFest] = useState(false);
  const [newFest, setNewFest] = useState({ name: "" });
  const [festMsg, setFestMsg] = useState("");

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
    const festRes = await fetch("/api/fests");
    const festData = await festRes.json();
    setAllFests(festData.fests || []);
    if (festData.fests?.length > 0) {
      setNewEvent(prev => ({ ...prev, festId: String(festData.fests[0].main_event_id) }));
    }
    const evRes = await fetch("/api/admin/events");
    const evData = await evRes.json();
    setAllEvents(evData.events || []);
    const annRes = await fetch("/api/announcements");
    const annData = await annRes.json();
    setAnnouncements(annData.announcements || []);
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

  async function addFest() {
    if (!newFest.name.trim()) { setFestMsg("Fest name is required."); return; }
    const res = await fetch("/api/fests/manage", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newFest.name }),
    });
    const d = await res.json();
    if (d.success) {
      setFestMsg("Fest added!");
      setNewFest({ name: "" });
      setShowAddFest(false);
      loadData();
    } else { setFestMsg(d.error || "Failed."); }
  }

  async function deleteFest(festId: number, name: string) {
    if (!confirm(`Delete fest "${name}"? This will remove all events and registrations under it.`)) return;
    const res = await fetch("/api/fests/manage", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ festId }),
    });
    const d = await res.json();
    if (d.success) { loadData(); }
  }

  async function openParticipantProfile(participantId: number) {
    setProfileLoading(true);
    setSelectedParticipant(participantId);
    const res = await fetch(`/api/participant?id=${participantId}`);
    const d = await res.json();
    setParticipantProfile(d);
    setProfileLoading(false);
  }

  async function removeRegistration(participantId: number, subEventId: number) {
    if (!confirm("Remove this registration?")) return;
    await fetch("/api/participant", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ participantId, subEventId }),
    });
    openParticipantProfile(participantId);
    loadData();
  }

  async function postAnnouncement() {
    if (!newAnnouncement.title.trim() || !newAnnouncement.message.trim()) {
      setAnnMsg("Title and message are required."); return;
    }
    const res = await fetch("/api/announcements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newAnnouncement),
    });
    const d = await res.json();
    if (d.success) {
      setAnnMsg("Announcement posted!");
      setNewAnnouncement({ title:"", message:"", festName:"" });
      loadData();
    } else { setAnnMsg(d.error || "Failed."); }
  }

  async function deleteAnnouncement(id: number) {
    await fetch("/api/announcements", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    loadData();
  }

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    const valid = ADMINS.some(a =>
      email.trim().toLowerCase() === a.email && pass === a.pass && token === a.token
    );
    if (valid) {
      setAuthed(true);
      sessionStorage.setItem("adminAuth","true");
      loadData();
    } else {
      setLoginErr("Invalid credentials.");
    }
  }

  useEffect(() => {
    if (!data) return;
    let rows = data.analytics || [];

    // Apply filters
    if (filterFest !== "All") rows = rows.filter((r:any) => r.fest === filterFest);
    if (filterType !== "All") rows = rows.filter((r:any) => r.participant_type === filterType);

    const counts: Record<string,number> = {};

    if (customMode && customSelection.length > 0) {
      rows.forEach((r:any) => {
        const candidates = [r.school_name, r.fest, r.sub_event, r.participant_type];
        const key = candidates.find(v => v && customSelection.includes(v));
        if (key) counts[key] = (counts[key]||0) + 1;
      });
    } else {
      rows.forEach((r:any) => {
        let key = "";
        if (xAxis === "school") key = r.school_name || "Unknown";
        else if (xAxis === "fest") key = r.fest || "Unknown";
        else if (xAxis === "event") key = r.sub_event || "Unknown";
        else if (xAxis === "type") key = r.participant_type || "Unknown";
        if (key) counts[key] = (counts[key]||0) + 1;
      });
    }

    let result = Object.entries(counts).map(([name,value]) => ({ name, value }));
    if (yAxis === "percent") {
      const total = result.reduce((s,r) => s+r.value, 0);
      result = result.map(r => ({ ...r, value: total > 0 ? Math.round((r.value/total)*100) : 0 }));
    }
    result = result.sort((a,b) => b.value-a.value).slice(0,20);
    if (yAxis === "rank") {
      result = result.map((r,i) => ({ ...r, value: i+1 }));
    }
    if (yAxis === "cumulative") {
      let cum = 0;
      result = result.map(r => { cum += r.value; return { ...r, value: cum }; });
    }
    if (yAxis === "ratio") {
      // For each group, compute internal/external ratio
      const internalCounts: Record<string,number> = {};
      const externalCounts: Record<string,number> = {};
      rows.forEach((r:any) => {
        let key = "";
        if (xAxis === "school") key = r.school_name || "Unknown";
        else if (xAxis === "fest") key = r.fest || "Unknown";
        else if (xAxis === "event") key = r.sub_event || "Unknown";
        else if (xAxis === "type") key = r.participant_type || "Unknown";
        if (!key) return;
        if (r.participant_type === "internal") internalCounts[key] = (internalCounts[key]||0)+1;
        else externalCounts[key] = (externalCounts[key]||0)+1;
      });
      result = result.map(r => ({
        ...r,
        value: Math.round(((internalCounts[r.name]||0) / Math.max((externalCounts[r.name]||1), 1)) * 100) / 100
      }));
    }
    setChartData(result);
  }, [data, xAxis, yAxis, filterFest, filterType, customMode, customSelection]);

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

            {/* Analytics Graph Builder */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#f0eef8] mb-6">
              <h2 className="font-semibold text-[#1a1a2e] text-base mb-5">Analytics Graph Builder</h2>

              {/* Controls row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                <div>
                  <label className="text-xs text-[#888] font-semibold mb-1 block uppercase tracking-wider">X Axis</label>
                  <select value={xAxis} onChange={e => { setXAxis(e.target.value); setCustomMode(false); }}
                    className="w-full bg-[#fafafa] border border-[#eee] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#b388c8]">
                    <option value="school">School</option>
                    <option value="fest">Fest</option>
                    <option value="event">Event</option>
                    <option value="type">Internal / External</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-[#888] font-semibold mb-1 block uppercase tracking-wider">Y Axis</label>
                  <select value={yAxis} onChange={e => setYAxis(e.target.value)}
                    className="w-full bg-[#fafafa] border border-[#eee] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#b388c8]">
                    <option value="count">Registration Count</option>
                    <option value="percent">Percentage (%)</option>
                    <option value="rank">Rank (1 = highest)</option>
                    <option value="cumulative">Cumulative Count</option>
                    <option value="ratio">Internal/External Ratio</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-[#888] font-semibold mb-1 block uppercase tracking-wider">Chart Type</label>
                  <div className="flex gap-1 flex-wrap">
                    {[
                      { v:"bar",    label:"Bar" },
                      { v:"hbar",   label:"H-Bar" },
                      { v:"pie",    label:"Pie" },
                      { v:"donut",  label:"Donut" },
                      { v:"radar",  label:"Radar" },
                      { v:"heatmap",label:"Heat" },
                    ].map(ct => (
                      <button key={ct.v} onClick={() => setChartType(ct.v)}
                        className={`px-2 py-1.5 rounded-lg text-xs font-semibold transition-all ${chartType===ct.v ? "bg-[#1a1a2e] text-white" : "bg-[#f5f5f5] text-[#555] hover:bg-[#eee]"}`}>
                        {ct.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs text-[#888] font-semibold mb-1 block uppercase tracking-wider">Filters</label>
                  <div className="flex gap-1">
                    <select value={filterFest} onChange={e => setFilterFest(e.target.value)}
                      className="flex-1 bg-[#fafafa] border border-[#eee] rounded-lg px-2 py-2 text-xs focus:outline-none">
                      <option value="All">All Fests</option>
                      {fests.map(f => <option key={f}>{f}</option>)}
                    </select>
                    <select value={filterType} onChange={e => setFilterType(e.target.value)}
                      className="flex-1 bg-[#fafafa] border border-[#eee] rounded-lg px-2 py-2 text-xs focus:outline-none">
                      <option value="All">All Types</option>
                      <option value="internal">Internal</option>
                      <option value="external">External</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Custom selection toggle */}
              <div className="flex items-center gap-3 mb-4">
                <button onClick={() => { setCustomMode(!customMode); setCustomSelection([]); }}
                  className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all border ${customMode ? "bg-[#1a1a2e] text-white border-[#1a1a2e]" : "bg-white text-[#555] border-[#eee] hover:border-[#b388c8]"}`}>
                  Custom Selection {customMode ? "ON" : "OFF"}
                </button>
                {customMode && customSelection.length > 0 && (
                  <button onClick={() => setCustomSelection([])} className="text-xs text-[#c0546a] hover:underline">Clear ({customSelection.length})</button>
                )}
              </div>

              {/* Custom selection — events grouped under fests */}
              {customMode && (() => {
                const allSchools = [...new Set((data?.analytics||[]).map((r:any) => r.school_name).filter(Boolean))] as string[];
                const allFestNames = [...new Set((data?.analytics||[]).map((r:any) => r.fest).filter(Boolean))] as string[];
                // Group events by fest
                const eventsByFest: Record<string, string[]> = {};
                (data?.analytics||[]).forEach((r:any) => {
                  if (r.fest && r.sub_event) {
                    if (!eventsByFest[r.fest]) eventsByFest[r.fest] = [];
                    if (!eventsByFest[r.fest].includes(r.sub_event)) eventsByFest[r.fest].push(r.sub_event);
                  }
                });

                return (
                  <div className="mb-4 p-4 bg-[#faf8ff] border border-[#ede8ff] rounded-xl space-y-4">
                    {/* Schools */}
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-[#9b6aaa] mb-2">Schools</p>
                      <div className="flex flex-wrap gap-1.5">
                        {allSchools.map(item => (
                          <button key={item} onClick={() => setCustomSelection(prev => prev.includes(item) ? prev.filter(x=>x!==item) : [...prev,item])}
                            className="px-3 py-1 rounded-full text-xs font-semibold transition-all border"
                            style={customSelection.includes(item) ? { background:"#1a1a2e", color:"white", borderColor:"#1a1a2e" } : { background:"#F0D9EF", color:"#9b6aaa", borderColor:"#F0D9EF" }}>
                            {item}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Fests + Events grouped */}
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-[#4a8fa0] mb-2">Fests & Events</p>
                      {allFestNames.map(fest => (
                        <div key={fest} className="mb-3">
                          <div className="flex items-center gap-2 mb-1.5">
                            <button onClick={() => setCustomSelection(prev => prev.includes(fest) ? prev.filter(x=>x!==fest) : [...prev,fest])}
                              className="px-3 py-1 rounded-full text-xs font-bold transition-all border"
                              style={customSelection.includes(fest) ? { background:"#1a1a2e", color:"white", borderColor:"#1a1a2e" } : { background:"#C4DFE5", color:"#4a8fa0", borderColor:"#C4DFE5" }}>
                              {fest}
                            </button>
                            <span className="text-xs text-[#bbb]">→ events:</span>
                          </div>
                          <div className="flex flex-wrap gap-1.5 pl-4">
                            {(eventsByFest[fest]||[]).map(ev => (
                              <button key={ev} onClick={() => setCustomSelection(prev => prev.includes(ev) ? prev.filter(x=>x!==ev) : [...prev,ev])}
                                className="px-2.5 py-0.5 rounded-full text-xs font-semibold transition-all border"
                                style={customSelection.includes(ev) ? { background:"#1a1a2e", color:"white", borderColor:"#1a1a2e" } : { background:"#FFE6BB", color:"#b07d2a", borderColor:"#FFE6BB" }}>
                                {ev}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Type */}
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-[#3a7a5a] mb-2">Participant Type</p>
                      <div className="flex gap-1.5">
                        {["internal","external"].map(item => (
                          <button key={item} onClick={() => setCustomSelection(prev => prev.includes(item) ? prev.filter(x=>x!==item) : [...prev,item])}
                            className="px-3 py-1 rounded-full text-xs font-semibold transition-all border"
                            style={customSelection.includes(item) ? { background:"#1a1a2e", color:"white", borderColor:"#1a1a2e" } : { background:"#CDE9DC", color:"#3a7a5a", borderColor:"#CDE9DC" }}>
                            {item}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Chart */}
              <div ref={chartRef} className="mt-2">
                {chartData.length === 0 ? (
                  <div className="text-center py-12 text-[#bbb] text-sm">No data for selected filters</div>
                ) : chartType === "pie" || chartType === "donut" ? (
                  <ResponsiveContainer width="100%" height={320}>
                    <PieChart>
                      <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%"
                        innerRadius={chartType==="donut" ? 70 : 0} outerRadius={120}
                        label={({name,percent}) => `${name} ${(percent*100).toFixed(0)}%`}>
                        {chartData.map((_,i) => <Cell key={i} fill={COLORS[i%COLORS.length]} />)}
                      </Pie>
                      <Tooltip formatter={(v:any) => [v, yAxis==="percent" ? "%" : yAxis==="ratio" ? "ratio" : "Registrations"]} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : chartType === "radar" ? (
                  <ResponsiveContainer width="100%" height={320}>
                    <RadarChart data={chartData}>
                      <PolarGrid stroke="#f0eef8" />
                      <PolarAngleAxis dataKey="name" tick={{ fontSize:10 }} />
                      <PolarRadiusAxis tick={{ fontSize:9 }} />
                      <Radar name="Value" dataKey="value" stroke="#b388c8" fill="#b388c8" fillOpacity={0.4} />
                      <Tooltip />
                      <Legend />
                    </RadarChart>
                  </ResponsiveContainer>
                ) : chartType === "heatmap" ? (
                  /* Custom heatmap using CSS grid */
                  <div className="overflow-x-auto">
                    <div className="min-w-[400px]">
                      <div className="text-xs text-[#aaa] mb-2 text-center">Intensity = Registration Count</div>
                      <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${Math.min(chartData.length, 5)}, 1fr)` }}>
                        {chartData.map((d,i) => {
                          const max = Math.max(...chartData.map(x=>x.value));
                          const intensity = max > 0 ? d.value/max : 0;
                          const bg = `rgba(179,136,200,${0.1 + intensity*0.9})`;
                          return (
                            <div key={i} className="rounded-xl p-3 text-center transition-all hover:scale-105"
                              style={{ background: bg, border: `1px solid rgba(179,136,200,${0.2+intensity*0.5})` }}>
                              <div className="text-xs font-semibold text-[#1a1a2e] truncate">{d.name}</div>
                              <div className="text-lg font-bold text-[#1a1a2e] mt-1">{d.value}</div>
                              <div className="text-xs text-[#888]">{Math.round(intensity*100)}%</div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ) : chartType === "hbar" ? (
                  <ResponsiveContainer width="100%" height={Math.max(300, chartData.length * 36)}>
                    <BarChart data={chartData} layout="vertical" margin={{ left: 120, right: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0eef8" horizontal={false} />
                      <XAxis type="number" tick={{ fontSize:10 }} />
                      <YAxis type="category" dataKey="name" tick={{ fontSize:10 }} width={115} />
                      <Tooltip formatter={(v:any) => [v, yAxis==="percent" ? "%" : yAxis==="ratio" ? "ratio" : "Registrations"]} />
                      <Bar dataKey="value" radius={[0,6,6,0]}>
                        {chartData.map((_,i) => <Cell key={i} fill={COLORS[i%COLORS.length]} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <ResponsiveContainer width="100%" height={320}>
                    <BarChart data={chartData} margin={{ bottom: 60 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0eef8" />
                      <XAxis dataKey="name" tick={{ fontSize:10 }} angle={-30} textAnchor="end" interval={0} />
                      <YAxis tick={{ fontSize:10 }} label={{ value: yAxis==="percent" ? "%" : yAxis==="ratio" ? "ratio" : "Count", angle:-90, position:"insideLeft", style:{fontSize:10} }} />
                      <Tooltip formatter={(v:any) => [v, yAxis==="percent" ? "%" : yAxis==="ratio" ? "ratio" : "Registrations"]} />
                      <Bar dataKey="value" radius={[6,6,0,0]}>
                        {chartData.map((_,i) => <Cell key={i} fill={COLORS[i%COLORS.length]} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>

              {/* Summary below chart */}
              {chartData.length > 0 && (
                <div className="mt-4 pt-4 border-t border-[#f0eef8] grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-xs text-[#aaa] uppercase tracking-wider">Total</div>
                    <div className="font-bold text-[#1a1a2e]">{chartData.reduce((s,r)=>s+r.value,0).toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-xs text-[#aaa] uppercase tracking-wider">Top</div>
                    <div className="font-bold text-[#9b6aaa] text-sm truncate">{chartData[0]?.name}</div>
                  </div>
                  <div>
                    <div className="text-xs text-[#aaa] uppercase tracking-wider">Categories</div>
                    <div className="font-bold text-[#1a1a2e]">{chartData.length}</div>
                  </div>
                </div>
              )}
            </div>

            {/* Fest Management */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#f0eef8] mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-[#1a1a2e] text-base">Fest Management</h2>
                <button onClick={() => { setShowAddFest(!showAddFest); setFestMsg(""); }}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:-translate-y-0.5"
                  style={{ background: "linear-gradient(135deg,#9b6aaa,#4a8fa0)" }}>
                  {showAddFest ? "Cancel" : "+ Add Fest"}
                </button>
              </div>
              {showAddFest && (
                <div className="bg-[#faf8ff] border border-[#ede8ff] rounded-xl p-4 mb-4">
                  <div className="flex gap-3 items-end">
                    <div className="flex-1">
                      <label className="text-xs text-[#888] font-semibold mb-1 block">Fest Name *</label>
                      <input value={newFest.name} onChange={e => setNewFest({ name: e.target.value })}
                        placeholder="e.g. TechFest 2026"
                        className="w-full bg-white border border-[#eee] rounded-lg px-3 py-2 text-sm text-[#1a1a2e] focus:outline-none focus:border-[#b388c8] transition-all" />
                    </div>
                    <button onClick={addFest}
                      className="px-5 py-2 rounded-xl text-sm font-semibold text-white transition-all"
                      style={{ background: "linear-gradient(135deg,#9b6aaa,#4a8fa0)" }}>
                      Add Fest
                    </button>
                  </div>
                  {festMsg && <p className={`text-xs mt-2 ${festMsg.includes("added") ? "text-green-600" : "text-red-500"}`}>{festMsg}</p>}
                </div>
              )}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#f0eef8]">
                      {["Fest Name","Events","Action"].map(h => (
                        <th key={h} className="text-left py-2 px-3 text-xs text-[#aaa] font-semibold uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {allFests.map(f => (
                      <tr key={f.main_event_id} className="border-b border-[#f9f9f9] hover:bg-[#faf8ff] transition-colors">
                        <td className="py-2 px-3 font-medium text-[#1a1a2e]">{f.name}</td>
                        <td className="py-2 px-3 text-xs text-[#888]">{allEvents.filter(e => e.fest_name === f.name).length} events</td>
                        <td className="py-2 px-3">
                          <button onClick={() => deleteFest(f.main_event_id, f.name)}
                            className="text-xs text-[#c0546a] bg-[#fff5f7] px-3 py-1 rounded-lg border border-[#f0c4cc] hover:bg-[#fce8ec] transition-all font-semibold">
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {allFests.length === 0 && <p className="text-center text-[#bbb] text-sm py-4">No fests found</p>}
              </div>
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
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
                <h2 className="font-semibold text-[#1a1a2e] text-base">Recent Registrations</h2>
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                  <input
                    value={regSearch}
                    onChange={e => setRegSearch(e.target.value)}
                    placeholder="Search name, roll, email, event..."
                    className="w-full sm:w-64 bg-[#fafafa] border border-[#eee] rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-[#b388c8] transition-all"
                  />
                  <select value={regSortBy} onChange={e => setRegSortBy(e.target.value)}
                    className="bg-[#fafafa] border border-[#eee] rounded-xl px-3 py-2 text-sm focus:outline-none">
                    <option value="date_desc">Newest Registration</option>
                    <option value="date_asc">Oldest Registration</option>
                    <option value="name_asc">Participant Name A-Z</option>
                    <option value="name_desc">Participant Name Z-A</option>
                    <option value="roll_asc">Roll Number A-Z</option>
                    <option value="type_internal">Internal First</option>
                    <option value="type_external">External First</option>
                    <option value="school_asc">School A-Z</option>
                  </select>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[600px]">
                  <thead>
                    <tr className="border-b border-[#f0eef8]">
                      {["Code","Date","Name","Roll","Email","Type","Event","Fest"].map(h => (
                        <th key={h} className="text-left py-2 px-3 text-xs text-[#aaa] font-semibold uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {(data?.registrations||[])
                      .filter((r:any) => !regSearch || [r.name, r.roll_number, r.email, r.event, r.fest, r.participant_type]
                        .some((v:any) => v && String(v).toLowerCase().includes(regSearch.toLowerCase())))
                      .sort((a:any, b:any) => {
                        if (regSortBy === "date_asc") return new Date(a.registration_date).getTime() - new Date(b.registration_date).getTime();
                        if (regSortBy === "name_asc") return (a.name||"").localeCompare(b.name||"");
                        if (regSortBy === "name_desc") return (b.name||"").localeCompare(a.name||"");
                        if (regSortBy === "roll_asc") return (a.roll_number||"").localeCompare(b.roll_number||"");
                        if (regSortBy === "type_internal") return a.participant_type === "internal" ? -1 : 1;
                        if (regSortBy === "type_external") return a.participant_type === "external" ? -1 : 1;
                        if (regSortBy === "school_asc") return (a.school_name||"").localeCompare(b.school_name||"");
                        return new Date(b.registration_date).getTime() - new Date(a.registration_date).getTime();
                      })
                      .map((r:any, i:number) => (
                      <tr key={i} onClick={() => r.participant_id && openParticipantProfile(r.participant_id)}
                        className="border-b border-[#f9f9f9] hover:bg-[#faf8ff] transition-colors cursor-pointer">
                        <td className="py-2 px-3 font-mono text-xs text-[#9b6aaa]">{r.registration_code}</td>
                        <td className="py-2 px-3 text-xs text-[#888]">{r.registration_date ? new Date(r.registration_date).toLocaleDateString() : "—"}</td>
                        <td className="py-2 px-3 font-medium text-[#1a1a2e] hover:text-[#9b6aaa]">{r.name}</td>
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
              <p className="text-xs text-[#bbb] mt-2">Click any row to view participant profile</p>
            </div>

            {/* Participant Profile Panel */}
            {selectedParticipant && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#f0eef8] mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold text-[#1a1a2e] text-base">Participant Profile</h2>
                  <button onClick={() => { setSelectedParticipant(null); setParticipantProfile(null); }}
                    className="text-[#aaa] hover:text-[#555] text-xl">×</button>
                </div>
                {profileLoading ? (
                  <div className="text-center py-6 text-[#aaa]">Loading...</div>
                ) : participantProfile ? (
                  <div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                      {[
                        { label:"Name", val: participantProfile.profile?.name },
                        { label:"Roll Number", val: participantProfile.profile?.roll_number || "—" },
                        { label:"Email", val: participantProfile.profile?.email || "—" },
                        { label:"School", val: participantProfile.profile?.school_display || "—" },
                        { label:"Type", val: participantProfile.profile?.participant_type || "—" },
                        { label:"Role", val: participantProfile.profile?.role || "—" },
                      ].map(item => (
                        <div key={item.label} className="bg-[#faf8ff] rounded-xl p-3">
                          <div className="text-xs text-[#aaa] uppercase tracking-wider mb-1">{item.label}</div>
                          <div className="font-semibold text-[#1a1a2e] text-sm truncate">{item.val}</div>
                        </div>
                      ))}
                    </div>
                    <h3 className="font-semibold text-[#1a1a2e] text-sm mb-3">Registered Events ({participantProfile.registrations?.length || 0})</h3>
                    <div className="space-y-2">
                      {(participantProfile.registrations || []).map((r:any) => (
                        <div key={r.registration_id} className="flex items-center justify-between p-3 bg-[#faf8ff] rounded-xl border border-[#f0eef8]">
                          <div>
                            <div className="font-semibold text-[#1a1a2e] text-sm">{r.event}</div>
                            <div className="text-xs text-[#aaa]">{r.fest} · <span className="font-mono text-[#9b6aaa]">{r.registration_code}</span></div>
                          </div>
                          <button onClick={() => removeRegistration(selectedParticipant, r.registration_id)}
                            className="text-xs text-[#c0546a] bg-[#fff5f7] px-3 py-1 rounded-lg border border-[#f0c4cc] hover:bg-[#fce8ec] transition-all font-semibold">
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            )}

            {/* Announcements Management */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#f0eef8] mb-6">
              <h2 className="font-semibold text-[#1a1a2e] text-base mb-4">Announcements</h2>
              <div className="bg-[#faf8ff] border border-[#ede8ff] rounded-xl p-4 mb-4">
                <h3 className="font-semibold text-[#1a1a2e] text-sm mb-3">Post New Announcement</h3>
                <div className="space-y-3">
                  <input value={newAnnouncement.title} onChange={e => setNewAnnouncement(p => ({...p, title:e.target.value}))}
                    placeholder="Title"
                    className="w-full bg-white border border-[#eee] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#b388c8]" />
                  <textarea value={newAnnouncement.message} onChange={e => setNewAnnouncement(p => ({...p, message:e.target.value}))}
                    placeholder="Message"
                    rows={3}
                    className="w-full bg-white border border-[#eee] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#b388c8] resize-none" />
                  <div className="flex gap-3">
                    <select value={newAnnouncement.festName} onChange={e => setNewAnnouncement(p => ({...p, festName:e.target.value}))}
                      className="flex-1 bg-white border border-[#eee] rounded-lg px-3 py-2 text-sm focus:outline-none">
                      <option value="">All Fests (Global)</option>
                      {allFests.map(f => <option key={f.main_event_id} value={f.name}>{f.name}</option>)}
                    </select>
                    <button onClick={postAnnouncement}
                      className="px-5 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:-translate-y-0.5"
                      style={{ background:"linear-gradient(135deg,#9b6aaa,#4a8fa0)" }}>
                      Post
                    </button>
                  </div>
                  {annMsg && <p className={`text-xs ${annMsg.includes("posted") ? "text-green-600" : "text-red-500"}`}>{annMsg}</p>}
                </div>
              </div>
              <div className="space-y-2">
                {announcements.length === 0 ? (
                  <p className="text-center text-[#bbb] text-sm py-4">No active announcements</p>
                ) : announcements.map(a => (
                  <div key={a.id} className="flex items-start justify-between p-3 bg-[#faf8ff] rounded-xl border border-[#f0eef8]">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-[#1a1a2e] text-sm">{a.title}</span>
                        {a.fest_name && <span className="text-xs bg-[#F0D9EF] text-[#9b6aaa] px-2 py-0.5 rounded-full font-semibold">{a.fest_name}</span>}
                      </div>
                      <p className="text-xs text-[#666]">{a.message}</p>
                      <p className="text-xs text-[#bbb] mt-1">{new Date(a.created_at).toLocaleDateString()}</p>
                    </div>
                    <button onClick={() => deleteAnnouncement(a.id)}
                      className="ml-3 text-xs text-[#c0546a] bg-[#fff5f7] px-3 py-1 rounded-lg border border-[#f0c4cc] hover:bg-[#fce8ec] transition-all font-semibold">
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
