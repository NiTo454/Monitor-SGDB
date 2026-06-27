'use client'

import { Database, Settings, Server, Key, Plug } from 'lucide-react';
import { ChangeEvent } from 'react';

interface ConnectionFormProps {
  formData: any;
  handleInputChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  isDisabled: boolean;
  onOpenConfig: () => void;
}

export default function ConnectionForm({ formData, handleInputChange, isDisabled, onOpenConfig }: ConnectionFormProps) {
  return (
    <div className="bg-[#13151a] border border-slate-800 rounded-xl p-4 flex flex-col gap-3 shadow-lg">
      <div className="flex items-center justify-between gap-2 mb-1">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-violet-400" />
          <h2 className="text-sm font-bold text-slate-200">Conexión Activa de Monitoreo</h2>
        </div>
        <button
          onClick={onOpenConfig}
          disabled={isDisabled}
          className="px-3 py-1.5 bg-violet-600/20 hover:bg-violet-600/30 border border-violet-500/30 text-violet-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
        >
          <Settings className="w-3.5 h-3.5" />
          Menú de Configuraciones
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        <div>
          <label className="block text-[11px] text-slate-400 mb-1">Motor SGBD</label>
          <select
            name="engine"
            value={formData.engine}
            onChange={handleInputChange}
            disabled={isDisabled}
            className="w-full bg-[#0a0b0e] border border-slate-700 rounded-lg p-2 text-xs font-semibold text-violet-300 focus:border-violet-500 outline-none transition-colors disabled:opacity-50"
          >
            <option value="mysql">MySQL</option>
            <option value="sqlserver">SQL Server</option>
            <option value="postgresql">PostgreSQL</option>
            <option value="mongodb">MongoDB</option>
            <option value="cassandra">Cassandra</option>
          </select>
        </div>

        <div>
          <label className="block text-[11px] text-slate-400 mb-1 flex items-center gap-1"><Server className="w-3 h-3" /> Host</label>
          <input
            name="host"
            placeholder="localhost"
            value={formData.host}
            onChange={handleInputChange}
            disabled={isDisabled}
            className="w-full bg-[#0a0b0e] border border-slate-700 rounded-lg p-2 text-xs font-mono text-slate-300 outline-none focus:border-violet-500 transition-colors disabled:opacity-50"
          />
        </div>

        <div>
          <label className="block text-[11px] text-slate-400 mb-1 flex items-center gap-1"><Plug className="w-3 h-3" /> Puerto</label>
          <input
            name="port"
            placeholder="Puerto"
            value={formData.port}
            onChange={handleInputChange}
            disabled={isDisabled}
            className="w-full bg-[#0a0b0e] border border-slate-700 rounded-lg p-2 text-xs font-mono text-slate-300 outline-none focus:border-violet-500 transition-colors disabled:opacity-50"
          />
        </div>

        <div>
          <label className="block text-[11px] text-slate-400 mb-1 flex items-center gap-1"><Key className="w-3 h-3" /> Usuario</label>
          <input
            name="user"
            placeholder="Usuario"
            value={formData.user}
            onChange={handleInputChange}
            disabled={isDisabled}
            className="w-full bg-[#0a0b0e] border border-slate-700 rounded-lg p-2 text-xs font-mono text-slate-300 outline-none focus:border-violet-500 transition-colors disabled:opacity-50"
          />
        </div>

        <div>
          <label className="block text-[11px] text-slate-400 mb-1 flex items-center gap-1"><Key className="w-3 h-3" /> Contraseña</label>
          <input
            name="password"
            type="password"
            placeholder="Contraseña"
            value={formData.password || ''}
            onChange={handleInputChange}
            disabled={isDisabled}
            className="w-full bg-[#0a0b0e] border border-slate-700 rounded-lg p-2 text-xs font-mono text-slate-300 outline-none focus:border-violet-500 transition-colors disabled:opacity-50"
          />
        </div>

        <div>
          <label className="block text-[11px] text-slate-400 mb-1 flex items-center gap-1"><Database className="w-3 h-3" /> Base de Datos / KS</label>
          <input
            name="database"
            placeholder="dbejemplo"
            value={formData.database}
            onChange={handleInputChange}
            disabled={isDisabled}
            className="w-full bg-[#0a0b0e] border border-slate-700 rounded-lg p-2 text-xs font-mono text-slate-300 outline-none focus:border-violet-500 transition-colors disabled:opacity-50"
          />
        </div>
      </div>
    </div>
  );
}
