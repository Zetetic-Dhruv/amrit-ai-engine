import { AppShell } from "@/components/app-shell";
import { SurveyHome } from "@/components/survey-home";
import { recentBatches } from "@/lib/pipeline";

export const dynamic = "force-dynamic";

export default function SurveysPage() {
  return <AppShell><main className="main">
    <div className="page-head"><div><p className="eyebrow">Village surveys</p><h1>From survey to shortlist.</h1><p className="lede">Upload the workbook. AMRIT will surface the needs and the providers worth reviewing.</p></div></div>
    <SurveyHome batches={recentBatches()} />
  </main></AppShell>;
}
