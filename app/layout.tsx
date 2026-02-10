import React from "react"
import type { Metadata } from 'next'
import { Noto_Sans_JP } from 'next/font/google'

import './globals.css'

const notoSansJP = Noto_Sans_JP({ 
  subsets: ['latin'],
  variable: '--font-noto-sans-jp',
})

export const metadata: Metadata = {
  title: '案件管理システム',
  description: '広告バナー案件の提案・掲載管理システム',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ja">
      <body className={`${notoSansJP.variable} font-sans antialiased`}>{children}</body>
    </html>
  )
}
