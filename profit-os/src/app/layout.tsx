import type { Metadata } from 'next'
import './globals.css'
import { SessionProvider } from '@/components/providers/SessionProvider'
import { Toaster } from 'sonner'

export const metadata: Metadata = {
  title: 'Restaurant Profit OS — نظام تشغيل الربحية للمطاعم',
  description: 'منصة إدارة الربحية للمطاعم — تتبع التكاليف والمبيعات وأداء المنصات والموردين',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ar" dir="rtl" className="h-full">
      <body className="h-full bg-slate-50">
        <SessionProvider>
          {children}
          <Toaster position="top-right" richColors />
        </SessionProvider>
      </body>
    </html>
  )
}
