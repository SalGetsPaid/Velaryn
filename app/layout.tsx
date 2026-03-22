import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "@fontsource/playfair-display/400.css";
import "@fontsource/playfair-display/700.css";
import FirstLaunchGate from "@/components/FirstLaunchGate";
import Navbar from "@/components/Navbar";
import SovereignBiometricGate from "@/components/SovereignBiometricGate";
import { SovereignProvider } from "@/components/SovereignProvider";
import QueryProvider from "@/components/QueryProvider";
import ThemeProvider from "@/components/ThemeProvider";
import GlobalErrorBoundary from "@/components/GlobalErrorBoundary";
import ServiceWorkerRegistrar from "@/components/ServiceWorkerRegistrar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Velaryn",
  description: "Your AI-powered wealth coach.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Velaryn",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      style={{ backgroundColor: "#000000" }}
      suppressHydrationWarning
    >
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#000000" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Velaryn" />
      </head>
      <body className="min-h-full flex flex-col bg-black" style={{ backgroundColor: "#000000" }}>
        <ThemeProvider>
          <GlobalErrorBoundary>
            <QueryProvider>
              <SovereignProvider>
                <ServiceWorkerRegistrar />
                <FirstLaunchGate>
                  <SovereignBiometricGate>{children}</SovereignBiometricGate>
                </FirstLaunchGate>
                <Navbar />
              </SovereignProvider>
            </QueryProvider>
          </GlobalErrorBoundary>
        </ThemeProvider>
      </body>
    </html>
  );
}
