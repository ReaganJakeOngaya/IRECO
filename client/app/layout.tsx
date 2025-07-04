import './globals.css'
import { Inter } from 'next/font/google'
import Head from 'next/head'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'SocialWave | Connect. Chat. Stream. Share.',
  description: 'The next generation social platform for creators and communities',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <Head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="theme-color" content="#1e293b" />
      </Head>
      <body className={`${inter.className} bg-slate-900 text-white`}>
        {children}
      </body>
    </html>
  )
}
