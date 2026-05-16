import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ecosenda - Brigadas Comunitarias",
  description: "Plataforma de gestión de brigadas comunitarias de limpieza en Guadalajara",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
