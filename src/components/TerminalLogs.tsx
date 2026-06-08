import { RefObject } from 'react';

interface TerminalLogsProps {
  dbLogs: { text: string; type: 'info' | 'success' | 'error' | 'warn' | 'ai' | 'user'; data?: any[] }[];
  dbLogsEndRef: RefObject<HTMLDivElement | null>;
}

export default function TerminalLogs({ dbLogs, dbLogsEndRef }: TerminalLogsProps) {
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-3 font-mono text-xs shadow-inner">
      {dbLogs.map((log, index) => (
        <div key={index} className="flex flex-col gap-1 p-1 rounded">
          <div className="flex gap-3 items-start">
            <span className="text-slate-600 shrink-0 mt-0.5">[{new Date().toLocaleTimeString()}]</span>
            <div className={`break-words whitespace-pre-wrap ${
              log.type === 'error' ? 'text-coral-500' :
              log.type === 'success' ? 'text-green-400' :
              log.type === 'warn' ? 'text-yellow-400' :
              log.type === 'user' ? 'text-cyan-400 font-semibold' :
              'text-slate-400'
            }`}>
              {log.text}
            </div>
          </div>

          {log.data && Array.isArray(log.data) && log.data.length > 0 && typeof log.data[0] === 'object' && log.data[0] !== null && (
            <div className="overflow-x-auto mt-2 ml-14 border border-slate-700/50 rounded bg-[#0f111a]">
              <table className="min-w-full text-left border-collapse">
                <thead>
                  <tr>
                    {Object.keys(log.data[0]).map((key) => (
                      <th key={key} className="border-b border-slate-700 bg-slate-800/80 p-2 font-semibold text-slate-300 whitespace-nowrap">{key}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {log.data.map((row: any, i: number) => (
                    <tr key={i} className="hover:bg-slate-800/50 transition-colors">
                      {Object.values(row).map((val: any, j: number) => (
                        <td key={j} className="border-b border-slate-800 p-2 text-slate-400 whitespace-nowrap">
                          {val !== null && val !== undefined ? (typeof val === 'object' ? JSON.stringify(val) : String(val)) : <span className="italic text-slate-600">null</span>}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ))}
      <div ref={dbLogsEndRef} />
    </div>
  );
}
