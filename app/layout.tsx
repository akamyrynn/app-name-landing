import type { Metadata } from "next";
import "./orbit-matter-next/globals.css";

export const metadata: Metadata = {
  title: "App Name - Video Conferencing & Live Streaming Platform",
  description: "Seamless video conferencing and live streaming for teams and creators. Enterprise-grade corporate communication and broadcasting platform with HD quality and 24/7 support.",
  keywords: "video conferencing, live streaming, corporate communication, enterprise video, broadcasting platform, team collaboration, HD streaming",
  openGraph: {
    title: "App Name - Connect Everywhere",
    description: "Transform your communication with crystal clear video conferencing and live streaming",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
