'use client'

import { Send, Cpu, TerminalSquare, Trash2, Download, Upload } from 'lucide-react';
import ConnectionForm from './ConnectionForm';
import AiChat from './AiChat';
import VisualCrud from './VisualCrud';
import TerminalLogs from './TerminalLogs';
import { useTerminalLogic } from '../hooks/useTerminalLogic';

export default function Terminal() {
  const {
    formData, handleInputChange,
    dbLogs, clearDbLogs, dbLogsEndRef,
    chatLogs, clearChatLogs, chatLogsEndRef,
    aiPrompt, setAiPrompt, askGemini, isAsking, handleUseCommand,
    inputMode, setInputMode,
    visualCrud, setVisualCrud, availableTables, availableActions, currentTable, currentAction, handleFieldChange, removeField,
    isExecuting, isBackingUp, isUploading,
    executeVisualCrud, executeCommand, downloadBackup, uploadToFtp, handleKeyDownCommand
  } = useTerminalLogic();

  return (
    <div className="flex flex-col gap-6">
      {/* Formulario de Conexión Mejorado */}
      <ConnectionForm
        formData={formData}
        handleInputChange={handleInputChange}
        isDisabled={isExecuting || isBackingUp || isUploading}
      />

      {/* Paneles Divididos: Chat IA | Terminal DB */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[600px]">

        {/* PANEL IZQUIERDO: CHAT IA */}
        <AiChat
          chatLogs={chatLogs}
          aiPrompt={aiPrompt}
          setAiPrompt={setAiPrompt}
          askGemini={askGemini}
          isAsking={isAsking}
          clearChatLogs={clearChatLogs}
          handleUseCommand={handleUseCommand}
          chatLogsEndRef={chatLogsEndRef}
          engine={formData.engine}
        />

        {/* PANEL DERECHO: TERMINAL SGBD */}
        <div className="flex flex-col bg-black border border-slate-800 rounded-xl overflow-hidden shadow-lg h-full">
          <div className="bg-slate-900/60 p-3 border-b border-slate-800 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 flex-1">
              <TerminalSquare className="w-4 h-4 text-violet-400" />
              <h3 className="font-semibold text-violet-100 text-sm">Ejecución SGBD</h3>
            </div>
            <button onClick={clearDbLogs} title="Limpiar Terminal" className="p-1 text-slate-500 hover:text-violet-400 hover:bg-violet-500/10 rounded transition-all">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          <TerminalLogs dbLogs={dbLogs} dbLogsEndRef={dbLogsEndRef} />

          <div className="p-3 bg-slate-900/60 border-t border-slate-800 flex flex-col gap-2">
            {/* Tabs Modo Consola / Modo Visual */}
            <div className="flex gap-4 border-b border-slate-800 pb-2 mb-2">
              <button onClick={() => setInputMode('visual')} className={`text-xs font-semibold px-2 py-1 transition-colors ${inputMode === 'visual' ? 'text-fuchsia-400 border-b-2 border-fuchsia-400' : 'text-slate-500 hover:text-slate-300'}`}>
                Modo Visual (Formulario)
              </button>
              <button onClick={() => setInputMode('console')} className={`text-xs font-semibold px-2 py-1 transition-colors ${inputMode === 'console' ? 'text-fuchsia-400 border-b-2 border-fuchsia-400' : 'text-slate-500 hover:text-slate-300'}`}>
                Modo Consola (SQL)
              </button>
            </div>

            {inputMode === 'visual' ? (
              <VisualCrud
                visualCrud={visualCrud}
                setVisualCrud={setVisualCrud}
                currentTable={currentTable}
                currentAction={currentAction}
                availableTables={availableTables}
                availableActions={availableActions}
                handleFieldChange={handleFieldChange}
                removeField={removeField}
              />
            ) : (
              <textarea name="query" placeholder={`Escribe tu sentencia SQL...\n(Ctrl + Enter para ejecutar)`} value={formData.query} onChange={handleInputChange} onKeyDown={handleKeyDownCommand} className="w-full h-24 bg-[#0a0b0e] border border-slate-700 rounded-xl p-3 text-sm font-mono text-violet-300 outline-none focus:border-violet-500 resize-none transition-colors" />
            )}

            <div className="flex justify-end gap-2">
              {formData.engine === 'mysql' && (
                <button
                  onClick={downloadBackup}
                  disabled={isBackingUp}
                  title="Descargar backup SQL de la BD conectada"
                  className="bg-emerald-700/30 hover:bg-emerald-700/50 text-emerald-300 border border-emerald-600/30 px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors disabled:opacity-50"
                >
                  {isBackingUp ? <Cpu className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                  Backup SQL
                </button>
              )}
              {formData.engine === 'mysql' && (
                <button
                  onClick={uploadToFtp}
                  disabled={isUploading}
                  title="Generar backup y subirlo al servidor FTP"
                  className="bg-sky-700/30 hover:bg-sky-700/50 text-sky-300 border border-sky-600/30 px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors disabled:opacity-50"
                >
                  {isUploading ? <Cpu className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  Subir a FTP
                </button>
              )}
              <button
                onClick={() => inputMode === 'visual' ? executeVisualCrud() : executeCommand()}
                disabled={isExecuting}
                className="bg-violet-600 hover:bg-violet-500 text-white px-5 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors disabled:opacity-50 shadow-md shadow-violet-900/20"
              >
                {isExecuting ? <Cpu className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Ejecutar Comando
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
