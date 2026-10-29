import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import type { ReactNode } from 'react'

/** Public-facing auth shell: same brand as Central, without exposing admin navigation. */
export function AccessShell({ phase, children }: { phase: 'login' | 'mfa'; children: ReactNode }) {
  const isMfa = phase === 'mfa'
  return <main className="sno-access">
    <aside className="sno-access-rail" aria-label="Identidad de SNOSERVICE">
      <Link href="/" className="sno-access-rail-brand" aria-label="SNOSERVICE, ir al sitio público">
        <Image src="/logo.png" alt="" width={37} height={37} priority />
      </Link>
      <span className="sno-access-rail-rule" />

      <div className="sno-access-rail-foot" aria-hidden="true"><span className="sno-access-live-dot" /></div>
    </aside>
    <div className="sno-access-stage">
      <header className="sno-access-topbar">
        <Link href="/" className="sno-access-brand" aria-label="Volver al sitio de SNOSERVICE">
          <span className="sno-access-brand-icon">
            <Image src="/logo.png" alt="" width={36} height={36} priority />
          </span>
          <span><strong>SNO<span>SERVICE</span></strong><small>C E N T R A L</small></span>
        </Link>

      </header>
      <div className="sno-access-composition">
        <section className="sno-access-editorial" aria-label="SNOSERVICE Central">
          <div className="sno-access-editorial-copy">

            <h2>{isMfa ? <>Protegido en<br/><em>cada paso.</em></> : <>Todo bajo<br/><em>control.</em></>}</h2>

          </div>
          <div className="sno-access-art" aria-hidden="true">
            <div className="sno-access-art-sphere sphere-a"/>
            <div className="sno-access-art-sphere sphere-b"/>
            <div className="sno-access-art-noise"/>
            <svg className="sno-access-art-svg" viewBox="0 0 850 570" preserveAspectRatio="xMidYMid slice" fill="none">
              <g stroke="#b1d1bd" strokeWidth=".65" opacity=".30">
                {Array.from({ length: 30 }, (_, i) => (
                  <path key={i} d={'M '+(-150+i*5)+' '+(640-i*10)+' C '+(145+i*3)+' '+(345-i*4)+', '+(305+i*4)+' '+(780-i*14)+', '+(515+i*4)+' '+(330-i*11)+' S '+(740+i*4)+' '+(180-i*5)+', 990 '+(140-i*5)} />
                ))}
              </g>
              <g stroke="#9eae9e" strokeWidth=".7" opacity=".25">
                <circle cx="230" cy="545" r="222"/>
                <circle cx="230" cy="545" r="278"/>
                <circle cx="230" cy="545" r="338"/>
                <circle cx="740" cy="20" r="240"/>
                <circle cx="740" cy="20" r="310"/>
              </g>
              <g stroke="#c5d8c6" strokeWidth=".7" opacity=".36">
                <path d="M 420 0 V 570" strokeDasharray="2 9"/>
                <path d="M 0 384 H 850" strokeDasharray="2 12"/>
                <circle cx="541" cy="255" r="4" fill="#d0f3da" stroke="none"/>
                <circle cx="541" cy="255" r="17" strokeDasharray="1 5"/>
              </g>
            </svg>

          </div>

        </section>
        <section className="sno-access-card" aria-label={isMfa ? 'Verificación de identidad' : 'Inicio de sesión'}>
          <div className="sno-access-card-top"><span>CENTRAL</span><span>{isMfa ? '02 / 02' : '01 / 02'}</span></div>
          {children}

        </section>
      </div>
      <footer className="sno-access-footer">
        <Link href="/"><ArrowLeft size={14}/> Volver al sitio público</Link>

      </footer>
    </div>
  </main>
}
