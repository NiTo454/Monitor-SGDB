import { Activity, Terminal as TerminalIcon, Database, Server } from 'lucide-react';
import Orchestrator from '../src/components/Orchestrator';
import Terminal from '../src/components/Terminal';

export default function Dashboard() {
  return (
    <main className="min-h-screen relative bg-[#0d0e12] text-white p-4 sm:p-8 selection:bg-violet-500 selection:text-white">
      {/* Fondo con brillo sutil (Glow effect) */}
      <div className="fixed inset-0 z-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(139,92,246,0.15),rgba(255,255,255,0))] pointer-events-none" />

      {/* Contenedor principal */}
      <div className="relative z-10 max-w-screen-2xl mx-auto">
        
        {/* Cabecera Principal */}
        <header className="border-b border-slate-800/80 pb-6 mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-violet-500/10 rounded-2xl border border-violet-500/20 shadow-[0_0_20px_rgba(139,92,246,0.15)]">
              <Activity className="w-8 h-8 text-violet-400" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-wider bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent">
                Monitor de SGBD Relacionales y NoSQL
              </h1>
              <p className="text-slate-400 text-sm mt-0.5">
                Plataforma de Auditoría, Telemetría y Monitoreo Multi-Motor (MySQL, SQL Server, PostgreSQL, MongoDB, Cassandra)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-slate-900/90 backdrop-blur-sm px-4 py-2 rounded-full border border-violet-500/30 shadow-[0_0_15px_rgba(139,92,246,0.1)]">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs text-slate-200 font-mono tracking-wide font-semibold">Monitor Multi-SGBD Activo</span>
          </div>
        </header>

        {/* Grid Principal */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

          {/* Columna Izquierda: Nodos Docker y Contenedores */}
          <div className="xl:col-span-1 bg-[#13151a]/90 backdrop-blur-xl border border-slate-800/80 p-6 rounded-2xl h-fit hover:border-slate-700/80 transition-colors duration-300 shadow-2xl shadow-black/40">
            <h2 className="text-base font-bold mb-4 text-violet-400 flex items-center gap-2 tracking-wide border-b border-slate-800/80 pb-3">
              <Server className="w-5 h-5 text-violet-400" /> Nodos y Servicios Docker
            </h2>
            <Orchestrator />
          </div>

          {/* Columna Central/Derecha: Telemetría y Consola de Ejecución */}
          <div className="xl:col-span-2 bg-[#13151a]/90 backdrop-blur-xl border border-slate-800/80 p-6 rounded-2xl hover:border-slate-700/80 transition-colors duration-300 shadow-2xl shadow-black/40">
            <h2 className="text-base font-bold mb-4 text-fuchsia-400 flex items-center gap-2 tracking-wide border-b border-slate-800/80 pb-3">
              <TerminalIcon className="w-5 h-5 text-fuchsia-400" /> Telemetría y Consola Interactiva
            </h2>
            <Terminal />
          </div>

        </div>
      </div>
    </main>
  );
}
