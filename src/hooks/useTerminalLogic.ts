import { useState, useRef, useEffect, ChangeEvent, KeyboardEvent } from 'react';
import { SgbdConfig } from '../components/ConfigModal';

const DEFAULT_CONFIGS: Record<string, SgbdConfig> = {
  mysql: { engine: 'mysql', host: 'localhost', port: '3308', user: 'root', password: 'root', database: 'Prueba', query: '' },
  sqlserver: { engine: 'sqlserver', host: 'localhost', port: '1433', user: 'sa', password: 'Password123!', database: 'master', query: '' },
  postgresql: { engine: 'postgresql', host: 'localhost', port: '5433', user: 'USUARIOPRINCIPAL', password: 'root', database: 'postgres', query: '' },
  mongodb: { engine: 'mongodb', host: 'localhost', port: '27017', user: 'USUARIOPRINCIPAL', password: 'root', database: 'admin', query: '' },
  cassandra: { engine: 'cassandra', host: 'localhost', port: '9042', user: 'cassandra', password: 'cassandra', database: 'system', query: '' }
};

export function useTerminalLogic() {
  const [configs, setConfigs] = useState<Record<string, SgbdConfig>>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sgbd_configs');
      if (saved) {
        try { return JSON.parse(saved); } catch (e) {}
      }
    }
    return DEFAULT_CONFIGS;
  });

  const [formData, setFormData] = useState<SgbdConfig>(DEFAULT_CONFIGS.mysql);

  // Schema states
  const [schemaDatabases, setSchemaDatabases] = useState<string[]>([]);
  const [schemaTables, setSchemaTables] = useState<string[]>([]);
  const [schemaColumns, setSchemaColumns] = useState<string[]>([]);
  const [loadingSchema, setLoadingSchema] = useState<boolean>(false);

  const [dbLogs, setDbLogs] = useState<{text: string, type: 'info' | 'success' | 'error' | 'warn' | 'user', data?: any[]}[]>([
    { text: 'MONITOR SGBD INICIADO. Selecciona un motor de base de datos para consultar o monitorear.', type: 'info' }
  ]);

  const [isExecuting, setIsExecuting] = useState(false);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const dbLogsEndRef = useRef<HTMLDivElement>(null);

  const [inputMode, setInputMode] = useState<'console' | 'visual'>('console');
  const [visualCrud, setVisualCrud] = useState({
    table: '',
    action: 'SELECT',
    fields: [{ column: '', value: '' }],
    conditionColumn: 'id',
    conditionValue: ''
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('sgbd_configs', JSON.stringify(configs));
    }
  }, [configs]);

  // Cargar BDs cuando cambia el motor o host
  useEffect(() => {
    fetchDatabases();
  }, [formData.engine, formData.host, formData.port, formData.user]);

  // Cargar Tablas cuando cambia la base de datos seleccionada y limpiar campos previos
  useEffect(() => {
    setVisualCrud(prev => ({
      ...prev,
      fields: [{ column: '', value: '' }],
      conditionColumn: 'id',
      conditionValue: ''
    }));
    fetchTables();
  }, [formData.database, formData.engine]);

  // Cargar Columnas cuando cambia la tabla seleccionada y resetear campos
  useEffect(() => {
    if (visualCrud.table) {
      setVisualCrud(prev => ({
        ...prev,
        fields: [{ column: '', value: '' }]
      }));
      fetchColumns(visualCrud.table);
    } else {
      setSchemaColumns([]);
    }
  }, [visualCrud.table]);

  const fetchDatabases = async () => {
    try {
      const res = await fetch('/api/schema', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, action: 'getDatabases' })
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.databases)) {
        setSchemaDatabases(data.databases);
        if (data.databases.length > 0) {
          if (!formData.database || !data.databases.includes(formData.database)) {
            const userDb = data.databases.find((d: string) => !['information_schema', 'performance_schema', 'mysql', 'sys', 'master', 'tempdb', 'model', 'msdb'].includes(d)) || data.databases[0];
            updateDatabaseSelection(userDb);
          }
        }
      }
    } catch (e) {}
  };

  const fetchTables = async () => {
    setLoadingSchema(true);
    try {
      const res = await fetch('/api/schema', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, action: 'getTables' })
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.tables)) {
        setSchemaTables(data.tables);
        if (data.tables.length > 0) {
          setVisualCrud(prev => ({ ...prev, table: data.tables[0] }));
        } else {
          setVisualCrud(prev => ({ ...prev, table: '' }));
        }
      } else {
        setSchemaTables([]);
        setVisualCrud(prev => ({ ...prev, table: '' }));
      }
    } catch (e) {
      setSchemaTables([]);
      setVisualCrud(prev => ({ ...prev, table: '' }));
    }
    setLoadingSchema(false);
  };

  const fetchColumns = async (tableName: string) => {
    try {
      const res = await fetch('/api/schema', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, table: tableName, action: 'getColumns' })
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.columns)) {
        setSchemaColumns(data.columns);
      } else {
        setSchemaColumns([]);
      }
    } catch (e) {
      setSchemaColumns([]);
    }
  };

  const updateDatabaseSelection = (newDb: string) => {
    setFormData(prev => ({ ...prev, database: newDb }));
    setConfigs(prev => ({
      ...prev,
      [formData.engine]: { ...prev[formData.engine], database: newDb }
    }));
  };

  const updateEngineConfig = (engine: string, newConfig: SgbdConfig) => {
    setConfigs(prev => ({ ...prev, [engine]: newConfig }));
    if (formData.engine === engine) {
      setFormData(newConfig);
    }
  };

  const handleEngineSelect = (engine: string) => {
    const targetConfig = configs[engine] || DEFAULT_CONFIGS[engine] || {
      engine, host: 'localhost', port: '3306', user: 'root', password: '', database: '', query: ''
    };
    setFormData(targetConfig);
    addDbLog(`Cambiado contexto a motor: ${engine.toUpperCase()} (${targetConfig.host}:${targetConfig.port})`, 'info');
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === 'engine') {
      handleEngineSelect(value);
    } else if (name === 'database') {
      updateDatabaseSelection(value);
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
      setConfigs(prev => ({
        ...prev,
        [formData.engine]: { ...prev[formData.engine], [name]: value }
      }));
    }
  };

  const addDbLog = (text: string, type: 'info' | 'success' | 'error' | 'warn' | 'user', data?: any[]) => {
    setDbLogs(prev => [...prev, { text, type, data }]);
  };

  const clearDbLogs = () => setDbLogs([{ text: 'TERMINAL SGBD. A la espera de comandos...', type: 'info' }]);

  useEffect(() => { dbLogsEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [dbLogs]);

  const setQueryShortcut = (queryText: string) => {
    setFormData(prev => ({ ...prev, query: queryText }));
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
    if (!visualCrud.table) {
      addDbLog('Selecciona una tabla válida antes de ejecutar.', 'warn');
      return;
    }

    let generatedSql = '';
    if (visualCrud.action === 'SELECT') {
      if (formData.engine === 'mongodb') {
        generatedSql = `{ "find": "${visualCrud.table}", "limit": 50 }`;
      } else {
        generatedSql = `SELECT * FROM ${visualCrud.table};`;
      }
    } else if (visualCrud.action === 'INSERT') {
      if (formData.engine === 'mongodb') {
        const docObj: Record<string, any> = {};
        visualCrud.fields.filter(f => f.column).forEach(f => { docObj[f.column] = f.value; });
        generatedSql = `{ "insert": "${visualCrud.table}", "documents": [${JSON.stringify(docObj)}] }`;
      } else {
        const cols = visualCrud.fields.filter(f => f.column).map(f => f.column).join(', ');
        const vals = visualCrud.fields.filter(f => f.column).map(f => `'${f.value}'`).join(', ');
        generatedSql = `INSERT INTO ${visualCrud.table} (${cols}) VALUES (${vals});`;
      }
    } else if (visualCrud.action === 'UPDATE') {
      if (formData.engine === 'mongodb') {
        const updateObj: Record<string, any> = {};
        visualCrud.fields.filter(f => f.column).forEach(f => { updateObj[f.column] = f.value; });
        const filterObj = visualCrud.conditionColumn ? { [visualCrud.conditionColumn]: visualCrud.conditionValue } : {};
        generatedSql = `{ "update": "${visualCrud.table}", "updates": [{ "q": ${JSON.stringify(filterObj)}, "u": { "$set": ${JSON.stringify(updateObj)} } }] }`;
      } else {
        const sets = visualCrud.fields.filter(f => f.column).map(f => `${f.column} = '${f.value}'`).join(', ');
        const condition = visualCrud.conditionColumn ? ` WHERE ${visualCrud.conditionColumn} = '${visualCrud.conditionValue}'` : '';
        generatedSql = `UPDATE ${visualCrud.table} SET ${sets}${condition};`;
      }
    } else if (visualCrud.action === 'DELETE') {
      if (formData.engine === 'mongodb') {
        const filterObj = visualCrud.conditionColumn ? { [visualCrud.conditionColumn]: visualCrud.conditionValue } : {};
        generatedSql = `{ "delete": "${visualCrud.table}", "deletes": [{ "q": ${JSON.stringify(filterObj)}, "limit": 1 }] }`;
      } else {
        const condition = visualCrud.conditionColumn ? ` WHERE ${visualCrud.conditionColumn} = '${visualCrud.conditionValue}'` : '';
        generatedSql = `DELETE FROM ${visualCrud.table}${condition};`;
      }
    }
    executeCommand(generatedSql);
  };

  const executeCommand = async (overrideQuery?: string) => {
    const finalQuery = (typeof overrideQuery === 'string' ? overrideQuery : formData.query) || '';
    if (!finalQuery.trim()) return;

    const currentQuery = finalQuery;
    const currentFormData = { ...formData, query: finalQuery };
    setFormData(prev => ({ ...prev, query: '' }));

    setIsExecuting(true);
    addDbLog(`> ${currentQuery}`, 'user');
    addDbLog(`Ejecutando consulta en ${currentFormData.engine.toUpperCase()} (${currentFormData.host}:${currentFormData.port})...`, 'info');

    try {
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
          if (data.length === 0) addDbLog(`Éxito: 0 filas/documentos devueltos.`, 'success');
          else if (data.every((r) => typeof r === 'object' && r !== null && !Array.isArray(r))) {
            addDbLog(`Éxito: ${data.length} resultado(s) devuelto(s).`, 'success', data);
          } else {
            addDbLog(`Resultado de la ejecución:`, 'success');
            data.forEach((resItem: any, i: number) => {
              if (typeof resItem === 'string') addDbLog(`↳ ${resItem}`, 'info');
              else if (Array.isArray(resItem)) {
                addDbLog(`↳ Resultado ${i + 1}: ${resItem.length} fila(s).`, 'success', resItem);
              } else addDbLog(`↳ ${JSON.stringify(resItem, null, 2)}`, 'info');
            });
          }
        } else addDbLog(`Éxito:\n${JSON.stringify(data, null, 2)}`, 'success');
      } else addDbLog(`Error del SGBD: ${execData.error}`, 'error');
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      addDbLog(`Fallo de conexión o ejecución: ${msg}`, 'error');
    }
    setIsExecuting(false);
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
    configs, updateEngineConfig,
    formData, handleInputChange, handleEngineSelect, updateDatabaseSelection,
    schemaDatabases, schemaTables, schemaColumns, loadingSchema, fetchTables,
    dbLogs, clearDbLogs, dbLogsEndRef,
    inputMode, setInputMode, setQueryShortcut,
    visualCrud, setVisualCrud,
    isExecuting, isBackingUp, isUploading,
    executeVisualCrud, executeCommand, downloadBackup, uploadToFtp, handleKeyDownCommand
  };
}
