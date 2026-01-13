import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Orbit Matter | Next.js Migration",
  description: "Interplanetary Observatory - Operating beyond planetary boundaries",
  authors: [{ name: "Codegrid" }],
};

export default function OrbitMatterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
