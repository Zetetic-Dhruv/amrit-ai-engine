import Link from "next/link";
import { Activity, Settings } from "lucide-react";

export function AppShell({ children }: { children: React.ReactNode }) {
  return <div className="app-shell">
    <header className="topbar">
      <Link href="/surveys" className="brand">
        <span className="brand-mark">A</span>
        <span>AMRIT</span>
      </Link>
      <nav className="nav" aria-label="Main navigation">
        <Link href="/surveys">Surveys</Link>
        <Link href="/activity"><Activity size={15} /> <span className="sr-only">Activity</span></Link>
        <Link href="/settings"><Settings size={15} /> <span className="sr-only">Settings</span></Link>
      </nav>
    </header>
    {children}
  </div>;
}
