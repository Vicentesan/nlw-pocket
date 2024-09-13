import './globals.css'

import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'in.orbit',
  description:
    'In.Orbit is an Open Source application developed during the Rocketseat NLW to help you with your daily tasks organization.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark antialiased">
      <body>{children}</body>
    </html>
  )
}
