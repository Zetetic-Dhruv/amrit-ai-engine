import { desc, eq } from "drizzle-orm";
import { AppShell } from "@/components/app-shell";
import { CatalogueSetup } from "@/components/catalogue-setup";
import { ModelStatusCard } from "@/components/model-status";
import { StatusPill } from "@/components/status-pill";
import { db } from "@/lib/db";
import { catalogues } from "@/lib/schema";

export const dynamic = "force-dynamic";

export default function SettingsPage() {
  const active = db.select().from(catalogues).where(eq(catalogues.isActive, true)).orderBy(desc(catalogues.createdAt)).get();
  return <AppShell><main className="main"><div className="page-head"><div><p className="eyebrow">Local application</p><h1>Settings</h1><p className="lede">The few things AMRIT needs to run on this computer.</p></div></div>
    <div className="stack"><ModelStatusCard />
      {active && <div className="card card-pad"><div className="section-head"><div><h3>Current provider catalogue</h3><p className="small muted">{active.filename} · {active.providerCount} providers</p></div><StatusPill status={active.status} /></div></div>}
      <div><div className="section-head"><h2>{active ? "Replace catalogue" : "Load catalogue"}</h2></div><CatalogueSetup compact /></div>
      <div className="card card-pad"><h3>Resetting local data</h3><p className="small muted" style={{ marginBottom: 0 }}>Stop the application and remove the <code>.data</code> folder. Start AMRIT again to return to first-time setup.</p></div>
    </div>
  </main></AppShell>;
}
