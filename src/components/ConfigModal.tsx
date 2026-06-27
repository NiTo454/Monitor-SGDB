'use client'

import { useState } from 'react';
import { Settings, Server, Key, Database as DbIcon, CheckCircle2, AlertCircle, Loader2, X, Plug } from 'lucide-react';

export interface SgbdConfig {
  engine: string;
  host: string;
  port: string;
  user: string;
  password?: string;
  database: string;
  query?: string;
}

interface ConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  configs: Record<string, SgbdConfig>;
  onSaveConfig: (engine: string, newConfig: SgbdConfig) => void;
}

const SGBD_NAMES: Record<string, string> = {
  mysql: 'MySQL',
  sqlserver: 'SQL Server',
  postgresql: 'PostgreSQL',
  mongodb: 'MongoDB',
  cassandra: 'Cassandra'
};

export default function ConfigModal({ isOpen, onClose, configs, onSaveConfig }: ConfigModalProps) {
  const [activeEngine, setActiveEngine] = useState<string>('mysql');
  const [currentConfig, setCurrentConfig] = useState<SgbdConfig>(configs[activeEngine] || {
    engine: 'mysql', host: 'localhost', port: '3308', user: 'root', password: '', database: 'dbejemplo', query: ''
  });
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  if (!isOpen) return null;

  const handleSelectEngine = (engine: string) => {
    setActiveEngine(engine);
    setCurrentConfig(configs[engine] || {
      engine, host: 'localhost', port: '3306', user: 'root', password: '', database: '', query: ''
    });
    setTestResult(null);
  };

  const handleChange = (field: keyof SgbdConfig, value: string) => {
    setCurrentConfig(prev => ({ ...prev, [field]: value }));
    setTestResult(null);
  };

  const handleSave = () => {
    onSaveConfig(activeEngine, currentConfig);
    setTestResult({ success: true, message: `Configuración guardada para ${SGBD_NAMES[activeEngine]}.` });
    setTimeout(() => {
      onClose();
    }, 1000);
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch('/api/test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentConfig)
      });
      const data = await res.json();
      if (data.success) {
        setTestResult({ success: true, message: data.message });
      } else {
        setTestResult({ success: false, message: data.error || 'Fallo de conexión' });
      }
    } catch (err: any) {
      setTestResult({ success: false, message: err.message || 'Error de red' });
    }
    setTesting(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-[#13151a] border border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-slate-900/80 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-violet-500/10 rounded-lg border border-violet-500/20 text-violet-400">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-wide">Menú de Configuraciones de SGBD</h2>
              <p className="text-xs text-slate-400">Personaliza y conecta parámetros para cada gestor de base de datos</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Engine Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 px-6 overflow-x-auto">
          {Object.keys(SGBD_NAMES).map((engineKey) => (
            <button
              key={engineKey}
              onClick={() => handleSelectEngine(engineKey)}
              className={`px-4 py-3 text-sm font-semibold whitespace-nowrap border-b-2 transition-all ${
                activeEngine === engineKey
                  ? 'border-violet-500 text-violet-400 bg-violet-500/5'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
              }`}
            >
              {SGBD_NAMES[engineKey]}
            </button>
          ))}
        </div>

        {/* Form Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1 flex items-center gap-1.5">
                <Server className="w-3.5 h-3.5 text-violet-400" /> Host / Dirección IP
              </label>
              <input
                type="text"
                value={currentConfig.host}
                onChange={(e) => handleChange('host', e.target.value)}
                className="w-full bg-[#0a0b0e] border border-slate-700 rounded-xl px-3 py-2 text-sm font-mono text-slate-200 outline-none focus:border-violet-500 transition-colors"
                placeholder="localhost o 10.10.0.X"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1 flex items-center gap-1.5">
                <Plug className="w-3.5 h-3.5 text-violet-400" /> Puerto
              </label>
              <input
                type="text"
                value={currentConfig.port}
                onChange={(e) => handleChange('port', e.target.value)}
                className="w-full bg-[#0a0b0e] border border-slate-700 rounded-xl px-3 py-2 text-sm font-mono text-slate-200 outline-none focus:border-violet-500 transition-colors"
                placeholder="3306"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-violet-400" /> Usuario Principal
              </label>
              <input
                type="text"
                value={currentConfig.user}
                onChange={(e) => handleChange('user', e.target.value)}
                className="w-full bg-[#0a0b0e] border border-slate-700 rounded-xl px-3 py-2 text-sm font-mono text-slate-200 outline-none focus:border-violet-500 transition-colors"
                placeholder="root"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-violet-400" /> Contraseña
              </label>
              <input
                type="password"
                value={currentConfig.password || ''}
                onChange={(e) => handleChange('password', e.target.value)}
                className="w-full bg-[#0a0b0e] border border-slate-700 rounded-xl px-3 py-2 text-sm font-mono text-slate-200 outline-none focus:border-violet-500 transition-colors"
                placeholder="••••••••"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-slate-400 mb-1 flex items-center gap-1.5">
                <DbIcon className="w-3.5 h-3.5 text-violet-400" /> Base de Datos / Keyspace Predeterminado
              </label>
              <input
                type="text"
                value={currentConfig.database}
                onChange={(e) => handleChange('database', e.target.value)}
                className="w-full bg-[#0a0b0e] border border-slate-700 rounded-xl px-3 py-2 text-sm font-mono text-slate-200 outline-none focus:border-violet-500 transition-colors"
                placeholder="dbejemplo"
              />
            </div>
          </div>

          {/* Test connection results */}
          {testResult && (
            <div className={`p-3.5 rounded-xl border flex items-center gap-3 text-sm animate-in fade-in ${
              testResult.success
                ? 'bg-emerald-950/40 border-emerald-600/30 text-emerald-300'
                : 'bg-rose-950/40 border-rose-600/30 text-rose-300'
            }`}>
              {testResult.success ? <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" /> : <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />}
              <p className="font-mono text-xs">{testResult.message}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-900/80 px-6 py-4 border-t border-slate-800 flex items-center justify-between gap-4">
          <button
            onClick={handleTestConnection}
            disabled={testing}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-2 border border-slate-700 transition-colors disabled:opacity-50"
          >
            {testing ? <Loader2 className="w-4 h-4 animate-spin text-violet-400" /> : <Plug className="w-4 h-4 text-violet-400" />}
            Probar Conexión
          </button>

          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-violet-900/30 transition-colors"
            >
              Guardar Cambios
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
