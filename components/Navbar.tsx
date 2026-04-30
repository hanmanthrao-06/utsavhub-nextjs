"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import AnnouncementBell from "./AnnouncementBell";

const NAV = [
  { href: "/events",        label: "Events" },
  { href: "/registrations", label: "My Registrations" },
  { href: "/certificate",   label: "Certificate" },
  { href: "/calendar",      label: "Calendar" },
  { href: "/admin",         label: "Admin" },
];

export default function Navbar({ userName }: { userName?: string }) {
  const pathname = usePathname();
  const router   = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  function signOut() {
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("adminAuth");
    router.push("/");
  }

  return (
    <nav className="sticky top-0 z-50 bg-white/92 backdrop-blur-2xl border-b border-[#f0eef8] shadow-sm">
      <div className="flex items-center justify-between px-4 md:px-10 py-3.5">
        <Link href={userName ? "/events" : "/"} className="font-playfair text-xl font-bold text-[#1a1a2e]">UtsavHub</Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-2">
          {userName && NAV.map(n => (
            <Link key={n.href} href={n.href}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
                pathname === n.href ? "bg-[#1a1a2e] text-white" : "text-[#555] hover:bg-[#f5f3ff] hover:text-[#9b6aaa]"
              }`}>{n.label}</Link>
          ))}
          {!userName && (
            <Link href="/admin" className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${pathname === "/admin" ? "bg-[#1a1a2e] text-white" : "text-[#555] hover:bg-[#f5f3ff] hover:text-[#9b6aaa]"}`}>Admin</Link>
          )}
          <div className="ml-3 flex items-center gap-3">
            {userName && <AnnouncementBell />}
            {userName && <span className="text-xs text-[#888] bg-[#f5f3ff] px-4 py-1.5 rounded-full border border-[#ede8ff]">{userName}</span>}
            <button onClick={signOut} className="text-xs text-[#c0546a] bg-[#fff5f7] px-4 py-1.5 rounded-full border border-[#f0c4cc] hover:bg-[#fce8ec] transition-all font-semibold">
              {userName ? "Sign Out" : "← Home"}
            </button>
          </div>
        </div>

        {/* Mobile hamburger */}
        <button className="md:hidden p-2 rounded-lg hover:bg-[#f5f3ff] transition-all" onClick={() => setMenuOpen(!menuOpen)}>
          <div className="w-5 h-0.5 bg-[#1a1a2e] mb-1 transition-all"></div>
          <div className="w-5 h-0.5 bg-[#1a1a2e] mb-1 transition-all"></div>
          <div className="w-5 h-0.5 bg-[#1a1a2e] transition-all"></div>
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-[#f0eef8] bg-white px-4 py-3 flex flex-col gap-2">
          {userName && NAV.map(n => (
            <Link key={n.href} href={n.href} onClick={() => setMenuOpen(false)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                pathname === n.href ? "bg-[#1a1a2e] text-white" : "text-[#555] hover:bg-[#f5f3ff]"
              }`}>{n.label}</Link>
          ))}
          {!userName && (
            <Link href="/admin" onClick={() => setMenuOpen(false)} className="px-4 py-2 rounded-xl text-sm font-semibold text-[#555] hover:bg-[#f5f3ff]">Admin</Link>
          )}
          {userName && <div className="text-xs text-[#888] px-4 py-1">{userName}</div>}
          <button onClick={signOut} className="text-left px-4 py-2 rounded-xl text-sm font-semibold text-[#c0546a] bg-[#fff5f7] border border-[#f0c4cc]">
            {userName ? "Sign Out" : "← Home"}
          </button>
        </div>
      )}
    </nav>
  );
}
