import { desc, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { catalogues } from "@/lib/schema";

export const dynamic = "force-dynamic";

export default function Home() {
  const active = db.select().from(catalogues).where(eq(catalogues.isActive, true)).orderBy(desc(catalogues.createdAt)).get();
  redirect(active ? "/surveys" : "/setup");
}
