import { CatalogueSetup } from "@/components/catalogue-setup";

export default function SetupPage() {
  return <main className="narrow">
    <p className="eyebrow">First-time setup</p>
    <h1>Start with your provider catalogue.</h1>
    <p className="lede" style={{ marginBottom: 30 }}>AMRIT compares village needs with this list. Nothing leaves this computer.</p>
    <CatalogueSetup />
  </main>;
}
