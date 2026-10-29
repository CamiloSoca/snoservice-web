import type { Metadata } from 'next'
import './styles.css'

export const metadata: Metadata = {
  title: 'SNOSERVICE Central · Administración',
  description: 'Panel privado de administración',
  robots: { index: false, follow: false, noarchive: true },
}

export default function CentralLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <div className="sno-admin">{children}</div>
}
