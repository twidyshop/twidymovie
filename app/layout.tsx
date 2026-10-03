import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";

export const metadata: Metadata = {
  title: "TWYMOVIE — Movie, Anime & Komik",
  description: "Streaming movie, anime dan membaca komik dengan pengalaman premium.",
  viewport: "width=device-width, initial-scale=1"
};

export default function RootLayout({ children }: Readonly<{children: React.ReactNode}>) {
  return <html lang="id"><body><Header/>{children}<footer className="footer">TWYMOVIE · Movie · Anime · Komik</footer></body></html>;
}