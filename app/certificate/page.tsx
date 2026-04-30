"use client";
import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function CertificateContent() {
  const router = useRouter();
  const certRef = useRef<HTMLDivElement>(null);
  const [user, setUser] = useState<{participant_id:number;name:string}|null>(null);
  const [regs, setRegs] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const [searchParams, setSearchParams] = useState<URLSearchParams | null>(null);

  useEffect(() => {
    setIsClient(true);
    if (typeof window !== 'undefined') {
      setSearchParams(new URLSearchParams(window.location.search));
    }
  }, []);

  useEffect(() => {
    if (!isClient || !searchParams) return;
    const u = sessionStorage.getItem("user");
    if (!u) { router.push("/"); return; }
    const parsed = JSON.parse(u);
    setUser(parsed);
    fetch(`/api/registration?userId=${parsed.participant_id}`)
      .then(r => r.json())
      .then(d => {
        setRegs(d.registrations || []);
        setLoading(false);
        // Auto-select if regCode in URL
        const code = searchParams.get("code");
        if (code && d.registrations) {
          const found = d.registrations.find((r:any) => r.registration_code === code);
          if (found) setSelected(found);
        }
      });
  }, [router, searchParams, isClient]);

  function printCert() {
    const el = certRef.current;
    if (!el) return;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`
      <html><head><title>Certificate</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700;800&family=Inter:wght@400;500;600&display=swap');
        body { margin:0; padding:0; font-family:'Inter',sans-serif; }
        .cert { width:800px; height:560px; margin:0 auto; }
      </style>
      </head><body>${el.outerHTML}</body></html>
    `);
    w.document.close();
    w.focus();
    setTimeout(() => { w.print(); w.close(); }, 500);
  }

  if (!isClient || !user) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background:"linear-gradient(160deg,#faf8ff 0%,#f5f0fa 30%,#eef6f8 60%,#f0f8f4 100%)" }}>
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#b388c8] mx-auto mb-4"></div>
        <p className="text-[#aaa]">Loading...</p>
      </div>
    </div>
  );

  const today = new Date().toLocaleDateString("en-IN", { day:"numeric", month:"long", year:"numeric" });

  return (
    <div className="min-h-screen" style={{ background:"linear-gradient(160deg,#faf8ff 0%,#f5f0fa 30%,#eef6f8 60%,#f0f8f4 100%)" }}>
      <Navbar userName={user.name} />
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-8">
        <div className="text-center mb-8">
          <h1 className="font-playfair text-3xl font-bold text-[#1a1a2e] mb-2">Registration Certificate</h1>
          <p className="text-[#aaa] text-sm">Select a registration to generate your certificate</p>
        </div>

        {/* Registration selector */}
        {loading ? (
          <div className="text-center py-8 text-[#aaa]">Loading...</div>
        ) : regs.length === 0 ? (
          <div className="text-center py-8 text-[#aaa]">No registrations found</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
            {regs.map(r => (
              <button key={r.registration_id} onClick={() => setSelected(r)}
                className={`text-left p-4 rounded-2xl border transition-all ${
                  selected?.registration_id === r.registration_id
                    ? "border-[#b388c8] bg-[#faf5ff] shadow-md"
                    : "border-[#f0eef8] bg-white hover:border-[#b388c8] hover:shadow-sm"
                }`}>
                <div className="font-semibold text-[#1a1a2e] text-sm">{r.name}</div>
                <div className="text-xs text-[#aaa] mt-0.5">{r.fest_name}</div>
                <div className="font-mono text-xs text-[#9b6aaa] mt-1 tracking-widest">{r.registration_code}</div>
              </button>
            ))}
          </div>
        )}

        {/* Certificate preview */}
        {selected && (
          <div>
            <div ref={certRef} className="cert bg-white rounded-3xl overflow-hidden shadow-2xl"
              style={{
                width: "100%",
                maxWidth: "800px",
                margin: "0 auto",
                aspectRatio: "800/560",
                position: "relative",
                fontFamily: "'Inter', sans-serif",
              }}>
              {/* Background decoration */}
              <div style={{ position:"absolute", inset:0, background:"linear-gradient(135deg,#fdf5ff 0%,#f0f8fb 50%,#f0fbf6 100%)" }} />
              <div style={{ position:"absolute", top:0, left:0, right:0, height:"8px", background:"linear-gradient(90deg,#b388c8,#7bbfcc,#b388c8)" }} />
              <div style={{ position:"absolute", bottom:0, left:0, right:0, height:"8px", background:"linear-gradient(90deg,#b388c8,#7bbfcc,#b388c8)" }} />
              <div style={{ position:"absolute", top:"8px", left:0, bottom:"8px", width:"8px", background:"linear-gradient(180deg,#b388c8,#7bbfcc,#b388c8)" }} />
              <div style={{ position:"absolute", top:"8px", right:0, bottom:"8px", width:"8px", background:"linear-gradient(180deg,#b388c8,#7bbfcc,#b388c8)" }} />

              {/* Content */}
              <div style={{ position:"relative", zIndex:1, padding:"40px 60px", textAlign:"center", height:"100%", display:"flex", flexDirection:"column", justifyContent:"space-between" }}>
                <div>
                  <div style={{ fontFamily:"'Playfair Display',serif", fontSize:"13px", letterSpacing:"4px", textTransform:"uppercase", color:"#9b6aaa", marginBottom:"8px" }}>
                    UtsavHub · Certificate of Registration
                  </div>
                  <div style={{ fontFamily:"'Playfair Display',serif", fontSize:"13px", color:"#aaa", marginBottom:"24px" }}>
                    This is to certify that
                  </div>
                  <div style={{ fontFamily:"'Playfair Display',serif", fontSize:"36px", fontWeight:"800", color:"#1a1a2e", lineHeight:1.1, marginBottom:"8px" }}>
                    {user.name}
                  </div>
                  <div style={{ width:"120px", height:"2px", background:"linear-gradient(90deg,#b388c8,#7bbfcc)", margin:"0 auto 20px" }} />
                  <div style={{ fontSize:"14px", color:"#555", marginBottom:"6px" }}>
                    has successfully registered for
                  </div>
                  <div style={{ fontFamily:"'Playfair Display',serif", fontSize:"24px", fontWeight:"700", color:"#1a1a2e", marginBottom:"6px" }}>
                    {selected.name}
                  </div>
                  <div style={{ fontSize:"13px", color:"#9b6aaa", fontWeight:"600", marginBottom:"20px" }}>
                    {selected.fest_name}
                  </div>
                  <div style={{ display:"flex", justifyContent:"center", gap:"32px", fontSize:"12px", color:"#888" }}>
                    {selected.venue && <span>Venue: {selected.venue}</span>}
                    {selected.day && <span>Day: {selected.day}</span>}
                    {selected.time && <span>Time: {selected.time}</span>}
                  </div>
                </div>

                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end" }}>
                  <div style={{ textAlign:"left" }}>
                    <div style={{ fontSize:"10px", color:"#bbb", textTransform:"uppercase", letterSpacing:"1px" }}>Registration Code</div>
                    <div style={{ fontFamily:"monospace", fontSize:"16px", fontWeight:"700", color:"#b388c8", letterSpacing:"4px" }}>{selected.registration_code}</div>
                  </div>
                  <div style={{ textAlign:"center" }}>
                    <div style={{ fontFamily:"'Playfair Display',serif", fontSize:"20px", fontWeight:"800", color:"#1a1a2e" }}>UtsavHub</div>
                    <div style={{ fontSize:"10px", color:"#aaa" }}>College Fest Portal</div>
                  </div>
                  <div style={{ textAlign:"right" }}>
                    <div style={{ fontSize:"10px", color:"#bbb", textTransform:"uppercase", letterSpacing:"1px" }}>Date</div>
                    <div style={{ fontSize:"12px", color:"#555", fontWeight:"600" }}>{today}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-center mt-6">
              <button onClick={printCert}
                className="px-8 py-3 rounded-full text-sm font-bold text-white transition-all hover:-translate-y-0.5 hover:shadow-lg"
                style={{ background:"linear-gradient(135deg,#b388c8,#7bbfcc)", boxShadow:"0 4px 20px rgba(179,136,200,0.4)" }}>
                Download / Print Certificate
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Certificate() {
  return <CertificateContent />;
}
