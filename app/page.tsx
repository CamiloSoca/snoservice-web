import React from 'react';
import { 
  ArrowUpRight, 
  LayoutGrid, 
  Cloud, 
  Database, 
  Cpu, 
  Sparkles,
  MessageCircle
} from 'lucide-react';

// Componente que carga tu logo SVG original de forma impecable en la web
function SnoLogo({ className = "w-10 h-10" }: { className?: string }) {
  return (
    <div className={`relative flex items-center justify-center rounded-xl bg-gradient-to-br from-white/[0.06] to-white/[0.01] border border-white/[0.1] p-1.5 shadow-[0_0_20px_rgba(6,182,212,0.15)] shrink-0 group-hover:border-emerald-500/40 transition duration-300 ${className}`}>
      <img 
        src="/logo.png" 
        alt="snoservice logo" 
        className="w-full h-full object-contain filter drop-shadow-[0_0_8px_rgba(34,211,238,0.25)]"
      />
    </div>
  );
}
// Ícono de Instagram en SVG puro
function InstagramIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

export default function SnoServiceLanding() {
  const INSTAGRAM_URL = "https://instagram.com/snoservice.uy"; 
  const WHATSAPP_URL = "https://wa.me/59898859989?text=Hola!%20Vi%20la%20web%20de%20snoservice%20y%20quiero%20hacer%20una%20consulta.";

  const stack = [
    { name: "Next.js", slug: "nextdotjs", color: "ffffff" },
    { name: "React", slug: "react", color: "61DAFB" },
    { name: "TypeScript", slug: "typescript", color: "3178C6" },
    { name: "Node.js", slug: "nodedotjs", color: "5FA04E" },
    { name: "n8n", slug: "n8n", color: "EA4B71" },
    { name: "PostgreSQL", slug: "postgresql", color: "4169E1" },
    { name: "Supabase", slug: "supabase", color: "3FCF8E" },
    { name: "Cloudflare", slug: "cloudflare", color: "F38020" },
    { name: "Vercel", slug: "vercel", color: "ffffff" },
    { name: "Python", slug: "python", color: "3776AB" },
    { name: "Tailwind CSS", slug: "tailwindcss", color: "06B6D4" },
  ];

  return (
    <div className="min-h-screen bg-[#09090B] text-zinc-100 selection:bg-emerald-500/30 selection:text-emerald-200 font-sans overflow-x-hidden relative">
      
      {/* Luces de ambiente (Glow de fondo) */}
      <div className="fixed top-[-15%] left-[10%] w-[500px] h-[500px] bg-indigo-600/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="fixed top-[20%] right-[10%] w-[450px] h-[450px] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none" />

      {/* NAVBAR */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-[#09090B]/75 border-b border-white/[0.06]">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          <a href="#" className="flex items-center gap-3 group">
            <SnoLogo className="w-10 h-10" />
            <div className="flex flex-col">
              <span className="font-bold text-lg tracking-tight text-white leading-none">
                snoservice
              </span>
              <span className="text-[10px] text-zinc-500 font-mono tracking-widest uppercase mt-1">
                software & cloud
              </span>
            </div>
          </a>

          <nav className="hidden md:flex items-center gap-8 text-sm text-zinc-400">
            <a href="#proyectos" className="hover:text-white transition">Proyectos</a>
            <a href="#servicios" className="hover:text-white transition">Servicios</a>
            <a href="#stack" className="hover:text-white transition">Tecnologías</a>
          </nav>

          <div className="flex items-center gap-3">
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram de snoservice"
              className="p-2.5 rounded-full bg-white/[0.04] text-zinc-400 hover:text-white hover:bg-white/[0.08] border border-white/[0.08] transition"
            >
              <InstagramIcon className="w-4 h-4" />
            </a>

            <a 
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-full text-sm font-medium bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/20 hover:shadow-[0_0_20px_rgba(16,185,129,0.25)] transition"
            >
              Contáctenos
            </a>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative pt-24 pb-20 px-6 text-center max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-xs text-zinc-300 mb-6">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          <span>Desarrollo Web, Sistemas & Automatización</span>
        </div>

        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white leading-[1.1] mb-6">
          Desarrollo de Software y{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-200 to-emerald-400">
            Sistemas a Medida
          </span>
        </h1>

        <p className="text-zinc-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 font-normal">
          Creamos aplicaciones web funcionales, rápidas y bien estructuradas. Desde sistemas de reservas y paneles de gestión hasta automatizaciones que simplifican el trabajo diario.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <a 
            href="#proyectos" 
            className="px-6 py-3 rounded-full font-medium text-sm bg-gradient-to-r from-indigo-500 to-emerald-500 text-white shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:opacity-95 transition"
          >
            Ver Proyectos
          </a>
          <a 
            href="#contacto" 
            className="px-6 py-3 rounded-full font-medium text-sm bg-white/[0.04] text-zinc-200 border border-white/[0.1] hover:bg-white/[0.08] transition"
          >
            Contáctenos
          </a>
        </div>
      </section>

      {/* CARRUSEL INFINITO CON LOGOS OFICIALES */}
      <section id="stack" className="w-full py-12 border-y border-white/[0.06] bg-white/[0.01] relative overflow-hidden">
        <p className="text-center text-[11px] uppercase tracking-[0.2em] text-zinc-500 mb-8 font-semibold">
          Tecnologías que utilizamos
        </p>
        
        <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[#09090B] to-transparent z-10" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-[#09090B] to-transparent z-10" />

        <div className="relative flex w-full overflow-hidden">
          <div className="animate-marquee flex items-center gap-6 px-3">
            {[...stack, ...stack, ...stack, ...stack].map((tech, i) => (
              <div 
                key={i} 
                className="group shrink-0 flex items-center gap-3 px-5 py-2.5 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-emerald-500/30 hover:bg-white/[0.05] transition duration-300 cursor-default select-none whitespace-nowrap"
              >
                <img 
                  src={`https://cdn.simpleicons.org/${tech.slug}/${tech.color}`} 
                  alt={tech.name}
                  className="w-5 h-5 shrink-0 opacity-70 grayscale group-hover:opacity-100 group-hover:grayscale-0 transition duration-300"
                  loading="lazy"
                />
                <span className="text-sm md:text-base font-semibold tracking-tight text-zinc-400 group-hover:text-white transition duration-300">
                  {tech.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BENTO GRID: PROYECTOS Y SERVICIOS */}
      <section id="proyectos" className="max-w-6xl mx-auto px-6 py-24">
        <div className="mb-10">
          <h2 className="text-xs uppercase tracking-[0.2em] text-emerald-400 font-semibold mb-2">
            Trabajos Recientes & Servicios
          </h2>
          <p className="text-2xl md:text-3xl font-bold text-white">
            Soluciones prácticas funcionando en el mundo real
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* TARJETA PRINCIPAL: 13 CUT BARBERÍA */}
          <div className="lg:col-span-7 group relative rounded-2xl bg-gradient-to-b from-white/[0.05] to-white/[0.01] border border-white/[0.08] hover:border-emerald-500/40 p-6 md:p-8 transition duration-500 flex flex-col justify-between overflow-hidden">
            <div className="absolute -right-20 -top-20 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl group-hover:bg-emerald-500/20 transition" />
            
            <div>
              <div className="flex items-center justify-between mb-6">
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                  Proyecto en Producción • Web App
                </span>
                <span className="text-xs text-zinc-500 font-mono">13-cut.snoservice.uy</span>
              </div>

              <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">
                13 Cut — Sistema de Turnos y Gestión
              </h3>
              <p className="text-zinc-400 text-sm md:text-base mb-6 leading-relaxed">
                Aplicación web desarrollada para gestionar reservas de clientes y la administración diaria de una barbería. Permite agendar turnos online, gestionar horarios por barbero, calcular comisiones y llevar el registro de gastos del local.
              </p>

              <div className="grid grid-cols-3 gap-4 p-4 rounded-xl bg-black/40 border border-white/[0.05] mb-6">
                <div>
                  <div className="text-emerald-400 font-bold text-base md:text-lg">Agenda Online</div>
                  <div className="text-xs text-zinc-500">Reserva de turnos</div>
                </div>
                <div>
                  <div className="text-white font-bold text-base md:text-lg">Panel Interno</div>
                  <div className="text-xs text-zinc-500">Barberos y caja</div>
                </div>
                <div>
                  <div className="text-indigo-400 font-bold text-base md:text-lg">Base de Datos</div>
                  <div className="text-xs text-zinc-500">PostgreSQL</div>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-white/[0.06]">
              <div className="flex flex-wrap gap-2 text-xs text-zinc-400 font-mono">
                <span className="px-2 py-1 rounded bg-white/[0.04]">Next.js</span>
                <span className="px-2 py-1 rounded bg-white/[0.04]">Supabase</span>
                <span className="px-2 py-1 rounded bg-white/[0.04]">PostgreSQL</span>
                <span className="px-2 py-1 rounded bg-white/[0.04]">Cloudflare</span>
              </div>

              <a 
                href="https://13-cut.snoservice.uy" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500 text-zinc-950 font-semibold text-sm hover:bg-emerald-400 transition"
              >
                Ver sitio online
                <ArrowUpRight className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* SUB-GRILLA DERECHA: 4 CAJAS BENTO DE SERVICIOS */}
          <div id="servicios" className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.08] hover:border-indigo-500/40 transition flex flex-col justify-between">
              <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4">
                <LayoutGrid className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-white mb-1">Sistemas a Medida</h4>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Paneles administrativos, agendas de reservas y páginas web adaptadas a lo que necesita tu negocio.
                </p>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.08] hover:border-emerald-500/40 transition flex flex-col justify-between">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-white mb-1">Automatización & n8n</h4>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Flujos automatizados con n8n, scripts en Python y bots para conectar tus herramientas y ahorrar tiempo.
                </p>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.08] hover:border-emerald-500/40 transition flex flex-col justify-between">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-white mb-1">Bases de Datos</h4>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Diseño y configuración de bases de datos en PostgreSQL y Supabase para guardar tu información de forma segura.
                </p>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.08] hover:border-indigo-500/40 transition flex flex-col justify-between">
              <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4">
                <Cloud className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-white mb-1">Despliegue & Dominios</h4>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Puesta en marcha de tu web con Vercel y configuración de dominios y certificados SSL en Cloudflare.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* SECCIÓN CTA PREVIA AL FOOTER */}
      <section id="contacto" className="max-w-6xl mx-auto px-6 pb-20">
        <div className="rounded-3xl bg-gradient-to-r from-indigo-500/10 via-emerald-500/10 to-transparent border border-white/[0.08] p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">
              ¿Tenés una idea o proyecto en mente?
            </h3>
            <p className="text-zinc-400 text-sm md:text-base max-w-xl">
              Escribinos por WhatsApp o Instagram para contarnos qué necesitás armar o automatizar en tu negocio.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <a 
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-emerald-500 text-zinc-950 font-semibold text-sm hover:bg-emerald-400 transition"
            >
              <MessageCircle className="w-4 h-4" />
              Contáctenos
            </a>
            <a 
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-white/[0.05] text-white border border-white/[0.1] hover:bg-white/[0.1] font-medium text-sm transition"
            >
              <InstagramIcon className="w-4 h-4 text-pink-400" />
              Instagram
            </a>
          </div>
        </div>
      </section>

      {/* FOOTER COMPLETO */}
      <footer className="border-t border-white/[0.06] bg-[#070709] pt-14 pb-10 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-white/[0.06]">
          
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <SnoLogo className="w-9 h-9" />
              <span className="font-bold text-lg tracking-tight text-white">snoservice</span>
            </div>
            <p className="text-zinc-400 text-sm max-w-sm leading-relaxed mb-6">
              Desarrollo de software a medida, páginas web, sistemas de gestión y automatización de procesos para negocios y profesionales.
            </p>
            <div className="flex items-center gap-3">
              <a 
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs text-zinc-300 transition"
              >
                <InstagramIcon className="w-3.5 h-3.5 text-pink-400" />
                @snoservice.uy
              </a>
              <a 
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs text-zinc-300 transition"
              >
                <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                WhatsApp Directo
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-4">
              Navegación
            </h4>
            <ul className="space-y-2.5 text-sm text-zinc-400">
              <li><a href="#proyectos" className="hover:text-white transition">Proyectos</a></li>
              <li><a href="#servicios" className="hover:text-white transition">Servicios</a></li>
              <li><a href="#stack" className="hover:text-white transition">Tecnologías</a></li>
              <li><a href="#contacto" className="hover:text-white transition">Contáctenos</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-4">
              En Producción
            </h4>
            <ul className="space-y-2.5 text-sm text-zinc-400">
              <li>
                <a 
                  href="https://13-cut.snoservice.uy" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 hover:text-emerald-400 transition"
                >
                  13 Cut Barbería
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </a>
              </li>
            </ul>
          </div>

        </div>

        <div className="max-w-6xl mx-auto pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <p>© 2026 snoservice. Todos los derechos reservados.</p>
          <p>Montevideo, Uruguay 🇺🇾</p>
        </div>
      </footer>

    </div>
  );
}