import { AppShell } from "@/components/app-shell";
import { SurveyResults } from "@/components/survey-results";

export default async function SurveyResultsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <AppShell><main className="main"><SurveyResults batchId={id} /></main></AppShell>;
}
