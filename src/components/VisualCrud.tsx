'use client'

import { Trash2, PlusCircle, Filter, Database as DbIcon, Zap, RefreshCw, Layers, Sparkles, Table } from 'lucide-react';

interface VisualCrudProps {
  visualCrud: any;
  setVisualCrud: (val: any) => void;
  databases: string[];
  selectedDatabase: string;
  onSelectDatabase: (db: string) => void;
  tables: string[];
  columns: string[];
  loadingSchema: boolean;
  onRefreshSchema: () => void;
}

export default function VisualCrud({
  visualCrud,
  setVisualCrud,
  databases,
  selectedDatabase,
  onSelectDatabase,
  tables,
  columns,
  loadingSchema,
  onRefreshSchema
}: VisualCrudProps) {

  const handleAddField = (columnName = '') => {
    setVisualCrud({
      ...visualCrud,
      fields: [...visualCrud.fields, { column: columnName, value: '' }]
    });
  };

  const handleFieldChange = (index: number, key: 'column' | 'value', val: string) => {
    const newFields = [...visualCrud.fields];
    newFields[index][key] = val;
    setVisualCrud({ ...visualCrud, fields: newFields });
  };

  const removeField = (index: number) => {
    const newFields = [...visualCrud.fields];
    newFields.splice(index, 1);
    setVisualCrud({ ...visualCrud, fields: newFields });
  };

  const autoFillColumns = () => {
    if (!columns || columns.length === 0) return;
    const newFields = columns.map(col => ({ column: col, value: '' }));
    setVisualCrud({ ...visualCrud, fields: newFields });
  };

  return (
    <div className="flex flex-col gap-3.5 bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5 shadow-inner">
      
      {/* Selector Dinámico de BD y Tabla */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        
        {/* Selector de BD */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center justify-between">
            <span className="flex items-center gap-1"><DbIcon className="w-3 h-3 text-violet-400" /> Base de Datos</span>
          </label>
          <select
            value={selectedDatabase}
            onChange={e => onSelectDatabase(e.target.value)}
            className="w-full bg-[#0a0b0e] border border-slate-700 rounded-lg p-2 text-xs font-semibold text-violet-300 outline-none focus:border-violet-500 transition-colors"
          >
            {databases.length > 0 ? (
              databases.map(db => <option key={db} value={db}>{db}</option>)
            ) : (
              <option value={selectedDatabase}>{selectedDatabase || 'Predeterminada'}</option>
            )}
          </select>
        </div>

        {/* Selector de Tabla */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center justify-between">
            <span className="flex items-center gap-1"><Table className="w-3 h-3 text-fuchsia-400" /> Tabla / Colección</span>
            <button
              onClick={onRefreshSchema}
              disabled={loadingSchema}
              className="text-slate-400 hover:text-white transition-colors"
              title="Recargar Esquema"
            >
              <RefreshCw className={`w-3 h-3 ${loadingSchema ? 'animate-spin text-violet-400' : ''}`} />
            </button>
          </label>
          <select
            value={visualCrud.table}
            onChange={e => setVisualCrud({ ...visualCrud, table: e.target.value })}
            className="w-full bg-[#0a0b0e] border border-slate-700 rounded-lg p-2 text-xs font-semibold text-fuchsia-300 outline-none focus:border-fuchsia-500 transition-colors"
          >
            {tables.length > 0 ? (
              tables.map(t => <option key={t} value={t}>{t}</option>)
            ) : (
              <option value="">{loadingSchema ? 'Cargando...' : 'Sin tablas disponibles'}</option>
            )}
          </select>
        </div>

        {/* Selector de Acción */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
            <Zap className="w-3 h-3 text-amber-400" /> Operación CRUD
          </label>
          <select
            value={visualCrud.action}
            onChange={e => setVisualCrud({ ...visualCrud, action: e.target.value })}
            className="w-full bg-[#0a0b0e] border border-slate-700 rounded-lg p-2 text-xs font-bold text-amber-300 outline-none focus:border-amber-500 text-center transition-colors"
          >
            <option value="SELECT">SELECT (Consultar)</option>
            <option value="INSERT">INSERT (Insertar)</option>
            <option value="UPDATE">UPDATE (Actualizar)</option>
            <option value="DELETE">DELETE (Eliminar)</option>
          </select>
        </div>

      </div>

      {/* Tags de Columnas Disponibles para clic rápido */}
      {columns.length > 0 && (
        <div className="flex flex-wrap items-center gap-1 bg-slate-900/50 p-2 rounded-lg border border-slate-800/60">
          <span className="text-[10px] font-semibold text-slate-400 mr-1 flex items-center gap-1">
            <Layers className="w-3 h-3 text-cyan-400" /> Campos detectados:
          </span>
          {columns.map(col => (
            <button
              key={col}
              onClick={() => handleAddField(col)}
              className="px-2 py-0.5 bg-slate-800 hover:bg-violet-600/30 hover:border-violet-500/50 border border-slate-700/60 rounded text-[11px] font-mono text-cyan-300 transition-all"
              title="Añadir campo al formulario"
            >
              + {col}
            </button>
          ))}
        </div>
      )}

      {/* Formulario de Campos INSERT / UPDATE */}
      {(visualCrud.action === 'INSERT' || visualCrud.action === 'UPDATE') && (
        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-3 flex flex-col gap-2 shadow-inner">
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs text-violet-300 font-bold flex items-center gap-1.5">
              <PlusCircle className="w-3.5 h-3.5 text-violet-400" /> Campos y Valores a {visualCrud.action === 'INSERT' ? 'Insertar' : 'Actualizar'}
            </label>
            {columns.length > 0 && (
              <button
                onClick={autoFillColumns}
                className="text-[10px] font-semibold text-violet-400 hover:text-violet-300 flex items-center gap-1 hover:underline"
              >
                <Sparkles className="w-3 h-3" /> Auto-rellenar columnas
              </button>
            )}
          </div>

          {visualCrud.fields.map((f: any, i: number) => (
            <div key={i} className="flex gap-2 items-center">
              <input
                list={`columns-list-${i}`}
                placeholder="Nombre del campo"
                value={f.column}
                onChange={e => handleFieldChange(i, 'column', e.target.value)}
                className="bg-[#0a0b0e] border border-slate-700 rounded-lg p-2 text-xs font-mono text-slate-200 flex-1 outline-none focus:border-violet-500 transition-colors"
              />
              <datalist id={`columns-list-${i}`}>
                {columns.map(c => <option key={c} value={c} />)}
              </datalist>

              <input
                placeholder="Valor (ej. Texto o Número)"
                value={f.value}
                onChange={e => handleFieldChange(i, 'value', e.target.value)}
                className="bg-[#0a0b0e] border border-slate-700 rounded-lg p-2 text-xs font-mono text-slate-200 flex-1 outline-none focus:border-violet-500 transition-colors"
              />

              {visualCrud.fields.length > 1 && (
                <button
                  onClick={() => removeField(i)}
                  title="Eliminar campo"
                  className="text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 p-1.5 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}

          <button
            onClick={() => handleAddField('')}
            className="text-[11px] font-semibold bg-violet-600/20 hover:bg-violet-600/30 text-violet-300 border border-violet-500/30 px-3 py-1.5 rounded-lg transition-colors w-fit flex items-center gap-1.5 mt-1"
          >
            <PlusCircle className="w-3.5 h-3.5" /> Añadir otro campo
          </button>
        </div>
      )}

      {/* Condición WHERE */}
      {(visualCrud.action === 'UPDATE' || visualCrud.action === 'DELETE') && (
        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-3 flex flex-col gap-2 shadow-inner">
          <label className="text-xs text-rose-300 font-bold flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-rose-400" /> Condición de Filtro (WHERE)
          </label>
          <div className="flex gap-2 items-center">
            <input
              list="columns-list-where"
              placeholder="Campo (ej. id)"
              value={visualCrud.conditionColumn}
              onChange={e => setVisualCrud({ ...visualCrud, conditionColumn: e.target.value })}
              className="bg-[#0a0b0e] border border-slate-700 rounded-lg p-2 text-xs font-mono text-slate-200 flex-1 outline-none focus:border-rose-500 transition-colors"
            />
            <datalist id="columns-list-where">
              {columns.map(c => <option key={c} value={c} />)}
            </datalist>

            <span className="bg-slate-900 border border-slate-700 px-2.5 py-1.5 rounded-lg text-slate-400 font-mono font-bold text-xs">=</span>

            <input
              placeholder="Valor (ej. 1)"
              value={visualCrud.conditionValue}
              onChange={e => setVisualCrud({ ...visualCrud, conditionValue: e.target.value })}
              className="bg-[#0a0b0e] border border-slate-700 rounded-lg p-2 text-xs font-mono text-slate-200 flex-1 outline-none focus:border-rose-500 transition-colors"
            />
          </div>
        </div>
      )}

    </div>
  );
}
