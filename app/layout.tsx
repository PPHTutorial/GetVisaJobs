import type { Metadata } from "next"
import "./globals.css"
import { Toaster } from "react-hot-toast"
import { Red_Hat_Display } from 'next/font/google'
import { ThemeProvider } from '../lib/hooks/theme-provider'
import { SessionProvider } from '../lib/hooks/session-provider'

export const metadata: Metadata = {
  title: "NoStressVisJobs - Community-Driven Package Delivery",
  description: "Connect senders with travelers for fast, reliable, and cost-effective package delivery worldwide.",
  keywords: "package delivery, travel, shipping, logistics, community, global shipping, package transport, courier service",
  authors: [{ name: "NoStressVisJobs Team" }],
  creator: "NoStressVisJobs",
  publisher: "NoStressVisJobs",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://fakomame.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "NoStressVisJobs - Community-Driven Package Delivery",
    description: "Connect senders with travelers for fast, reliable, and cost-effective package delivery worldwide.",
    url: 'https://fakomame.com',
    siteName: 'NoStressVisJobs',
    images: [
      {
        url: 'https://fakomame.com/logo.jpg',
        width: 1200,
        height: 630,
        alt: 'NoStressVisJobs - Community-Driven Package Delivery',
      }
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "NoStressVisJobs - Community-Driven Package Delivery",
    description: "Connect senders with travelers for fast, reliable, and cost-effective package delivery worldwide.",
    images: ['https://nostressvisajobs.com/logo.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

const redHatDisplay = Red_Hat_Display({
  subsets: ['latin'],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: '--font-red-hat-display',
  display: 'swap',
})


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {

  

  return (
    <html className="h-full" lang="en" suppressHydrationWarning>
      <body className={`${redHatDisplay.variable} font-sans bg-white dark:bg-gray-900 h-full`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SessionProvider>
            {children}
            <Toaster />
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

