import { Bot, Trash2, Cpu, Sparkles, Copy } from 'lucide-react';
import { RefObject } from 'react';

interface AiChatProps {
  chatLogs: { text: string; type: 'user' | 'ai' | 'error' | 'info' }[];
  aiPrompt: string;
  setAiPrompt: (val: string) => void;
  askGemini: () => void;
  isAsking: boolean;
  clearChatLogs: () => void;
  handleUseCommand: (cmd: string) => void;
  chatLogsEndRef: RefObject<HTMLDivElement | null>;
  engine: string;
}

export default function AiChat({ chatLogs, aiPrompt, setAiPrompt, askGemini, isAsking, clearChatLogs, handleUseCommand, chatLogsEndRef, engine }: AiChatProps) {
  return (
    <div className="flex flex-col bg-[#0a0b0e] border border-slate-800 rounded-xl overflow-hidden shadow-lg h-full">
      <div className="bg-slate-900/60 p-3 border-b border-slate-800 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-1">
          <Bot className="w-4 h-4 text-fuchsia-400" />
          <h3 className="font-semibold text-fuchsia-100 text-sm">Asistente Glitch IA</h3>
        </div>
        <button onClick={clearChatLogs} title="Limpiar Chat" className="p-1 text-slate-500 hover:text-fuchsia-400 hover:bg-fuchsia-500/10 rounded transition-all">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 font-sans text-sm">
        {chatLogs.map((log, index) => (
          <div key={index} className={`flex ${log.type === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-3 rounded-xl break-words whitespace-pre-wrap ${
              log.type === 'user' ? 'bg-violet-600 text-white' :
              log.type === 'error' ? 'bg-red-900/40 text-red-200 border border-red-800/50' :
              log.type === 'info' ? 'bg-transparent text-slate-500 text-xs italic' :
              'bg-slate-800 text-slate-200 border border-slate-700/50 shadow-md'
            }`}>
              {log.text}
              {log.type === 'ai' && (
                <button
                  onClick={() => handleUseCommand(log.text)}
                  className="mt-3 flex items-center gap-1.5 px-3 py-1.5 bg-fuchsia-500/20 hover:bg-fuchsia-500/30 text-fuchsia-300 text-xs font-medium rounded-lg transition-colors border border-fuchsia-500/30"
                >
                  <Copy className="w-3.5 h-3.5" />
                  Usar este comando
                </button>
              )}
            </div>
          </div>
        ))}
        <div ref={chatLogsEndRef} />
      </div>

      <div className="p-3 bg-slate-900/60 border-t border-slate-800 flex gap-2">
        <input value={aiPrompt} onChange={(e) => setAiPrompt(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && askGemini()} placeholder={`Pregunta a Glitch sobre ${engine}...`} className="flex-1 bg-black border border-slate-700 rounded-lg p-2.5 text-sm outline-none focus:border-fuchsia-500 text-slate-200 transition-colors" />
        <button onClick={askGemini} disabled={isAsking} className="bg-slate-800 hover:bg-slate-700 text-fuchsia-400 border border-fuchsia-500/30 px-4 py-2 rounded-lg flex items-center justify-center transition-colors disabled:opacity-50">
          {isAsking ? <Cpu className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}
