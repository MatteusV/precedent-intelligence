import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Geist, Geist_Mono } from "next/font/google";
import { clerkAppearance } from "@/lib/clerk-appearance";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Precedent Intelligence | Inteligência de precedentes por tema",
  description:
    "Para um tema jurídico, extraímos o padrão daquele juiz e daquele órgão e devolvemos dossiê citado e peça ancorada em fontes reais.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} dark h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <ClerkProvider
          appearance={clerkAppearance}
          taskUrls={{ "choose-organization": "/app/escritorio" }}
        >
          {children}
        </ClerkProvider>
      </body>
    </html>
  );
}
