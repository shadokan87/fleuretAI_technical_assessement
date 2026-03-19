import { Geist, Geist_Mono, Inter } from "next/font/google"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@/lib/utils";
import Providers from "./providers";
import VulnerabilityWidget from "@/components/VulnerabilityWidget";
import AppSidebar from "@/components/AppSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

const inter = Inter({subsets:['latin'],variable:'--font-sans'})

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("antialiased", fontMono.variable, "font-sans", inter.variable)}
    >
      <body>
        <Providers>
          <ThemeProvider>
            <SidebarProvider>
              <AppSidebar />
              <main className="flex-1 min-w-0">
                <div className="p-2">
                  <SidebarTrigger />
                </div>
                {children}
              </main>
            </SidebarProvider>
            <VulnerabilityWidget />
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  )
}
