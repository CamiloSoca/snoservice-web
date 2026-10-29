import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, Fingerprint, LockKeyhole, ShieldCheck } from 'lucide-react'
import type { ReactNode } from 'react'

export function AccessShell({ phase, children }: { phase: 'login' | 'mfa'; children: ReactNode }) {
  const second = phase === 'mfa'
  return <main className="sno-access">
    <section className="sno-access-aside" aria-label="SNOSERVICE Central">
      <div className="sno-access-aside-head">
        <Link href="/" className="sno-access-brand" aria-label="SNOSERVICE, volver al inicio">
          <span className="sno-access-brand-icon"><Image src="/logo.png" alt="" width={38} height={38} priority/></span>
          <span><strong>SNO<span>SERVICE</span></strong><small>C E N T R A L</small></span>
        </Link>
        <span className="sno-access-internal">PRIVATE WORKSPACE</span>
      </div>
      <div className="sno-access-aside-content">
        <div className="sno-access-drawing" aria-hidden="true">
          <span className="sno-access-drawing-outer"/><span className="sno-access-drawing-middle"/>
          <span className="sno-access-drawing-center"><Image src="/logo.png" alt="" width={64} height={64}/></span>
          <span className="sno-access-drawing-node node-one"/><span className="sno-access-drawing-node node-two"/>
        </div>
        <p className="sno-access-aside-eyebrow">OPERACIONES / SISTEMAS / NEGOCIOS</p>
        <h2>Tu espacio<br/>de operaciones.</h2>
        <p>La infraestructura detrás de cada proyecto, organizada en un mismo lugar.</p>
      </div>
      <div className="sno-access-aside-footer">
        <span><span className="sno-access-live-dot"/> Entorno privado</span>
        <span>SNOSERVICE © 2026</span>
      </div>
    </section>
    <section className="sno-access-main">
      <div className="sno-access-mobile-brand">
        <Link href="/" className="sno-access-brand"><Image src="/logo.png" alt="" width={35} height={35}/><span><strong>SNO<span>SERVICE</span></strong><small>C E N T R A L</small></span></Link>
      </div>
      <div className="sno-access-center">
        <div className="sno-access-step"><span>{second?'02':'01'}</span><span className="sno-access-step-line"/><span>02</span><span className="sno-access-step-word">{second?'VERIFICACIÓN':'IDENTIFICACIÓN'}</span></div>
        <div className="sno-access-content">{children}</div>
        <div className="sno-access-security"><span className="sno-access-security-icon">{second?<Fingerprint size={17}/>:<LockKeyhole size={17}/>}</span><div><strong>{second?'Segundo factor obligatorio':'Acceso limitado'}</strong><p>{second?'Solo se permite continuar tras validar tu identidad.':'Tu cuenta requiere credenciales y verificación adicional.'}</p></div><ShieldCheck size={18} className="sno-access-shield"/></div>
      </div>
      <footer className="sno-access-main-footer"><Link href="/"><ArrowLeft size={14}/> Volver al sitio</Link><span>Acceso exclusivo · SNOSERVICE</span></footer>
    </section>
  </main>
}
