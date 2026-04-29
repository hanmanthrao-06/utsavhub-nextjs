"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const NAV = [
  { href: "/events",        label: "Events" },
  { href: "/registrations", label: "My Registrations" },
  { href: "/calendar",      label: "Calendar" },
  { href: "/admin",         label: "Admin" },
];

export default function Navbar({ userName }: { userName?: string }) {
  const pathname = usePathname();
  const router   = useRouter();

  function signOut() {
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("adminAuth");
    router.push("/");
  }

  return (
    <nav className="sticky top-0 z-50 flex items-center justify-between px-10 py-3.5 bg-white/92 backdrop-blur-2xl border-b border-[#f0eef8] shadow-sm">
      <Link href={userName ? "/events" : "/"} className="font-playfair text-xl font-bold text-[#1a1a2e]">UtsavHub</Link>
      <div className="flex items-center gap-2">
        {userName && NAV.map(n => (
          <Link key={n.href} href={n.href}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
              pathname === n.href
                ? "bg-[#1a1a2e] text-white"
                : "text-[#555] hover:bg-[#f5f3ff] hover:text-[#9b6aaa]"
            }`}>
            {n.label}
          </Link>
        ))}
        {!userName && (
          <Link href="/admin" className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${pathname === "/admin" ? "bg-[#1a1a2e] text-white" : "text-[#555] hover:bg-[#f5f3ff] hover:text-[#9b6aaa]"}`}>Admin</Link>
        )}
        <div className="ml-3 flex items-center gap-3">
          {userName && <span className="text-xs text-[#888] bg-[#f5f3ff] px-4 py-1.5 rounded-full border border-[#ede8ff]">{userName}</span>}
          <button onClick={signOut}
            className="text-xs text-[#c0546a] bg-[#fff5f7] px-4 py-1.5 rounded-full border border-[#f0c4cc] hover:bg-[#fce8ec] transition-all font-semibold">
            {userName ? "Sign Out" : "← Home"}
          </button>
        </div>
      </div>
    </nav>
  );
}
