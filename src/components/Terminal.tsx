'use client'

import { useState } from 'react';
import { Send, Cpu, TerminalSquare, Trash2, Download, Upload, Play, Database, Server } from 'lucide-react';
import ConnectionForm from './ConnectionForm';
import MonitoringDashboard from './MonitoringDashboard';
import VisualCrud from './VisualCrud';
import TerminalLogs from './TerminalLogs';
import ConfigModal from './ConfigModal';
import { useTerminalLogic } from '../hooks/useTerminalLogic';

export default function Terminal() {
  const [isConfigOpen, setIsConfigOpen] = useState(false);

  const {
    configs, updateEngineConfig,
    formData, handleInputChange, updateDatabaseSelection,
    schemaDatabases, schemaTables, schemaColumns, loadingSchema, fetchTables,
    dbLogs, clearDbLogs, dbLogsEndRef,
    inputMode, setInputMode, setQueryShortcut,
    visualCrud, setVisualCrud,
    isExecuting, isBackingUp, isUploading,
    executeVisualCrud, executeCommand, downloadBackup, uploadToFtp, handleKeyDownCommand
  } = useTerminalLogic();

  const handleTableQuerySelect = (tableName: string) => {
    let queryStr = '';
    if (formData.engine === 'mysql' || formData.engine === 'postgresql' || formData.engine === 'sqlserver') {
      queryStr = `SELECT * FROM ${tableName} LIMIT 50;`;
    } else if (formData.engine === 'mongodb') {
      queryStr = `{ "find": "${tableName}", "limit": 50 }`;
    } else if (formData.engine === 'cassandra') {
      queryStr = `SELECT * FROM ${tableName} LIMIT 50;`;
    }
    setQueryShortcut(queryStr);
  };

  const handleQuickAction = (actionType: string) => {
    let queryStr = '';
    if (formData.engine === 'mysql') {
      if (actionType === 'processes') queryStr = 'SHOW FULL PROCESSLIST;';
      if (actionType === 'tables') queryStr = 'SHOW TABLES;';
      if (actionType === 'status') queryStr = 'SHOW GLOBAL STATUS LIKE "Threads_%";';
    } else if (formData.engine === 'postgresql') {
      if (actionType === 'processes') queryStr = 'SELECT pid, usename, state, query FROM pg_stat_activity WHERE state IS NOT NULL;';
      if (actionType === 'tables') queryStr = "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';";
      if (actionType === 'status') queryStr = 'SELECT name, setting, unit FROM pg_settings WHERE name LIKE \'%conn%\';';
    } else if (formData.engine === 'sqlserver') {
      if (actionType === 'processes') queryStr = 'SELECT session_id, status, login_name, host_name, program_name FROM sys.dm_exec_sessions WHERE is_user_process = 1;';
      if (actionType === 'tables') queryStr = 'SELECT name FROM sys.tables;';
      if (actionType === 'status') queryStr = 'SELECT @@VERSION as Version;';
    } else if (formData.engine === 'mongodb') {
      if (actionType === 'processes') queryStr = '{ "currentOp": 1 }';
      if (actionType === 'tables') queryStr = 'show collections';
      if (actionType === 'status') queryStr = '{ "serverStatus": 1 }';
    } else if (formData.engine === 'cassandra') {
      if (actionType === 'processes') queryStr = 'SELECT * FROM system.local;';
      if (actionType === 'tables') queryStr = 'SELECT table_name FROM system_schema.tables;';
      if (actionType === 'status') queryStr = 'SELECT cluster_name, release_version FROM system.local;';
    }

    if (queryStr) setQueryShortcut(queryStr);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Formulario de Conexión y Selector SGBD */}
      <ConnectionForm
        formData={formData}
        handleInputChange={handleInputChange}
        isDisabled={isExecuting || isBackingUp || isUploading}
        onOpenConfig={() => setIsConfigOpen(true)}
      />

      {/* Modal de Configuraciones */}
      <ConfigModal
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
        configs={configs}
        onSaveConfig={updateEngineConfig}
      />

      {/* Paneles Divididos: Dashboard Monitoreo | Consola DB */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-[680px] lg:h-[740px]">

        {/* PANEL IZQUIERDO: TELEMETRÍA Y DASHBOARD */}
        <MonitoringDashboard
          config={formData}
          onSelectTableQuery={handleTableQuerySelect}
        />

        {/* PANEL DERECHO: CONSOLA DE EJECUCIÓN SGBD */}
        <div className="flex flex-col bg-[#13151a] border border-slate-800 rounded-xl overflow-hidden shadow-lg h-full">
          
          {/* Top Header */}
          <div className="bg-slate-900/80 p-3.5 border-b border-slate-800 flex items-center justify-between gap-2 shrink-0">
            <div className="flex items-center gap-2">
              <TerminalSquare className="w-4 h-4 text-violet-400" />
              <h3 className="font-bold text-slate-100 text-sm">Consola Interactiva SGBD</h3>
            </div>
            <button
              onClick={clearDbLogs}
              title="Limpiar Consola"
              className="p-1.5 text-slate-400 hover:text-violet-400 hover:bg-violet-500/10 rounded-lg transition-all"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          {/* Logs Terminal */}
          <div className="flex-1 min-h-[160px] overflow-hidden flex flex-col">
            <TerminalLogs dbLogs={dbLogs} dbLogsEndRef={dbLogsEndRef} />
          </div>

          {/* Input & Action Area (Scrollable Area) */}
          <div className="p-4 bg-slate-900/90 border-t border-slate-800 flex flex-col gap-3 overflow-y-auto max-h-[480px] shrink-0">
            
            {/* Quick Actions Shortcuts */}
            <div className="flex items-center justify-between gap-2 border-b border-slate-800/80 pb-2 shrink-0">
              <div className="flex gap-2 text-xs">
                <button onClick={() => setInputMode('console')} className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${inputMode === 'console' ? 'bg-violet-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}>
                  Consola Libre
                </button>
                <button onClick={() => setInputMode('visual')} className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${inputMode === 'visual' ? 'bg-violet-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}>
                  Asistente Visual (CRUD)
                </button>
              </div>

              <div className="flex gap-1.5 overflow-x-auto">
                <button onClick={() => handleQuickAction('processes')} className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-[11px] font-mono text-cyan-300 rounded border border-slate-700 transition-colors" title="Ver conexiones / procesos activos">
                  Procesos
                </button>
                <button onClick={() => handleQuickAction('tables')} className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-[11px] font-mono text-fuchsia-300 rounded border border-slate-700 transition-colors" title="Listar tablas o colecciones">
                  Tablas
                </button>
                <button onClick={() => handleQuickAction('status')} className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-[11px] font-mono text-emerald-300 rounded border border-slate-700 transition-colors" title="Estado general del servidor">
                  Estado
                </button>
              </div>
            </div>

            {/* Input fields */}
            <div className="flex-1">
              {inputMode === 'visual' ? (
                <VisualCrud
                  visualCrud={visualCrud}
                  setVisualCrud={setVisualCrud}
                  databases={schemaDatabases}
                  selectedDatabase={formData.database}
                  onSelectDatabase={updateDatabaseSelection}
                  tables={schemaTables}
                  columns={schemaColumns}
                  loadingSchema={loadingSchema}
                  onRefreshSchema={fetchTables}
                />
              ) : (
                <textarea
                  name="query"
                  placeholder={`Escribe tu consulta para ${formData.engine.toUpperCase()}...\n(Ej: SELECT * FROM tabla; o comando JSON para MongoDB)\nUsa Ctrl + Enter para ejecutar.`}
                  value={formData.query}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDownCommand}
                  className="w-full h-28 bg-[#0a0b0e] border border-slate-700 rounded-xl p-3 text-xs font-mono text-violet-300 outline-none focus:border-violet-500 resize-none transition-colors"
                />
              )}
            </div>

            {/* Bottom buttons */}
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800/60 shrink-0">
              {formData.engine === 'mysql' && (
                <button
                  onClick={downloadBackup}
                  disabled={isBackingUp}
                  title="Descargar respaldo SQL"
                  className="bg-emerald-800/30 hover:bg-emerald-800/50 text-emerald-300 border border-emerald-600/30 px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 text-xs font-semibold transition-colors disabled:opacity-50"
                >
                  {isBackingUp ? <Cpu className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                  Backup SQL
                </button>
              )}
              {formData.engine === 'mysql' && (
                <button
                  onClick={uploadToFtp}
                  disabled={isUploading}
                  title="Subir a FTP"
                  className="bg-sky-800/30 hover:bg-sky-800/50 text-sky-300 border border-sky-600/30 px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 text-xs font-semibold transition-colors disabled:opacity-50"
                >
                  {isUploading ? <Cpu className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                  Subir FTP
                </button>
              )}
              <button
                onClick={() => inputMode === 'visual' ? executeVisualCrud() : executeCommand()}
                disabled={isExecuting}
                className="bg-violet-600 hover:bg-violet-500 text-white px-5 py-2 rounded-xl flex items-center gap-2 text-xs font-bold transition-colors disabled:opacity-50 shadow-lg shadow-violet-900/30"
              >
                {isExecuting ? <Cpu className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Ejecutar Consulta
              </button>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
