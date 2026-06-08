import { Database } from 'lucide-react';
import { ChangeEvent } from 'react';

interface ConnectionFormProps {
  formData: any;
  handleInputChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  isDisabled: boolean;
}

export default function ConnectionForm({ formData, handleInputChange, isDisabled }: ConnectionFormProps) {
  return (
    <div className="bg-[#0a0b0e] border border-slate-800 rounded-xl p-4 flex flex-col gap-3 shadow-lg">
      <div className="flex items-center gap-2 mb-1">
        <Database className="w-4 h-4 text-slate-400" />
        <h2 className="text-sm font-semibold text-slate-300">Configuración de Conexión</h2>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        <select name="engine" value={formData.engine} onChange={handleInputChange} disabled={isDisabled} className="bg-slate-900 border border-slate-700 rounded-lg p-2 text-sm text-slate-300 focus:border-fuchsia-500 outline-none transition-colors disabled:opacity-50">
          <option value="mysql">MySQL</option>
        </select>
        <input name="host" placeholder="Host" value={formData.host} onChange={handleInputChange} disabled={isDisabled} className="bg-slate-900 border border-slate-700 rounded-lg p-2 text-sm text-slate-300 outline-none focus:border-fuchsia-500 transition-colors disabled:opacity-50" />
        <input name="port" placeholder="Puerto" value={formData.port} onChange={handleInputChange} disabled={isDisabled} className="bg-slate-900 border border-slate-700 rounded-lg p-2 text-sm text-slate-300 outline-none focus:border-fuchsia-500 transition-colors disabled:opacity-50" />
        <select name="user" value={formData.user} onChange={handleInputChange} disabled={isDisabled} className="bg-slate-900 border border-slate-700 rounded-lg p-2 text-sm text-slate-300 outline-none focus:border-fuchsia-500 transition-colors disabled:opacity-50">
          <option value="root">root (Admin)</option>
          <option value="auditor">auditor</option>
          <option value="desarrollador">desarrollador</option>
          <option value="soporte">soporte</option>
          <option value="invitado">invitado</option>
        </select>
        <input name="password" type="password" placeholder="Contraseña" value={formData.password} onChange={handleInputChange} disabled={isDisabled} className="bg-slate-900 border border-slate-700 rounded-lg p-2 text-sm text-slate-300 outline-none focus:border-fuchsia-500 transition-colors disabled:opacity-50" />
        <input name="database" placeholder="DB (Opcional)" value={formData.database} onChange={handleInputChange} disabled={isDisabled} className="bg-slate-900 border border-slate-700 rounded-lg p-2 text-sm text-slate-300 outline-none focus:border-fuchsia-500 transition-colors disabled:opacity-50" />
      </div>
    </div>
  );
}
