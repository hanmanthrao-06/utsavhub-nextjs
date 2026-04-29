"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const SCHOOLS = [
  "School of Arts, Humanities and Social Sciences",
  "School of Management Sciences",
  "School of Mathematics & Natural Sciences",
  "School of Law, Governance & Public Policy",
  "School of Biosciences",
  "School of Engineering",
];

export default function LoginPage() {
  const router = useRouter();
  const [isInternal, setIsInternal] = useState(true);
  const [loginInput, setLoginInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showRegister, setShowRegister] = useState(false);
  const [stats, setStats] = useState({ fests: 0, events: 0, regs: 0 });

  // Registration form
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regRoll, setRegRoll] = useState("");
  const [regSchool, setRegSchool] = useState(SCHOOLS[0]);
  const [otp, setOtp] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [regLoading, setRegLoading] = useState(false);

  useEffect(() => {
    // Check if already logged in
    const user = sessionStorage.getItem("user");
    if (user) router.push("/events");

    // Load stats
    fetch("/api/stats").then(r => r.json()).then(setStats);
  }, [router]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!loginInput.trim()) { setError("Please enter your details."); return; }
    setLoading(true); setError("");
    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ loginInput: loginInput.trim(), isInternal }),
    });
    const data = await res.json();
    setLoading(false);
    if (data.user) {
      sessionStorage.setItem("user", JSON.stringify(data.user));
      router.push("/events");
    } else {
      setError("No account found.");
      setShowRegister(true);
    }
  }

  function sendOtp() {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(code);
    setOtpSent(true);
    alert(`OTP (demo): ${code}`);
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    if (otp !== generatedOtp) { setError("Invalid OTP."); return; }
    setRegLoading(true);
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: regName, email: regEmail,
        rollNumber: isInternal ? regRoll : null,
        school: isInternal ? regSchool : "External",
        isInternal,
      }),
    });
    const data = await res.json();
    setRegLoading(false);
    if (data.user) {
      sessionStorage.setItem("user", JSON.stringify(data.user));
      router.push("/events");
    } else {
      setError(data.error || "Registration failed.");
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden" style={{
      backgroundImage: "url('/college.jpg')",
      backgroundSize: "cover",
      backgroundPosition: "center",
    }}>
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/55" />

      {/* Floating blobs */}
      <div className="absolute top-[-80px] right-[-80px] w-[400px] h-[400px] rounded-full bg-[#F0D9EF]/30 blur-[80px] animate-float" />
      <div className="absolute bottom-[-60px] left-[-60px] w-[350px] h-[350px] rounded-full bg-[#C4DFE5]/30 blur-[80px] animate-float" style={{ animationDelay: "3s" }} />
      <div className="absolute top-1/3 left-1/4 w-[200px] h-[200px] bg-[#FFE6BB]/20 blur-[60px] animate-morph" style={{ animationDelay: "1.5s" }} />
      {/* Spinning ring */}
      <div className="absolute top-20 left-20 w-32 h-32 rounded-full border border-white/10 animate-spin-slow" />
      <div className="absolute bottom-32 right-32 w-20 h-20 rounded-full border border-white/10 animate-spin-slow" style={{ animationDirection:"reverse", animationDuration:"6s" }} />

      {/* Top bar */}
      <nav className="relative z-10 flex items-center justify-between px-12 py-4 bg-white/10 backdrop-blur-xl border-b border-white/15">
        <span className="font-playfair text-2xl font-bold text-white tracking-tight">UtsavHub</span>
        <div className="flex items-center gap-6">
          <div className="flex gap-8 text-sm font-medium text-white/60">
            <span>Events</span><span>Fests</span><span>About</span>
          </div>
          <a href="/admin"
            className="text-sm font-semibold text-white bg-white/15 border border-white/25 px-4 py-1.5 rounded-full hover:bg-white/25 transition-all">
            Admin
          </a>
        </div>
      </nav>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-64px)] px-4 py-8">
        {/* Hero */}
        <div className="text-center mb-8 animate-fade-in-down">
          <div className="inline-block border border-white/25 text-white/60 text-xs font-semibold tracking-[3px] uppercase px-5 py-1.5 rounded-full mb-4">
            College Fest Portal
          </div>
          <h1 className="font-playfair text-6xl font-black text-white leading-tight tracking-tight mb-3 text-shimmer" style={{ WebkitTextFillColor: "white" }}>
            UtsavHub
          </h1>
          <p className="text-white/55 text-base max-w-md mx-auto">
            Discover, register and celebrate every fest at your campus
          </p>
        </div>

        {/* Stats */}
        <div className="flex bg-white/12 backdrop-blur-xl border border-white/18 rounded-full overflow-hidden mb-8 shadow-xl animate-bounce-in animate-delay-400">
          {[
            { num: stats.fests, label: "FESTS" },
            { num: stats.events, label: "EVENTS" },
            { num: stats.regs.toLocaleString(), label: "REGISTERED" },
          ].map((s, i) => (
            <div key={i} className={`px-8 py-3 text-center ${i < 2 ? "border-r border-white/12" : ""}`}>
              <div className="font-playfair text-2xl font-bold text-white">{s.num}</div>
              <div className="text-[10px] text-white/45 tracking-[2px] mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Login Card */}
        {!showRegister ? (
          <div className="w-full max-w-md bg-white/13 backdrop-blur-3xl border border-white/22 rounded-2xl p-8 shadow-2xl animate-slide-up animate-delay-200">
            <h2 className="font-playfair text-2xl font-bold text-white mb-1">Sign in here</h2>
            <p className="text-white/45 text-sm mb-6">Enter your roll number or email to continue</p>

            {/* Toggle */}
            <div className="flex bg-white/10 rounded-xl p-1 mb-5">
              {["Internal Student", "External Participant"].map((t, i) => (
                <button key={t} onClick={() => setIsInternal(i === 0)}
                  className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                    isInternal === (i === 0)
                      ? "bg-white text-[#1a1a2e] shadow"
                      : "text-white/80 hover:text-white"
                  }`}>{t}</button>
              ))}
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-white/70 text-xs font-semibold mb-1.5 uppercase tracking-wider">
                  {isInternal ? "Roll Number" : "Email Address"}
                </label>
                <input
                  value={loginInput} onChange={e => setLoginInput(e.target.value)}
                  placeholder={isInternal ? "e.g. 24UG00001" : "e.g. you@email.com"}
                  className="w-full bg-white/15 text-white placeholder-white/40 border border-white/25 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-white/60 focus:bg-white/20 transition-all"
                  style={{ color: "white" }}
                />
              </div>
              {error && <p className="text-red-300 text-xs">{error}</p>}
              <button type="submit" disabled={loading}
                className="w-full bg-white/95 text-[#1a1a2e] font-bold py-3 rounded-full text-sm hover:bg-white transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60">
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </form>

            <div className="flex items-center gap-3 my-4">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-white/30 text-xs">or</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>

            <button onClick={() => { setShowRegister(true); setError(""); }}
              className="w-full border border-white/20 text-white/70 font-semibold py-3 rounded-full text-sm hover:bg-white/10 transition-all">
              Create New Account
            </button>
          </div>
        ) : (
          /* Register Card */
          <div className="w-full max-w-md bg-white/13 backdrop-blur-3xl border border-white/22 rounded-2xl p-8 shadow-2xl animate-fade-in-up">
            <button onClick={() => { setShowRegister(false); setError(""); }}
              className="text-white/50 text-sm mb-4 hover:text-white transition-colors">
              ← Back to Sign In
            </button>
            <h2 className="font-playfair text-2xl font-bold text-white mb-1">Create Account</h2>
            <p className="text-white/45 text-sm mb-6">Fill in your details to register</p>

            <div className="flex bg-white/10 rounded-xl p-1 mb-5">
              {["Internal Student", "External Participant"].map((t, i) => (
                <button key={t} onClick={() => setIsInternal(i === 0)}
                  className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                    isInternal === (i === 0) ? "bg-white text-[#1a1a2e] shadow" : "text-white/80 hover:text-white"
                  }`}>{t}</button>
              ))}
            </div>

            <form onSubmit={handleRegister} className="space-y-3">
              <input value={regName} onChange={e => setRegName(e.target.value)} placeholder="Full Name"
                className="w-full bg-white/15 text-white placeholder-white/40 border border-white/25 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-white/60 transition-all" style={{ color:"white" }} />
              <input value={regEmail} onChange={e => setRegEmail(e.target.value)} placeholder="Email" type="email"
                className="w-full bg-white/15 text-white placeholder-white/40 border border-white/25 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-white/60 transition-all" style={{ color:"white" }} />
              {isInternal && (
                <>
                  <input value={regRoll} onChange={e => setRegRoll(e.target.value)} placeholder="Roll Number e.g. 24UG00001"
                    className="w-full bg-white/15 text-white placeholder-white/40 border border-white/25 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-white/60 transition-all" style={{ color:"white" }} />
                  <select value={regSchool} onChange={e => setRegSchool(e.target.value)}
                    className="w-full bg-white/15 text-white border border-white/25 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-white/60 transition-all" style={{ color:"white" }}>
                    {SCHOOLS.map(s => <option key={s} value={s} className="text-black bg-white">{s}</option>)}
                  </select>
                </>
              )}

              {!otpSent ? (
                <button type="button" onClick={sendOtp}
                  className="w-full bg-white/20 text-white font-semibold py-3 rounded-full text-sm hover:bg-white/30 transition-all">
                  Send OTP
                </button>
              ) : (
                <>
                  <input value={otp} onChange={e => setOtp(e.target.value)} placeholder="Enter 6-digit OTP"
                    className="w-full bg-white/15 text-white placeholder-white/40 border border-white/25 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-white/60 transition-all" style={{ color:"white" }} />
                  {error && <p className="text-red-300 text-xs">{error}</p>}
                  <button type="submit" disabled={regLoading}
                    className="w-full bg-white/95 text-[#1a1a2e] font-bold py-3 rounded-full text-sm hover:bg-white transition-all shadow-lg disabled:opacity-60">
                    {regLoading ? "Creating..." : "Create Account"}
                  </button>
                </>
              )}
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
