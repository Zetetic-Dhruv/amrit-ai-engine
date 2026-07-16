import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AMRIT",
  description: "Clear village needs. Relevant rural technology providers.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
