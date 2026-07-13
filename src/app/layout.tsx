import type { Metadata } from 'next'
import { Plus_Jakarta_Sans, Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/theme/ThemeProvider'
import { ToastProvider } from '@/components/ui/Toast'
import { AuthGateProvider } from '@/components/ui/AuthGate'

const jakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-heading',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700'],
})

export const metadata: Metadata = {
  title: 'FujiFood — Premium Restaurant Ordering',
  description: 'Order from your favourite restaurant. Fresh food, fast delivery.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${jakartaSans.variable} ${inter.variable}`}>
      <body className="min-h-screen bg-background text-text antialiased">
        <ThemeProvider>
          <AuthGateProvider>
            <ToastProvider>
              {children}
            </ToastProvider>
          </AuthGateProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
