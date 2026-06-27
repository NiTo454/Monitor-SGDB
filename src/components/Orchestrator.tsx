'use client'

import { useState, useEffect } from 'react';
import { Database, Play, Square, Loader2, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { controlContainer, checkContainerStatus, getContainerStats } from '../actions/docker';

const DATABASES = [
  { id: 'mysql', name: 'MySQL', port: '3308', color: 'text-sky-400' },
  { id: 'sqlserver', name: 'SQL Server', port: '1433', color: 'text-red-400' },
  { id: 'postgresql', name: 'PostgreSQL', port: '5433', color: 'text-blue-400' },
  { id: 'mongodb', name: 'MongoDB', port: '27017', color: 'text-emerald-400' },
  { id: 'cassandra', name: 'Cassandra', port: '9042', color: 'text-cyan-400' },
];

export default function Orchestrator() {
  const [status, setStatus] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [stats, setStats] = useState<Record<string, { cpu: string, ram: string }>>({});
  const [notification, setNotification] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

  const refreshStatus = async () => {
    const statusPromises = DATABASES.map(async (db) => {
      const isRunning = await checkContainerStatus(db.id);
      return { id: db.id, isRunning };
    });
    const results = await Promise.all(statusPromises);
    const newStatus: Record<string, boolean> = {};
    results.forEach(res => { newStatus[res.id] = res.isRunning; });
    setStatus(newStatus);
  };

  useEffect(() => {
    refreshStatus();
  }, []);

  useEffect(() => {
    let mounted = true;

    const fetchStats = async () => {
      const promises = DATABASES.map(async (db) => {
        if (status[db.id]) {
          const containerStats = await getContainerStats(db.id);
          return { id: db.id, cpu: containerStats.success ? containerStats.cpu : '0.00%', ram: containerStats.success ? containerStats.ram : '0B' };
        } else {
          return { id: db.id, cpu: '0.00%', ram: '0B' };
        }
      });

      const results = await Promise.all(promises);

      if (mounted) {
        const newStats: Record<string, { cpu: string, ram: string }> = {};
        results.forEach(res => { newStats[res.id] = { cpu: res.cpu, ram: res.ram }; });
        setStats(newStats);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 4000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [status]);

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleToggle = async (service: string, isRunning: boolean) => {
    setLoading(prev => ({ ...prev, [service]: true }));
    const action = isRunning ? 'stop' : 'start';

    const result = await controlContainer(service, action);

    if (result.success) {
      setStatus(prev => ({ ...prev, [service]: !isRunning }));
      showNotification(`Contenedor de ${service} ${action === 'start' ? 'iniciado' : 'detenido'} correctamente.`, 'success');
    } else {
      showNotification(`Error al operar contenedor ${service}. Verifica Docker Compose.`, 'error');
    }

    setLoading(prev => ({ ...prev, [service]: false }));
  };

  return (
    <div className="relative">
      <div className="flex justify-between items-center mb-4">
        <span className="text-xs text-slate-400">Estado en Vivo de Contenedores Docker</span>
        <button onClick={refreshStatus} className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors">
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3.5">
        {DATABASES.map((db) => {
          const isRunning = status[db.id] || false;
          const isLoading = loading[db.id] || false;

          return (
            <div
              key={db.id}
              className={`flex items-center justify-between p-3.5 rounded-xl border transition-all duration-300 ${
                isRunning
                  ? 'bg-slate-900/70 border-violet-500/40 shadow-[0_0_15px_rgba(139,92,246,0.15)]'
                  : 'bg-slate-900/20 border-slate-800/80 opacity-75'
              }`}
            >
              <div className="flex items-center gap-3">
                <Database className={`w-5 h-5 ${isRunning ? db.color : 'text-slate-600'}`} />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-200">{db.name}</h3>
                    <span className={`w-2 h-2 rounded-full ${isRunning ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'}`} />
                  </div>
                  <div className="flex flex-wrap gap-2 text-[11px] font-mono mt-0.5">
                    <span className="text-slate-500">Port: {db.port}</span>
                    {isRunning && stats[db.id] && (
                      <>
                        <span className="text-cyan-400">CPU: {stats[db.id].cpu}</span>
                        <span className="text-fuchsia-400">RAM: {stats[db.id].ram}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleToggle(db.id, isRunning)}
                disabled={isLoading}
                className={`p-2 rounded-lg transition-all ${
                  isLoading ? 'bg-slate-800 text-slate-400 cursor-not-allowed'
                  : isRunning
                    ? 'bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20'
                    : 'bg-violet-600/20 text-violet-300 hover:bg-violet-600/40 border border-violet-500/30'
                }`}
                title={isRunning ? 'Detener Contenedor' : 'Iniciar Contenedor'}
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : isRunning ? (
                  <Square className="w-4 h-4 fill-current" />
                ) : (
                  <Play className="w-4 h-4 fill-current" />
                )}
              </button>
            </div>
          );
        })}
      </div>

      {notification && (
        <div className={`fixed bottom-8 right-8 flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-2xl border backdrop-blur-md animate-in slide-in-from-bottom-5 fade-in duration-300 z-50 ${
          notification.type === 'success'
            ? 'bg-violet-950/90 border-violet-500 text-violet-100'
            : 'bg-rose-950/90 border-rose-500 text-rose-100'
        }`}>
          {notification.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-violet-400" /> : <AlertCircle className="w-5 h-5 text-rose-400" />}
          <p className="font-medium text-xs">{notification.message}</p>
        </div>
      )}
    </div>
  );
}
