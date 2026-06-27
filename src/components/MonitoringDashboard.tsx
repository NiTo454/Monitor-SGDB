'use client'

import { useState, useEffect } from 'react';
import { Activity, Database, Server, RefreshCw, Layers, HardDrive, Cpu, Radio, Table } from 'lucide-react';
import { SgbdConfig } from './ConfigModal';

interface TelemetryMetrics {
  status: 'online' | 'offline';
  latencyMs: number;
  version: string;
  uptime: string;
  activeConnections: number;
  databasesCount: number;
  tablesCount: number;
  sizeBytes: number;
  tablesList: string[];
}

interface MonitoringDashboardProps {
  config: SgbdConfig;
  onSelectTableQuery?: (tableName: string) => void;
}

const SGBD_TITLES: Record<string, string> = {
  mysql: 'MySQL Server',
  sqlserver: 'Microsoft SQL Server',
  postgresql: 'PostgreSQL Database',
  mongodb: 'MongoDB NoSQL',
  cassandra: 'Apache Cassandra'
};

export default function MonitoringDashboard({ config, onSelectTableQuery }: MonitoringDashboardProps) {
  const [metrics, setMetrics] = useState<TelemetryMetrics | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchMetrics = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/monitor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
      const data = await res.json();
      if (data.success && data.metrics) {
        setMetrics(data.metrics);
      } else {
        setMetrics({
          status: 'offline', latencyMs: 0, version: 'Desconocido', uptime: 'N/A',
          activeConnections: 0, databasesCount: 0, tablesCount: 0, sizeBytes: 0, tablesList: []
        });
      }
    } catch (e) {
      setMetrics({
        status: 'offline', latencyMs: 0, version: 'Desconocido', uptime: 'N/A',
        activeConnections: 0, databasesCount: 0, tablesCount: 0, sizeBytes: 0, tablesList: []
      });
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchMetrics();
    const pollInterval = metrics?.status === 'offline' ? 10000 : 5000;
    const interval = setInterval(fetchMetrics, pollInterval);
    return () => clearInterval(interval);
  }, [config.engine, config.host, config.port, config.user, config.database, metrics?.status]);

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const isOnline = metrics?.status === 'online';

  return (
    <div className="flex flex-col bg-[#13151a] border border-slate-800 rounded-xl overflow-hidden shadow-lg h-full">
      
      {/* Header del Dashboard */}
      <div className="bg-slate-900/80 p-3.5 border-b border-slate-800 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] animate-pulse' : 'bg-rose-500'}`} />
          <div>
            <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
              {SGBD_TITLES[config.engine] || config.engine.toUpperCase()}
            </h3>
            <p className="text-[11px] text-slate-400 font-mono">
              {config.host}:{config.port} ({config.database || 'sin BD'})
            </p>
          </div>
        </div>

        <button
          onClick={fetchMetrics}
          disabled={loading}
          className="p-1.5 text-slate-400 hover:text-violet-400 hover:bg-violet-500/10 rounded-lg transition-all disabled:opacity-50"
          title="Actualizar Métricas"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-violet-400' : ''}`} />
        </button>
      </div>

      {/* Contenido Telemetría */}
      <div className="p-4 overflow-y-auto flex-1 space-y-4">
        
        {/* Metric Cards Grid */}
        <div className="grid grid-cols-2 gap-3">
          
          {/* Status Card */}
          <div className="bg-slate-900/50 border border-slate-800 p-3 rounded-xl">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[11px] font-medium">Estado del SGBD</span>
              <Radio className={`w-3.5 h-3.5 ${isOnline ? 'text-emerald-400' : 'text-rose-400'}`} />
            </div>
            <div className="text-base font-bold font-mono">
              {isOnline ? (
                <span className="text-emerald-400">ONLINE ({metrics?.latencyMs}ms)</span>
              ) : (
                <span className="text-rose-400">OFFLINE</span>
              )}
            </div>
            <div className="text-[10px] text-slate-500 mt-1 font-mono truncate">Ver: {metrics?.version}</div>
          </div>

          {/* Connections Card */}
          <div className="bg-slate-900/50 border border-slate-800 p-3 rounded-xl">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[11px] font-medium">Conexiones Activas</span>
              <Activity className="w-3.5 h-3.5 text-violet-400" />
            </div>
            <div className="text-lg font-bold font-mono text-violet-300">
              {metrics?.activeConnections || 0}
            </div>
            <div className="text-[10px] text-slate-500 mt-1 font-mono">Uptime: {metrics?.uptime}</div>
          </div>

          {/* Databases & Tables Count */}
          <div className="bg-slate-900/50 border border-slate-800 p-3 rounded-xl">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[11px] font-medium">BDs / Tablas</span>
              <Layers className="w-3.5 h-3.5 text-fuchsia-400" />
            </div>
            <div className="text-base font-bold font-mono text-fuchsia-300">
              {metrics?.databasesCount || 0} BDs | {metrics?.tablesCount || 0} Tablas
            </div>
            <div className="text-[10px] text-slate-500 mt-1 font-mono">Total Objetos</div>
          </div>

          {/* DB Size */}
          <div className="bg-slate-900/50 border border-slate-800 p-3 rounded-xl">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[11px] font-medium">Tamaño Estimado</span>
              <HardDrive className="w-3.5 h-3.5 text-cyan-400" />
            </div>
            <div className="text-base font-bold font-mono text-cyan-300">
              {formatSize(metrics?.sizeBytes || 0)}
            </div>
            <div className="text-[10px] text-slate-500 mt-1 font-mono">Espacio en Disco</div>
          </div>

        </div>

        {/* List of Tables / Collections */}
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-3">
          <h4 className="text-xs font-bold text-slate-300 mb-2 flex items-center justify-between">
            <span className="flex items-center gap-1.5"><Table className="w-3.5 h-3.5 text-violet-400" /> Esquema / Objetos en "{config.database || 'N/A'}"</span>
            <span className="text-[10px] text-slate-500 font-normal">Clic para consultar</span>
          </h4>

          {metrics?.tablesList && metrics.tablesList.length > 0 ? (
            <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-1">
              {metrics.tablesList.map((tbl) => (
                <button
                  key={tbl}
                  onClick={() => onSelectTableQuery && onSelectTableQuery(tbl)}
                  className="px-2.5 py-1 bg-slate-800/80 hover:bg-violet-600/30 hover:border-violet-500/50 border border-slate-700/60 rounded-lg text-xs font-mono text-slate-300 transition-all text-left truncate max-w-[140px]"
                  title={`Generar SELECT para ${tbl}`}
                >
                  {tbl}
                </button>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic py-2 text-center">
              {isOnline ? 'No se encontraron tablas o colecciones en esta BD.' : 'SGBD inaccesible o sin base de datos seleccionada.'}
            </p>
          )}
        </div>

      </div>
    </div>
  );
}
