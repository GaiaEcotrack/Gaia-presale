import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { WagmiProviderWrapper } from "@/components/shared/wagmi-provider";
import { Header } from "@/components/shared/header";
import { Footer } from "@/components/shared/footer";
import { LivePurchases } from "@/components/home/live-purchases";
import { LayoutWrapper } from "./layout-wrapper";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Gaia Ecotrack Presale — Invest in the Future of Renewable Energy",
  description:
    "Join the Gaia Ecotrack token presale and participate in the tokenization of real-world renewable energy. A blockchain-powered ecosystem for sustainable energy, carbon credits, and decentralized infrastructure.",
  keywords: [
    "Gaia Ecotrack",
    "Gaia Token",
    "Renewable Energy Crypto",
    "Energy Tokenization",
    "Blockchain Energy",
    "Green Crypto",
    "Carbon Credits",
    "Web3 Energy",
    "Token Presale",
    "Sustainable Investment",
  ],
  authors: [{ name: "Gaia Ecotrack" }],
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: "Gaia Ecotrack Presale — Renewable Energy on Blockchain",
    description:
      "Invest early in Gaia Ecotrack and support the transition to decentralized renewable energy powered by blockchain technology.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Gaia Ecotrack Presale — Renewable Energy on Blockchain",
    description:
      "Join the Gaia Ecotrack token presale and be part of the clean energy revolution powered by Web3.",
  },
};
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} font-sans antialiased bg-background text-foreground`}
      >
        <WagmiProviderWrapper>
          <LayoutWrapper>
            <div className="min-h-screen flex flex-col">
              <Header />
              <main className="flex-1 pt-16 sm:pt-20">
                {children}
              </main>
              <Footer />
            </div>
            <LivePurchases />
          </LayoutWrapper>
          <Toaster />
        </WagmiProviderWrapper>
      </body>
    </html>
  );
}
