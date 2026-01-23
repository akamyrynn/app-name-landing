import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "3д конфигуратор ",
  description: "в разработке",
  authors: [{ name: "ryyn" }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
