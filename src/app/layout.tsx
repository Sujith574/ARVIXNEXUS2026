import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "600"],
});

export const metadata: Metadata = {
  title: "ARVIX NEXUS 2026 | National Launch & Hackathon | MeitY",
  description:
    "Official portal for the national government launch event and hybrid innovation hackathon 2026, organised by the Ministry of Electronics & Information Technology (MeitY), Government of India.",
  keywords: ["hackathon", "MeitY", "government", "ARVIX", "innovation", "digital governance", "India"],
  authors: [{ name: "MeitY — Ministry of Electronics & IT" }],
  openGraph: {
    title: "ARVIX NEXUS 2026 | National Launch & Hackathon",
    description: "Join India's premier national hybrid hackathon — compete, innovate, and shape digital governance.",
    type: "website",
    locale: "en_IN",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#020817",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable} h-full scroll-smooth`}
    >
      <body className="min-h-full bg-slate-950 text-slate-100 flex flex-col antialiased selection:bg-blue-500/30 selection:text-white">
        <Navbar />
        <main className="flex-grow flex flex-col">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
