import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "snoservice | Desarrollo de Software & Automatización",
  description: "Desarrollo de software a medida, páginas web, sistemas de gestión y automatización.",
  icons: {
    icon: "/logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark scroll-smooth">
      <body className="bg-[#09090B] text-zinc-100 antialiased font-sans">
        {children}
      </body>
    </html>
  );
}
