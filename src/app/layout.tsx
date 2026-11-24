import type { Metadata } from "next";
import { Figtree } from "next/font/google";
import "./globals.css";
import { AppShell } from "@/components/layout/AppShell";
import { DiagnosticProvider } from "@/features/diagnostic/DiagnosticProvider";

const figtree = Figtree({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-figtree",
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: "AEGC Student Mobility", template: "%s · AEGC Student Mobility" },
  description:
    "Compare sourced UK study options against your Nigerian qualifications, budget and preferences. Free discovery, accountable human support.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GB" className={figtree.variable}>
      <body>
        <DiagnosticProvider>
          <AppShell>{children}</AppShell>
        </DiagnosticProvider>
      </body>
    </html>
  );
}