import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { batchDetails } from "@/lib/pipeline";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const result = batchDetails(id);
  if (!result) return NextResponse.json({ error: "Survey not found." }, { status: 404 });
  const rows = result.problems.flatMap((problem) => problem.matches
    .filter((match) => match.decision === "approved")
    .map((match) => ({
      Village: problem.village,
      Problem: problem.statement,
      Track: problem.track || "Classification unavailable",
      "Provider Name": match.provider.name,
      "Match Explanation": match.explanation,
      "Contact Name": match.provider.contactName || "",
      "Contact Email": match.provider.contactEmail || "",
      "Contact Phone": match.provider.contactPhone || "",
    })));
  const csv = XLSX.utils.sheet_to_csv(XLSX.utils.json_to_sheet(rows));
  return new NextResponse(csv, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="amrit-approved-matches-${id.slice(0, 8)}.csv"`,
    },
  });
}
