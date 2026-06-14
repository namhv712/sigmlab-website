import type { Metadata } from 'next'
import './globals.css'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import CollectiveDinoRunners from '@/components/wc/CollectiveDinoRunners'

export const metadata: Metadata = {
  title: {
    default: 'SigM Lab – Signal Processing, Information and Multimedia Content',
    template: '%s | SigM Lab',
  },
  description: 'SigM Laboratory at Hanoi University of Science and Technology — research in signal processing, multimedia analysis, and media security.',
  icons: {
    icon: '/assets/themes/lab/images/logo/icon-lab.jpg',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://use.fontawesome.com/releases/v5.0.8/css/all.css"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Lato:ital,wght@0,300;0,700;1,300&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen flex flex-col bg-gray-50 font-sans antialiased">
        <Navbar />
        <CollectiveDinoRunners />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  )
}
