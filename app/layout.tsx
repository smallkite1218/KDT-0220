import type { Metadata, Viewport } from 'next'
import { Noto_Sans_KR, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Toaster } from '@/components/ui/toaster'
import { CarLikedProvider } from '@/contexts/car-liked-context'
import './globals.css'

const notoSansKR = Noto_Sans_KR({ subsets: ["latin"], variable: "--font-sans" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: 'CarInsight - AI 신차 추천 및 분석 서비스',
  description: 'AI 기반 신차 추천 및 분석 서비스. 당신의 라이프스타일에 맞는 최적의 차량을 찾아보세요.',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#111111',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko">
      <body className={`${notoSansKR.variable} ${geistMono.variable} font-sans antialiased`}>
        <CarLikedProvider>
          {children}
          <Toaster />
          <Analytics />
        </CarLikedProvider>
      </body>
    </html>
  )
}
