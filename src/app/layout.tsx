import type { Metadata } from "next";
import { Sora, Inter, JetBrains_Mono } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "UNIVERSO | Gestão de Terceiros",
  description: "Plataforma UNIVERSO de gestão de terceiros e controle de acesso.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="pt-BR"
      className={`${sora.variable} ${inter.variable} ${jetbrainsMono.variable}`}
    >
      <body className="min-h-screen antialiased">
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
