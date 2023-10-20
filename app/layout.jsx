import './globals.css'
// import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Admin Customer Supprt',
  description: 'Customer Support Interface for Admin',
}

export default function RootLayout({children}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
