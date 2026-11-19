import { Geist, Geist_Mono } from "next/font/google"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/context/AuthContext"
import { cn } from "@/lib/utils";

import Footer from "@/components/footer";
import Navbar from "@/components/navbar";
import { Toaster } from "sonner";

const geist = Geist({subsets:['latin'],variable:'--font-sans'})

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
      className={cn("antialiased", fontMono.variable, "font-sans", geist.variable)}
    >
      <body>
        <ThemeProvider>
          <AuthProvider>
            <div className="flex min-h-screen flex-col">
              <Navbar/>
              {/* offset for the fixed header (h-18 = 4.5rem) */}
              <main className="flex-1 pt-18">{children}</main>
              <Footer />
            </div>
          </AuthProvider>
        </ThemeProvider>
        <Toaster position="top-right" richColors closeButton />
      </body>
    </html>
  )
}
