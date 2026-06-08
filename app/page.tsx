import { Shield, Terminal as TerminalIcon, Database } from 'lucide-react';
import Orchestrator from '../src/components/Orchestrator';
import Terminal from '../src/components/Terminal';

export default function Dashboard() {
  return (
    <main className="min-h-screen relative bg-[#0d0e12] text-white p-4 sm:p-8 selection:bg-fuchsia-500 selection:text-white overflow-hidden">
      {/* Fondo con brillo sutil (Glow effect) */}
      <div className="fixed inset-0 z-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(139,92,246,0.15),rgba(255,255,255,0))] pointer-events-none" />

      {/* Contenedor limitador de ancho para pantallas gigantes */}
      <div className="relative z-10 max-w-screen-2xl mx-auto">
        {/* Cabecera */}
        <header className="border-b border-slate-800/80 pb-6 mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-2.5 bg-fuchsia-500/10 rounded-xl border border-fuchsia-500/20 shadow-[0_0_15px_rgba(217,70,239,0.1)]">
              <Shield className="w-8 h-8 text-fuchsia-500" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-wider bg-gradient-to-r from-fuchsia-500 via-violet-500 to-coral-500 bg-clip-text text-transparent">
                Monitor de Seguridad SGBD
              </h1>
              <p className="text-slate-500 text-sm mt-1">Plataforma de Auditoría y Ejecución en tiempo real</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-slate-900/80 backdrop-blur-sm px-4 py-2 rounded-full border border-violet-500/30 shadow-[0_0_15px_rgba(139,92,246,0.1)] hover:border-violet-500/50 transition-colors">
            <span className="w-2 h-2 rounded-full bg-coral-500 animate-[pulse_2s_ease-in-out_infinite]"></span>
            <span className="text-xs text-fuchsia-100 font-mono tracking-wide">Glitch Core Activo</span>
          </div>
        </header>

        {/* Grid Principal */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

          {/* Columna Izquierda: Nodos Docker */}
          <div className="xl:col-span-1 bg-[#13151a]/80 backdrop-blur-xl border border-slate-800/80 p-6 rounded-2xl h-fit hover:border-slate-700 transition-colors duration-300 shadow-2xl shadow-black/40">
             <h2 className="text-lg font-bold mb-6 text-violet-400 flex items-center gap-2 tracking-wide">
              <Database className="w-5 h-5" /> Nodos de Bases de Datos
            </h2>
            <Orchestrator />
          </div>

          {/* Columna Central/Derecha: Terminal Dinámica */}
          <div className="xl:col-span-2 bg-[#13151a]/80 backdrop-blur-xl border border-slate-800/80 p-6 rounded-2xl hover:border-slate-700 transition-colors duration-300 shadow-2xl shadow-black/40">
            <h2 className="text-lg font-bold mb-4 text-fuchsia-400 flex items-center gap-2 tracking-wide">
              <TerminalIcon className="w-5 h-5" /> Consola de Auditoría y Ejecución
            </h2>
            {/* Aquí inyectamos la Terminal que acabamos de armar */}
            <Terminal />
          </div>

        </div>
      </div>
    </main>
  );
}
