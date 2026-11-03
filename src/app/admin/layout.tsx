import type { Metadata } from "next";
import "./admin.css";

export const metadata: Metadata = {
  title: "Team Panel · LA Europa Education",
  robots: { index: false, follow: false },
};

export default function AdminRoot({ children }: { children: React.ReactNode }) {
  return children;
}
