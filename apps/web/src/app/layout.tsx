import './globals.css'

import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'InOrbit | Make your Life Easier',
  description:
    'InOrbit is an Open Source application developed during the Rocketseat NLW to help you with your daily tasks organization.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body>{children}</body>
    </html>
  )
}
