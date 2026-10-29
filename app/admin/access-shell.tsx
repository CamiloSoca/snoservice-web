import Image from 'next/image'
import Link from 'next/link'
import {
  ArrowLeft, ChevronRight, Fingerprint, Globe2, Layers3,
  LockKeyhole, Settings2, ShieldCheck, UsersRound,
} from 'lucide-react'
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
      <div className="sno-access-rail-art" aria-hidden="true">
        <span className="is-active"><Globe2 size={19} /></span>
        <span><Layers3 size={19} /></span>
        <span><UsersRound size={19} /></span>
        <span><Settings2 size={19} /></span>
      </div>
      <div className="sno-access-rail-foot" aria-hidden="true"><span className="sno-access-live-dot" /><small>SECURE</small></div>
    </aside>
    <div className="sno-access-stage">
      <header className="sno-access-topbar">
        <Link href="/" className="sno-access-brand" aria-label="Volver al sitio de SNOSERVICE">
          <span className="sno-access-brand-icon">
            <Image src="/logo.png" alt="" width={36} height={36} priority />
          </span>
          <span><strong>SNO<span>SERVICE</span></strong><small>C E N T R A L</small></span>
        </Link>
        <nav className="sno-access-crumbs" aria-label="Ruta actual">
          <span>SNOSERVICE</span><ChevronRight size={14} aria-hidden="true" />
          <span>Central</span><ChevronRight size={14} aria-hidden="true"/>
          <strong>{isMfa ? 'Verificación' : 'Acceso'}</strong>
        </nav>
      </header>
      <div className="sno-access-composition">
        <section className="sno-access-editorial" aria-label="SNOSERVICE Central">
          <div className="sno-access-editorial-copy">
            <p className="sno-access-eyebrow">OPERACIONES EN UNA SOLA PLATAFORMA <span aria-hidden="true"/></p>
            <h2>{isMfa ? <>Protegido en<br/><em>cada paso.</em></> : <>Todo bajo<br/><em>control.</em></>}</h2>
            <p className="sno-access-editorial-lead">
              {isMfa ? 'Una comprobación más para proteger tu espacio.' : 'Acceso privado al centro de operaciones.'}
            </p>
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
            <div className="sno-access-art-label"><span className="sno-access-art-pin" /> PERSONAS<br/>PROCESOS<br/>RESULTADOS</div>
          </div>
          <div className="sno-access-editorial-footer">
            <div className="sno-access-progress"><span>01</span><i/></div>
            <p>Tecnología para<br/>operaciones más humanas.</p>
          </div>
        </section>
        <section className="sno-access-card" aria-label={isMfa ? 'Verificación de identidad' : 'Inicio de sesión'}>
          <div className="sno-access-card-top"><span>SNOSERVICE CENTRAL</span><span>{isMfa ? '02 / 02' : '01 / 02'}</span></div>
          {children}
          <div className="sno-access-security">
            <span className="sno-access-security-icon"><ShieldCheck size={23} strokeWidth={1.5}/></span>
            <div><strong>Verificación en dos pasos obligatoria</strong>
              <p>Tu identidad se comprueba antes de permitir el acceso a Central.</p>
            </div>
          </div>
          <div className="sno-access-card-bottom">
            <span className="sno-access-bottom-icon">{isMfa ? <Fingerprint size={22} strokeWidth={1.55}/> : <LockKeyhole size={22} strokeWidth={1.55}/>}</span>
            <div>
              <strong>{isMfa ? 'Tu seguridad, antes que nada.' : 'Acceso reservado. Todo en orden.'}</strong>
              <p>{isMfa ? 'Completá el segundo factor para continuar.' : 'Sesión protegida y acceso únicamente con una cuenta autorizada.'}</p>
            </div>
          </div>
        </section>
      </div>
      <footer className="sno-access-footer">
        <Link href="/"><ArrowLeft size={14}/> Volver al sitio público</Link>
        <span>SNOSERVICE · CENTRAL · ACCESO PRIVADO</span>
      </footer>
    </div>
  </main>
}
