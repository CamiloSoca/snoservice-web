import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, ChevronRight, Fingerprint, LockKeyhole, ShieldCheck } from 'lucide-react'
import type { ReactNode } from 'react'

/** Same visual tokens and layout language as the authenticated Central workspace. */
export function AccessShell({ phase, children }: { phase: 'login' | 'mfa'; children: ReactNode }) {
  const second = phase === 'mfa'
  return <main className="sno-access">
    <aside className="sno-access-rail" aria-label="SNOSERVICE Central">
      <Link href="/" className="sno-access-brand" aria-label="Volver a SNOSERVICE">
        <span className="sno-access-brand-icon">
          <Image src="/logo.png" alt="" width={33} height={33} priority />
        </span>
        <span><strong>SNO<span>SERVICE</span></strong><small>C E N T R A L</small></span>
      </Link>
      <div className="sno-access-workspace">
        <span className="sno-access-workspace-icon">S</span>
        <span><strong>Espacio principal</strong><small>Administración general</small></span>
        <ChevronRight size={15} aria-hidden="true" />
      </div>
      <div className="sno-access-rail-label">ACCESO ADMINISTRATIVO</div>
      <div className="sno-access-rail-item">
        <LockKeyhole size={17} strokeWidth={1.7} aria-hidden="true" />
        <span>Identificación</span>
        <span className="sno-access-rail-index">01</span>
      </div>
      <div className={'sno-access-rail-item' + (second ? ' is-current' : ' is-pending')}>
        <Fingerprint size={17} strokeWidth={1.7} aria-hidden="true" />
        <span>Segundo factor</span>
        <span className="sno-access-rail-index">02</span>
      </div>
      <div className="sno-access-rail-bottom">
        <span className="sno-access-rail-dot" aria-hidden="true" />
        <div><strong>Workspace privado</strong><small>Ingreso exclusivo para cuentas autorizadas</small></div>
      </div>
    </aside>
    <div className="sno-access-stage">
      <header className="sno-access-topbar">
        <div className="sno-access-crumbs">
          <span>Central</span><ChevronRight size={15} aria-hidden="true" />
          <strong>{second ? 'Verificación' : 'Iniciar sesión'}</strong>
        </div>
        <div className="sno-access-topbar-right"><ShieldCheck size={15} aria-hidden="true" /> Entorno privado</div>
      </header>
      <div className="sno-access-mobile-brand">
        <Link href="/" className="sno-access-brand" aria-label="Volver a SNOSERVICE">
          <Image src="/logo.png" alt="" width={34} height={34} priority />
          <span><strong>SNO<span>SERVICE</span></strong><small>C E N T R A L</small></span>
        </Link>
      </div>
      <div className="sno-access-layout">
        <section className="sno-access-intro" aria-label="Acerca de este acceso">
          <span className="sno-access-intro-number">SNOSERVICE / CENTRAL</span>
          <h2>Un espacio.<br/>Todo bajo control<span>.</span></h2>
          <p>Tu centro de operaciones: sitios, clientes y procesos, en un solo lugar.</p>
          <div className="sno-access-intro-rule" aria-hidden="true" />
          <div className="sno-access-intro-note">
            <span className="sno-access-note-mark"><ShieldCheck size={18} strokeWidth={1.6} aria-hidden="true"/></span>
            <div><strong>Acceso protegido</strong><span>La identidad se verifica antes de permitir el ingreso al panel.</span></div>
          </div>
        </section>
        <section className="sno-access-card" aria-label={second ? 'Segundo factor' : 'Inicio de sesión'}>
          <div className="sno-access-step">
            <span className="sno-access-step-active">{second ? '02' : '01'}</span>
            <span className="sno-access-step-line" />
            <span>02</span>
            <span className="sno-access-step-word">{second ? 'VERIFICACIÓN' : 'IDENTIFICACIÓN'}</span>
          </div>
          {children}
          <div className="sno-access-security">
            <span className="sno-access-security-icon">{second ? <Fingerprint size={17} /> : <LockKeyhole size={17}/>}</span>
            <div><strong>{second ? 'Segundo factor obligatorio' : 'Acceso limitado'}</strong>
              <p>{second ? 'Verificamos tu identidad antes de habilitar el panel.' : 'Las cuentas requieren contraseña y autenticador.'}</p>
            </div>
          </div>
        </section>
      </div>
      <footer className="sno-access-footer">
        <Link href="/"><ArrowLeft size={14}/> Sitio público</Link>
        <span>SNOSERVICE CENTRAL · ACCESO PRIVADO</span>
      </footer>
    </div>
  </main>
}
