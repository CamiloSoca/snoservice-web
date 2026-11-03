import type { Metadata, Viewport } from 'next'
import './styles.css'

/** Standalone install metadata is scoped to /admin, not the public website. */
export const metadata: Metadata = {
  title: 'SNOSERVICE Central · Administración',
  description: 'Panel privado de administración',
  robots: { index: false, follow: false, noarchive: true },
  manifest: '/central.webmanifest',
  other: { 'mobile-web-app-capable': 'yes' },
  appleWebApp: {
    capable: true,
    title: 'Central',
    statusBarStyle: 'black',
  },
  icons: {
    icon: '/logo.png',
    apple: [{ url: '/logo.png' }],
  },
}

export const viewport: Viewport = {
  themeColor: '#101213',
}

export default function CentralLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <div className="sno-admin">{children}</div>
}
