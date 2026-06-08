import { Trash2, PlusCircle, Filter, Database, Zap } from 'lucide-react';

interface VisualCrudProps {
  visualCrud: any;
  setVisualCrud: (val: any) => void;
  currentTable: string;
  currentAction: string;
  availableTables: string[];
  availableActions: string[];
  handleFieldChange: (index: number, key: 'column' | 'value', val: string) => void;
  removeField: (index: number) => void;
}

export default function VisualCrud({ visualCrud, setVisualCrud, currentTable, currentAction, availableTables, availableActions, handleFieldChange, removeField }: VisualCrudProps) {
  return (
    <div className="flex flex-col gap-4 min-h-[96px]">
      {/* Cabecera de Selección */}
      <div className="flex gap-3">
        <div className="flex-1 flex flex-col gap-1.5">
          <label className="text-[10px] text-slate-400 uppercase font-bold tracking-wider flex items-center gap-1.5"><Database className="w-3 h-3"/> Tabla Destino</label>
          <select value={currentTable} onChange={e => setVisualCrud({...visualCrud, table: e.target.value})} className="bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-slate-300 outline-none focus:border-fuchsia-500 shadow-sm transition-colors">
            {availableTables.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div className="w-1/3 flex flex-col gap-1.5">
          <label className="text-[10px] text-slate-400 uppercase font-bold tracking-wider flex items-center gap-1.5"><Zap className="w-3 h-3"/> Acción</label>
          <select value={currentAction} onChange={e => setVisualCrud({...visualCrud, action: e.target.value})} className="bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-slate-300 outline-none focus:border-fuchsia-500 font-bold text-center shadow-sm transition-colors">
            {availableActions.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>
      </div>

      {(currentAction === 'INSERT' || currentAction === 'UPDATE') && (
        <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-3 flex flex-col gap-2.5 shadow-inner">
          <label className="text-xs text-violet-400 font-semibold flex items-center gap-1.5">
            <PlusCircle className="w-3.5 h-3.5"/> Valores a {currentAction === 'INSERT' ? 'insertar' : 'actualizar'}
          </label>
          {visualCrud.fields.map((f: any, i: number) => (
            <div key={i} className="flex gap-2 items-center">
              <input placeholder="Columna (ej. nombre)" value={f.column} onChange={e => handleFieldChange(i, 'column', e.target.value)} className="bg-[#0a0b0e] border border-slate-700 rounded-lg p-2 text-xs text-slate-300 flex-1 outline-none focus:border-violet-500 transition-colors" />
              <input placeholder="Valor (ej. Juan)" value={f.value} onChange={e => handleFieldChange(i, 'value', e.target.value)} className="bg-[#0a0b0e] border border-slate-700 rounded-lg p-2 text-xs text-slate-300 flex-1 outline-none focus:border-violet-500 transition-colors" />
              {visualCrud.fields.length > 1 && (<button onClick={() => removeField(i)} title="Eliminar campo" className="text-red-400 hover:text-red-300 hover:bg-red-400/10 p-1 rounded transition-colors"><Trash2 className="w-4 h-4"/></button>)}
            </div>
          ))}
          <button onClick={() => setVisualCrud({ ...visualCrud, fields: [...visualCrud.fields, { column: '', value: '' }] })} className="text-[10px] font-medium bg-violet-500/10 hover:bg-violet-500/20 text-violet-300 border border-violet-500/20 px-3 py-1.5 rounded-lg transition-colors w-fit flex items-center gap-1 mt-1">
            <PlusCircle className="w-3 h-3" /> Añadir otra columna
          </button>
        </div>
      )}

      {(currentAction === 'UPDATE' || currentAction === 'DELETE') && (
        <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-3 flex flex-col gap-2.5 shadow-inner">
          <label className="text-xs text-coral-400 font-semibold flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5"/> Condición (Filtro WHERE)
          </label>
          <div className="flex gap-2 items-center">
            <input placeholder="Columna (ej. id_cliente)" value={visualCrud.conditionColumn} onChange={e => setVisualCrud({...visualCrud, conditionColumn: e.target.value})} className="bg-[#0a0b0e] border border-slate-700 rounded-lg p-2 text-xs text-slate-300 flex-1 outline-none focus:border-coral-500 transition-colors" />
            <span className="bg-slate-900 border border-slate-800 px-2 py-1.5 rounded-md text-slate-400 font-mono font-bold shadow-sm">=</span>
            <input placeholder="Valor (ej. 1)" value={visualCrud.conditionValue} onChange={e => setVisualCrud({...visualCrud, conditionValue: e.target.value})} className="bg-[#0a0b0e] border border-slate-700 rounded-lg p-2 text-xs text-slate-300 flex-1 outline-none focus:border-coral-500 transition-colors" />
          </div>
        </div>
      )}
    </div>
  );
}
