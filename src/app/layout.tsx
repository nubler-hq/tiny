import type { Metadata } from 'next'
import { Toaster } from 'sonner'
import { ThemeProvider } from 'next-themes'
import { ViewTransitions } from 'next-view-transitions'
import { Suspense } from 'react'
import { GeistSans } from 'geist/font/sans'
import { cn } from '@/utils/cn'
import { DemoPromoBar } from '@/components/ui/demo-promo-bar'
import { IgniterProvider } from '@igniter-js/core/client'
import { AppConfig } from '@/config/boilerplate.config.client'

import NextTopLoader from 'nextjs-toploader'

import './globals.css'

export const viewport = {
  maximumScale: 1,
}

export const metadata: Metadata = {
  metadataBase: new URL(AppConfig.url),
  title: {
    template: `%s | ${AppConfig.name}`,
    default: AppConfig.name,
  },
  openGraph: {
    title: AppConfig.name,
    url: AppConfig.url,
    siteName: AppConfig.name,
    images: [
      {
        url: `${AppConfig.url}/og-image.png`,
        width: 1200,
        height: 630,
        alt: AppConfig.name,
      },
    ],
  },
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ViewTransitions>
      <html lang="pt-BR" suppressHydrationWarning>
        <body className={cn('antialiased', GeistSans.className)}>
          <NextTopLoader color="#333" />
          <ThemeProvider
            attribute="class"
            defaultTheme={AppConfig.theme}
            enableSystem
            disableTransitionOnChange
          >
            <Toaster position="top-center" />
            <IgniterProvider debug>
              <DemoPromoBar />
              <Suspense>{children}</Suspense>
            </IgniterProvider>
          </ThemeProvider>
        </body>
      </html>
    </ViewTransitions>
  )
}
