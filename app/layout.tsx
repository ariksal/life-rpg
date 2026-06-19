import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Life RPG',
  description: 'Gamify your life. Level up for real.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
