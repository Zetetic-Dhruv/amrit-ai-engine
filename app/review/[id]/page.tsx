import { AppShell } from "@/components/app-shell";
import { ReviewFlow } from "@/components/review-flow";

export default async function ReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <AppShell><ReviewFlow batchId={id} /></AppShell>;
}
