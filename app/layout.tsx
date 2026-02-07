import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'HeartFrame',
  description: '마음액자',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  )
}

