import { useState, useRef, useEffect, ChangeEvent, KeyboardEvent } from 'react';

export function useTerminalLogic() {
  const [formData, setFormData] = useState({
    engine: 'mysql',
    host: 'localhost',
    port: '3306',
    user: 'root',
    password: process.env.NEXT_PUBLIC_DB_PASSWORD || '',
    database: '',
    query: ''
  });

  const [dbLogs, setDbLogs] = useState<{text: string, type: 'info' | 'success' | 'error' | 'warn' | 'ai' | 'user', data?: any[]}[]>([
    { text: 'TERMINAL SGBD. A la espera de comandos...', type: 'info' }
  ]);
  const [chatLogs, setChatLogs] = useState<{text: string, type: 'user' | 'ai' | 'error' | 'info'}[]>([
    { text: 'SISTEMA INICIADO. Hola, soy Glitch. ¿Qué necesitas consultar o auditar en tus bases de datos?', type: 'ai' }
  ]);
  const [aiPrompt, setAiPrompt] = useState('');

  const [isExecuting, setIsExecuting] = useState(false);
  const [isAsking, setIsAsking] = useState(false);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const dbLogsEndRef = useRef<HTMLDivElement>(null);
  const chatLogsEndRef = useRef<HTMLDivElement>(null);

  const [inputMode, setInputMode] = useState<'console' | 'visual'>('visual');
  const [visualCrud, setVisualCrud] = useState({
    table: 'productos',
    action: 'SELECT',
    fields: [{ column: '', value: '' }],
    conditionColumn: 'id',
    conditionValue: ''
  });

  const ROLE_PERMISSIONS: Record<string, Record<string, string[]>> = {
    root: { categorias: ['SELECT', 'INSERT', 'UPDATE', 'DELETE'], productos: ['SELECT', 'INSERT', 'UPDATE', 'DELETE'], clientes: ['SELECT', 'INSERT', 'UPDATE', 'DELETE'], empleados: ['SELECT', 'INSERT', 'UPDATE', 'DELETE'], ventas: ['SELECT', 'INSERT', 'UPDATE', 'DELETE'], detalles_venta: ['SELECT', 'INSERT', 'UPDATE', 'DELETE'], auditoria_logs: ['SELECT', 'INSERT', 'UPDATE', 'DELETE'] },
    desarrollador: { categorias: ['SELECT', 'INSERT', 'UPDATE', 'DELETE'], productos: ['SELECT', 'INSERT', 'UPDATE', 'DELETE'], clientes: ['SELECT', 'INSERT', 'UPDATE', 'DELETE'], empleados: ['SELECT', 'INSERT', 'UPDATE', 'DELETE'], ventas: ['SELECT', 'INSERT', 'UPDATE', 'DELETE'], detalles_venta: ['SELECT', 'INSERT', 'UPDATE', 'DELETE'], auditoria_logs: ['SELECT', 'INSERT', 'UPDATE', 'DELETE'] },
    soporte: { clientes: ['SELECT', 'INSERT', 'UPDATE'], productos: ['SELECT'], ventas: ['SELECT', 'UPDATE'], detalles_venta: ['SELECT'] },
    invitado: { productos: ['SELECT'], categorias: ['SELECT'] },
    auditor: { categorias: ['SELECT'], productos: ['SELECT'], clientes: ['SELECT'], empleados: ['SELECT'], ventas: ['SELECT'], detalles_venta: ['SELECT'], auditoria_logs: ['SELECT'] }
  };

  const availableTables = Object.keys(ROLE_PERMISSIONS[formData.user] || ROLE_PERMISSIONS['root']);
  const currentTable = availableTables.includes(visualCrud.table) ? visualCrud.table : (availableTables[0] || '');
  const availableActions = currentTable ? (ROLE_PERMISSIONS[formData.user]?.[currentTable] || ROLE_PERMISSIONS['root'][currentTable] || []) : [];
  const currentAction = availableActions.includes(visualCrud.action) ? visualCrud.action : (availableActions[0] || 'SELECT');

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

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    let newFormData = { ...formData, [name]: value };

    if (name === 'user') {
      if (value === 'auditor') newFormData.password = 'auditor123';
      else if (value === 'desarrollador') newFormData.password = 'desarrollador123';
      else if (value === 'soporte') newFormData.password = 'soporte123';
      else if (value === 'invitado') newFormData.password = 'invitado123';
      else if (value === 'root') newFormData.password = process.env.NEXT_PUBLIC_DB_PASSWORD || '';
    }
    setFormData(newFormData);
  };

  const addDbLog = (text: string, type: 'info' | 'success' | 'error' | 'warn' | 'ai' | 'user', data?: any[]) => {
    setDbLogs(prev => [...prev, { text, type, data }]);
  };

  const clearDbLogs = () => setDbLogs([{ text: 'TERMINAL SGBD. A la espera de comandos...', type: 'info' }]);

  const clearChatLogs = () => setChatLogs([{ text: 'SISTEMA INICIADO. Hola, soy Glitch. ¿Qué necesitas consultar o auditar en tus bases de datos?', type: 'ai' }]);

  useEffect(() => { dbLogsEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [dbLogs]);
  useEffect(() => { chatLogsEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [chatLogs]);

  const handleUseCommand = (text: string) => {
    const codeMatch = text.match(/```(?:[a-zA-Z]*\n)?([\s\S]*?)```/);
    const commandToUse = codeMatch ? codeMatch[1].trim() : text.trim();
    setFormData(prev => ({ ...prev, query: commandToUse }));
    setInputMode('console');
  };

  const handleKeyDownCommand = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      executeCommand();
    }
  };

  const handleResponse = async (res: Response) => {
    const text = await res.text();
    try { return JSON.parse(text); }
    catch (e) { throw new Error(`El servidor no devolvió JSON válido. Código: ${res.status}.`); }
  };

  const executeVisualCrud = () => {
    let generatedSql = '';
    if (currentAction === 'SELECT') {
      generatedSql = `SELECT * FROM ${currentTable};`;
    } else if (currentAction === 'INSERT') {
      const cols = visualCrud.fields.filter(f => f.column).map(f => f.column).join(', ');
      const vals = visualCrud.fields.filter(f => f.column).map(f => `'${f.value}'`).join(', ');
      generatedSql = `INSERT INTO ${currentTable} (${cols}) VALUES (${vals});`;
    } else if (currentAction === 'UPDATE') {
      const sets = visualCrud.fields.filter(f => f.column).map(f => `${f.column} = '${f.value}'`).join(', ');
      const condition = visualCrud.conditionColumn ? ` WHERE ${visualCrud.conditionColumn} = '${visualCrud.conditionValue}'` : '';
      generatedSql = `UPDATE ${currentTable} SET ${sets}${condition};`;
    } else if (currentAction === 'DELETE') {
      const condition = visualCrud.conditionColumn ? ` WHERE ${visualCrud.conditionColumn} = '${visualCrud.conditionValue}'` : '';
      generatedSql = `DELETE FROM ${currentTable}${condition};`;
    }
    executeCommand(generatedSql);
  };

  const executeCommand = async (overrideQuery?: string) => {
    const finalQuery = typeof overrideQuery === 'string' ? overrideQuery : formData.query;
    if (!finalQuery.trim()) return;

    const currentQuery = finalQuery;
    const currentFormData = { ...formData, query: finalQuery };
    setFormData(prev => ({ ...prev, query: '' }));

    setIsExecuting(true);
    addDbLog(`> ${currentQuery}`, 'user');
    addDbLog(`Ejecutando en ${currentFormData.engine}...`, 'info');

    try {
      addDbLog('Analizando privilegios...', 'info');
      const auditRes = await fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: currentQuery, engine: currentFormData.engine, userRole: currentFormData.user })
      });

      const auditData = await handleResponse(auditRes);
      if (!auditData.allowed) {
        addDbLog(`BLOQUEO DE SEGURIDAD (${auditData.riskLevel}): ${auditData.reason}`, 'error');
        if (auditData.suggestedFix) addDbLog(`Sugerencia: ${auditData.suggestedFix}`, 'warn');
        setIsExecuting(false);
        return;
      }

      const execRes = await fetch('/api/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentFormData)
      });

      const execData = await handleResponse(execRes);
      if (execData.success) {
        const data = execData.data;
        if (typeof data === 'string') addDbLog(`Éxito: ${data}`, 'success');
        else if (Array.isArray(data)) {
          if (data.length === 0) addDbLog(`Éxito: 0 filas devueltas.`, 'success');
          else if (data.every((r) => typeof r === 'object' && r !== null && !Array.isArray(r))) {
            addDbLog(`Éxito: ${data.length} fila(s) devuelta(s).`, 'success', data);
          } else {
            addDbLog(`Ejecución de múltiples sentencias completada:`, 'success');
            data.forEach((resItem: any, i: number) => {
              if (typeof resItem === 'string') addDbLog(`↳ Sentencia ${i + 1}: ${resItem}`, 'info');
              else if (Array.isArray(resItem)) {
                if (resItem.length === 0) addDbLog(`↳ Sentencia ${i + 1}: 0 filas devueltas.`, 'info');
                else if (typeof resItem[0] === 'object' && resItem[0] !== null) addDbLog(`↳ Sentencia ${i + 1}: ${resItem.length} fila(s) devuelta(s).`, 'success', resItem);
                else addDbLog(`↳ Sentencia ${i + 1}:\n${JSON.stringify(resItem, null, 2)}`, 'info');
              } else if (typeof resItem === 'object' && resItem !== null) {
                const rowsAffected = resItem.affectedRows !== undefined ? resItem.affectedRows : (resItem.nModified || 0);
                addDbLog(`↳ Sentencia ${i + 1}: ${rowsAffected} fila(s) afectada(s).`, 'info');
              }
            });
          }
        } else if (typeof data === 'object' && data !== null && data.affectedRows !== undefined) {
          addDbLog(`Éxito: ${data.affectedRows} fila(s) afectada(s).`, 'success');
        } else addDbLog(`Éxito:\n${JSON.stringify(data, null, 2)}`, 'success');
      } else addDbLog(`Error del SGBD: ${execData.error}`, 'error');
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      addDbLog(`Fallo: ${msg}`, 'error');
    }
    setIsExecuting(false);
  };

  const askGemini = async () => {
    if (!aiPrompt.trim()) return;
    setIsAsking(true);
    const userMessage = aiPrompt;
    setAiPrompt('');
    setChatLogs(prev => [...prev, { text: userMessage, type: 'user' }]);
    setChatLogs(prev => [...prev, { text: `> Consultando sobre ${formData.engine}...`, type: 'info' }]);

    try {
      const chatRes = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: userMessage, engine: formData.engine })
      });
      const chatData = await handleResponse(chatRes);
      if (chatData.success) {
        setChatLogs(prev => {
          const newLogs = [...prev];
          newLogs[newLogs.length - 1] = { text: chatData.reply, type: 'ai' };
          return newLogs;
        });
      } else setChatLogs(prev => [...prev, { text: `Error de IA: ${chatData.error}`, type: 'error' }]);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      setChatLogs(prev => [...prev, { text: `Fallo de IA: ${msg}`, type: 'error' }]);
    }
    setIsAsking(false);
  };

  const uploadToFtp = async () => {
    if (!formData.database) { addDbLog('Especifica la base de datos en el campo DB.', 'warn'); return; }
    setIsUploading(true);
    addDbLog(`> Generando backup de "${formData.database}" y subiendo al servidor FTP...`, 'info');
    try {
      const res = await fetch('/api/ftp-upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mysqlHost: formData.host, mysqlPort: formData.port, mysqlUser: formData.user, mysqlPassword: formData.password, database: formData.database }),
      });
      const data = await res.json();
      if (data.success) addDbLog(data.message, 'success');
      else addDbLog(`Error FTP: ${data.error}`, 'error');
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      addDbLog(`Fallo FTP: ${msg}`, 'error');
    }
    setIsUploading(false);
  };

  const downloadBackup = async () => {
    if (formData.engine !== 'mysql') { addDbLog('El backup automático solo está disponible para MySQL.', 'warn'); return; }
    if (!formData.database) { addDbLog('Especifica el nombre de la base de datos en el campo DB antes de hacer backup.', 'warn'); return; }
    setIsBackingUp(true);
    addDbLog(`> Generando backup de "${formData.database}"...`, 'info');
    try {
      const res = await fetch('/api/backup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!res.ok) {
        const err = await res.json();
        addDbLog(`Error al generar backup: ${err.error}`, 'error');
        setIsBackingUp(false);
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `backup_${formData.database}_${new Date().toISOString().slice(0,10)}.sql`;
      a.click();
      URL.revokeObjectURL(url);
      addDbLog(`Backup de "${formData.database}" descargado exitosamente.`, 'success');
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      addDbLog(`Fallo al generar backup: ${msg}`, 'error');
    }
    setIsBackingUp(false);
  };

  return {
    formData, handleInputChange,
    dbLogs, clearDbLogs, dbLogsEndRef,
    chatLogs, clearChatLogs, chatLogsEndRef,
    aiPrompt, setAiPrompt, askGemini, isAsking, handleUseCommand,
    inputMode, setInputMode,
    visualCrud, setVisualCrud, availableTables, availableActions, currentTable, currentAction, handleFieldChange, removeField,
    isExecuting, isBackingUp, isUploading,
    executeVisualCrud, executeCommand, downloadBackup, uploadToFtp, handleKeyDownCommand
  };
}
