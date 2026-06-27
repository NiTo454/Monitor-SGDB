import mysql from 'mysql2/promise';
import { Client as PgClient } from 'pg';
import mssql from 'mssql';
import { MongoClient } from 'mongodb';
import { Client as CassandraClient } from 'cassandra-driver';

export interface DbConfig {
  engine: string;
  host: string;
  port: string | number;
  user: string;
  password?: string;
  database?: string;
  query?: string;
}

// -----------------------------------------------------------
// 1. TEST CONNECTION
// -----------------------------------------------------------
export async function testSgbdConnection(config: DbConfig) {
  const { engine, host, port, user, password, database } = config;
  const numPort = Number(port);

  if (engine === 'mysql') {
    let conn;
    try {
      conn = await mysql.createConnection({
        host, port: numPort, user, password,
        connectTimeout: 4000
      });
      await conn.end();
      return { success: true, message: 'Conexión a MySQL exitosa.' };
    } catch (err: any) {
      if (conn) await conn.end().catch(() => {});
      return { success: false, error: `Error MySQL: ${err.message}` };
    }
  }

  if (engine === 'postgresql') {
    let client = new PgClient({
      host, port: numPort, user, password,
      database: 'postgres',
      connectionTimeoutMillis: 4000
    });
    try {
      await client.connect();
      await client.end();
      return { success: true, message: 'Conexión a PostgreSQL exitosa.' };
    } catch (err: any) {
      await client.end().catch(() => {});
      return { success: false, error: `Error PostgreSQL: ${err.message}` };
    }
  }

  if (engine === 'sqlserver') {
    const mssqlConfig: mssql.config = {
      server: host, port: numPort, user, password,
      database: 'master',
      options: { encrypt: false, trustServerCertificate: true },
      connectionTimeout: 4000
    };
    try {
      const pool = new mssql.ConnectionPool(mssqlConfig);
      await pool.connect();
      await pool.close();
      return { success: true, message: 'Conexión a SQL Server exitosa.' };
    } catch (err: any) {
      return { success: false, error: `Error SQL Server: ${err.message}` };
    }
  }

  if (engine === 'mongodb') {
    const uri = user && password
      ? `mongodb://${encodeURIComponent(user)}:${encodeURIComponent(password)}@${host}:${numPort}/?authSource=admin`
      : `mongodb://${host}:${numPort}`;
    const client = new MongoClient(uri, { serverSelectionTimeoutMS: 4000 });
    try {
      await client.connect();
      await client.db('admin').command({ ping: 1 });
      await client.close();
      return { success: true, message: 'Conexión a MongoDB exitosa.' };
    } catch (err: any) {
      await client.close().catch(() => {});
      return { success: false, error: `Error MongoDB: ${err.message}` };
    }
  }

  if (engine === 'cassandra') {
    const client = new CassandraClient({
      contactPoints: [host],
      protocolOptions: { port: numPort },
      localDataCenter: 'datacenter1',
      credentials: { username: user, password: password || '' },
      socketOptions: { connectTimeout: 4000 }
    });
    try {
      await client.connect();
      await client.shutdown();
      return { success: true, message: 'Conexión a Cassandra exitosa.' };
    } catch (err: any) {
      await client.shutdown().catch(() => {});
      return { success: false, error: `Error Cassandra: ${err.message}` };
    }
  }

  return { success: false, error: 'Motor no soportado.' };
}

// -----------------------------------------------------------
// 2. EXECUTE QUERY
// -----------------------------------------------------------
export async function executeSgbdQuery(config: DbConfig) {
  const { engine, host, port, user, password, database, query } = config;
  const numPort = Number(port);
  if (!query || !query.trim()) return { success: false, error: 'Consulta vacía.' };

  if (engine === 'mysql') {
    let conn;
    try {
      conn = await mysql.createConnection({
        host, port: numPort, user, password, database: database || undefined, multipleStatements: true
      });
      const [rows]: any = await conn.query(query);
      await conn.end();
      return { success: true, data: rows };
    } catch (err: any) {
      if (conn) await conn.end().catch(() => {});
      return { success: false, error: err.message };
    }
  }

  if (engine === 'postgresql') {
    let targetDb = database || 'postgres';
    let client = new PgClient({ host, port: numPort, user, password, database: targetDb, connectionTimeoutMillis: 4000 });
    try {
      await client.connect();
      const res = await client.query(query);
      await client.end();
      return { success: true, data: res.rows.length > 0 ? res.rows : [{ mensaje: `Ejecución exitosa (${res.command}). Filas afectadas: ${res.rowCount || 0}` }] };
    } catch (err: any) {
      await client.end().catch(() => {});
      return { success: false, error: err.message };
    }
  }

  if (engine === 'sqlserver') {
    const mssqlConfig: mssql.config = {
      server: host, port: numPort, user, password, database: database || 'master',
      options: { encrypt: false, trustServerCertificate: true }, connectionTimeout: 4000
    };
    try {
      const pool = new mssql.ConnectionPool(mssqlConfig);
      await pool.connect();
      const res = await pool.request().query(query);
      await pool.close();
      const data = res.recordset || [{ mensaje: `Ejecución exitosa. Filas afectadas: ${res.rowsAffected.reduce((a, b) => a + b, 0)}` }];
      return { success: true, data };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  if (engine === 'mongodb') {
    const uri = user && password
      ? `mongodb://${encodeURIComponent(user)}:${encodeURIComponent(password)}@${host}:${numPort}/?authSource=admin`
      : `mongodb://${host}:${numPort}`;
    const client = new MongoClient(uri, { serverSelectionTimeoutMS: 4000 });
    try {
      await client.connect();
      const db = client.db(database || 'admin');
      let commandObj: any;
      const trimmed = query.trim();

      if (trimmed.startsWith('{')) {
        commandObj = JSON.parse(trimmed);
      } else if (trimmed.toLowerCase() === 'show dbs' || trimmed.toLowerCase() === 'listdatabases') {
        commandObj = { listDatabases: 1 };
      } else if (trimmed.toLowerCase() === 'show collections' || trimmed.toLowerCase() === 'listcollections') {
        commandObj = { listCollections: 1 };
      } else if (trimmed.toLowerCase() === 'stats' || trimmed.toLowerCase() === 'dbstats') {
        commandObj = { dbStats: 1 };
      } else {
        await client.close();
        return { success: false, error: 'Para MongoDB ingresa un comando JSON válido (ej. {"ping": 1}) o palabras clave ("show dbs", "show collections", "dbstats").' };
      }

      const res = await db.command(commandObj);
      await client.close();
      return { success: true, data: Array.isArray(res) ? res : [res] };
    } catch (err: any) {
      await client.close().catch(() => {});
      return { success: false, error: err.message };
    }
  }

  if (engine === 'cassandra') {
    const client = new CassandraClient({
      contactPoints: [host], protocolOptions: { port: numPort }, localDataCenter: 'datacenter1',
      credentials: { username: user, password: password || '' }, keyspace: database || undefined, socketOptions: { connectTimeout: 4000 }
    });
    try {
      await client.connect();
      const res = await client.execute(query);
      await client.shutdown();
      return { success: true, data: res.rows };
    } catch (err: any) {
      await client.shutdown().catch(() => {});
      return { success: false, error: err.message };
    }
  }

  return { success: false, error: 'Motor no soportado.' };
}

// -----------------------------------------------------------
// 3. GET TELEMETRY
// -----------------------------------------------------------
export async function getSgbdTelemetry(config: DbConfig) {
  const startTime = Date.now();
  const { engine, host, port, user, password, database } = config;
  const numPort = Number(port);

  let metrics = {
    status: 'online', latencyMs: 0, version: 'Desconocido', uptime: 'N/A',
    activeConnections: 0, databasesCount: 0, tablesCount: 0, sizeBytes: 0, tablesList: [] as string[]
  };

  try {
    if (engine === 'mysql') {
      let conn;
      try {
        conn = await mysql.createConnection({ host, port: numPort, user, password, connectTimeout: 3000 });
        const [verRows]: any = await conn.query("SELECT VERSION() as ver;");
        metrics.version = verRows[0]?.ver || 'MySQL';

        const [statusRows]: any = await conn.query("SHOW GLOBAL STATUS WHERE Variable_name IN ('Threads_connected', 'Uptime');");
        statusRows.forEach((row: any) => {
          if (row.Variable_name === 'Threads_connected') metrics.activeConnections = parseInt(row.Value, 10);
          if (row.Variable_name === 'Uptime') metrics.uptime = `${Math.floor(parseInt(row.Value, 10) / 60)} mins`;
        });

        const [dbRows]: any = await conn.query("SHOW DATABASES;");
        metrics.databasesCount = dbRows.length;

        const userDbRow = dbRows.find((r: any) => !['information_schema', 'performance_schema', 'mysql', 'sys'].includes(String(Object.values(r)[0])));
        const targetDb = database || (userDbRow ? String(Object.values(userDbRow)[0]) : '');

        if (targetDb) {
          try {
            const [tblRows]: any = await conn.query(`SHOW TABLES FROM \`${targetDb}\`;`);
            metrics.tablesCount = tblRows.length;
            metrics.tablesList = tblRows.map((r: any) => Object.values(r)[0] as string);
          } catch (e) {}
        }
        await conn.end();
      } catch (err) {
        if (conn) await conn.end().catch(() => {});
        metrics.status = 'offline';
      }
    } else if (engine === 'postgresql') {
      let client = new PgClient({ host, port: numPort, user, password, database: 'postgres', connectionTimeoutMillis: 3000 });
      try {
        await client.connect();
        const verRes = await client.query("SELECT version();");
        metrics.version = verRes.rows[0]?.version?.split(' ')[1] || 'PostgreSQL';
        const connRes = await client.query("SELECT count(*) FROM pg_stat_activity;");
        metrics.activeConnections = parseInt(connRes.rows[0]?.count || '0', 10);
        const dbRes = await client.query("SELECT count(*) FROM pg_database WHERE datistemplate = false;");
        metrics.databasesCount = parseInt(dbRes.rows[0]?.count || '0', 10);
        await client.end();

        // Query tables from target DB
        const targetDb = database || 'postgres';
        let dbClient = new PgClient({ host, port: numPort, user, password, database: targetDb, connectionTimeoutMillis: 3000 });
        try {
          await dbClient.connect();
          const tblRes = await dbClient.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';");
          metrics.tablesCount = tblRes.rows.length;
          metrics.tablesList = tblRes.rows.map((r: any) => r.table_name);
          await dbClient.end();
        } catch (e) {
          await dbClient.end().catch(() => {});
        }
      } catch (err) {
        await client.end().catch(() => {});
        metrics.status = 'offline';
      }
    } else if (engine === 'sqlserver') {
      const targetDb = database || 'master';
      const mssqlConfig: mssql.config = {
        server: host, port: numPort, user, password, database: targetDb,
        options: { encrypt: false, trustServerCertificate: true }, connectionTimeout: 3000
      };
      try {
        const pool = new mssql.ConnectionPool(mssqlConfig);
        await pool.connect();
        const verRes = await pool.request().query("SELECT @@VERSION as ver;");
        metrics.version = verRes.recordset[0]?.ver?.split('\n')[0] || 'SQL Server';
        const connRes = await pool.request().query("SELECT COUNT(*) as cnt FROM sys.dm_exec_sessions WHERE is_user_process = 1;");
        metrics.activeConnections = connRes.recordset[0]?.cnt || 0;
        const dbRes = await pool.request().query("SELECT COUNT(*) as cnt FROM sys.databases;");
        metrics.databasesCount = dbRes.recordset[0]?.cnt || 0;
        const tblRes = await pool.request().query("SELECT name FROM sys.tables;");
        metrics.tablesCount = tblRes.recordset.length;
        metrics.tablesList = tblRes.recordset.map((r: any) => r.name);
        await pool.close();
      } catch (err) {
        // Fallback connect to master
        try {
          const fallbackPool = new mssql.ConnectionPool({ ...mssqlConfig, database: 'master' });
          await fallbackPool.connect();
          metrics.version = 'SQL Server';
          const dbRes = await fallbackPool.request().query("SELECT COUNT(*) as cnt FROM sys.databases;");
          metrics.databasesCount = dbRes.recordset[0]?.cnt || 0;
          await fallbackPool.close();
        } catch (e) {
          metrics.status = 'offline';
        }
      }
    } else if (engine === 'mongodb') {
      const uri = user && password
        ? `mongodb://${encodeURIComponent(user)}:${encodeURIComponent(password)}@${host}:${numPort}/?authSource=admin`
        : `mongodb://${host}:${numPort}`;
      const client = new MongoClient(uri, { serverSelectionTimeoutMS: 3000 });
      try {
        await client.connect();
        const adminDb = client.db('admin');
        const buildInfo = await adminDb.command({ buildInfo: 1 });
        metrics.version = buildInfo.version || 'MongoDB';
        const serverStatus = await adminDb.command({ serverStatus: 1 });
        metrics.activeConnections = serverStatus.connections?.current || 0;
        metrics.uptime = `${Math.floor((serverStatus.uptime || 0) / 60)} mins`;
        const dbsInfo = await adminDb.command({ listDatabases: 1 });
        metrics.databasesCount = dbsInfo.databases?.length || 0;
        const targetDb = database || (dbsInfo.databases.find((d: any) => !['admin', 'local', 'config'].includes(d.name))?.name || 'admin');
        if (targetDb) {
          const cols = await client.db(targetDb).listCollections().toArray();
          metrics.tablesCount = cols.length;
          metrics.tablesList = cols.map(c => c.name);
        }
        await client.close();
      } catch (err) {
        await client.close().catch(() => {});
        metrics.status = 'offline';
      }
    } else if (engine === 'cassandra') {
      const client = new CassandraClient({
        contactPoints: [host], protocolOptions: { port: numPort }, localDataCenter: 'datacenter1',
        credentials: { username: user, password: password || '' }, socketOptions: { connectTimeout: 3000 }
      });
      try {
        await client.connect();
        metrics.version = 'Cassandra 4.x';
        metrics.databasesCount = client.metadata.keyspaces ? Object.keys(client.metadata.keyspaces).length : 0;
        const targetDb = database || (client.metadata.keyspaces ? Object.keys(client.metadata.keyspaces).find(k => !k.startsWith('system')) || '' : '');
        if (targetDb && client.metadata.keyspaces[targetDb]) {
          const ks: any = client.metadata.keyspaces[targetDb];
          if (ks && ks.tables) {
            metrics.tablesCount = Object.keys(ks.tables).length;
            metrics.tablesList = Object.keys(ks.tables);
          }
        }
        await client.shutdown();
      } catch (err) {
        await client.shutdown().catch(() => {});
        metrics.status = 'offline';
      }
    }
  } catch (e) {
    metrics.status = 'offline';
  }

  metrics.latencyMs = Date.now() - startTime;
  return { success: true, metrics };
}

// -----------------------------------------------------------
// 4. GET SCHEMA
// -----------------------------------------------------------
export async function getSgbdSchema(config: DbConfig & { table?: string, action: string }) {
  const { engine, host, port, user, password, database, table, action } = config;
  const numPort = Number(port);

  if (engine === 'mysql') {
    let conn;
    try {
      conn = await mysql.createConnection({ host, port: numPort, user, password, connectTimeout: 3000 });
      if (action === 'getDatabases') {
        const [rows]: any = await conn.query("SHOW DATABASES;");
        const dbs = rows.map((r: any) => Object.values(r)[0] as string);
        await conn.end();
        return { success: true, databases: dbs };
      }
      if (action === 'getTables') {
        if (!database) { await conn.end(); return { success: true, tables: [] }; }
        try {
          const [rows]: any = await conn.query(`SHOW TABLES FROM \`${database}\`;`);
          const tbls = rows.map((r: any) => Object.values(r)[0] as string);
          await conn.end();
          return { success: true, tables: tbls };
        } catch (e: any) {
          await conn.end();
          return { success: true, tables: [] };
        }
      }
      if (action === 'getColumns') {
        if (!database || !table) { await conn.end(); return { success: true, columns: [] }; }
        try {
          const [rows]: any = await conn.query(`SHOW COLUMNS FROM \`${database}\`.\`${table}\`;`);
          const cols = rows.map((r: any) => r.Field as string);
          await conn.end();
          return { success: true, columns: cols };
        } catch (e: any) {
          await conn.end();
          return { success: true, columns: [] };
        }
      }
      await conn.end();
    } catch (err: any) {
      if (conn) await conn.end().catch(() => {});
      return { success: false, error: err.message };
    }
  }

  if (engine === 'postgresql') {
    let client = new PgClient({ host, port: numPort, user, password, database: 'postgres', connectionTimeoutMillis: 3000 });
    try {
      await client.connect();
      if (action === 'getDatabases') {
        const res = await client.query("SELECT datname FROM pg_database WHERE datistemplate = false;");
        const dbs = res.rows.map((r: any) => r.datname);
        await client.end();
        return { success: true, databases: dbs };
      }
      await client.end();

      const targetDb = database || 'postgres';
      let dbClient = new PgClient({ host, port: numPort, user, password, database: targetDb, connectionTimeoutMillis: 3000 });
      try {
        await dbClient.connect();
        if (action === 'getTables') {
          const res = await dbClient.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';");
          const tbls = res.rows.map((r: any) => r.table_name);
          await dbClient.end();
          return { success: true, tables: tbls };
        }
        if (action === 'getColumns') {
          if (!table) { await dbClient.end(); return { success: true, columns: [] }; }
          const res = await dbClient.query("SELECT column_name FROM information_schema.columns WHERE table_schema = 'public' AND table_name = $1;", [table]);
          const cols = res.rows.map((r: any) => r.column_name);
          await dbClient.end();
          return { success: true, columns: cols };
        }
        await dbClient.end();
      } catch (err: any) {
        await dbClient.end().catch(() => {});
        return { success: true, tables: [], columns: [] };
      }
    } catch (err: any) {
      await client.end().catch(() => {});
      return { success: false, error: err.message };
    }
  }

  if (engine === 'sqlserver') {
    const targetDb = database || 'master';
    const mssqlConfig: mssql.config = {
      server: host, port: numPort, user, password, database: targetDb,
      options: { encrypt: false, trustServerCertificate: true }, connectionTimeout: 3000
    };
    try {
      const pool = new mssql.ConnectionPool(mssqlConfig);
      await pool.connect();
      if (action === 'getDatabases') {
        const res = await pool.request().query("SELECT name FROM sys.databases WHERE name NOT IN ('tempdb', 'model', 'msdb');");
        const dbs = res.recordset.map((r: any) => r.name);
        await pool.close();
        return { success: true, databases: dbs };
      }
      if (action === 'getTables') {
        const res = await pool.request().query("SELECT name FROM sys.tables;");
        const tbls = res.recordset.map((r: any) => r.name);
        await pool.close();
        return { success: true, tables: tbls };
      }
      if (action === 'getColumns') {
        if (!table) { await pool.close(); return { success: true, columns: [] }; }
        const req = pool.request();
        req.input('tbl', mssql.VarChar, table);
        const res = await req.query("SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = @tbl;");
        const cols = res.recordset.map((r: any) => r.COLUMN_NAME);
        await pool.close();
        return { success: true, columns: cols };
      }
      await pool.close();
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  if (engine === 'mongodb') {
    const uri = user && password
      ? `mongodb://${encodeURIComponent(user)}:${encodeURIComponent(password)}@${host}:${numPort}/?authSource=admin`
      : `mongodb://${host}:${numPort}`;
    const client = new MongoClient(uri, { serverSelectionTimeoutMS: 3000 });
    try {
      await client.connect();
      if (action === 'getDatabases') {
        const adminDb = client.db('admin');
        const dbsInfo = await adminDb.command({ listDatabases: 1 });
        const dbs = dbsInfo.databases.map((d: any) => d.name);
        await client.close();
        return { success: true, databases: dbs };
      }
      if (action === 'getTables') {
        const cols = await client.db(database || 'admin').listCollections().toArray();
        await client.close();
        return { success: true, tables: cols.map(c => c.name) };
      }
      if (action === 'getColumns') {
        if (!database || !table) { await client.close(); return { success: true, columns: [] }; }
        const doc = await client.db(database).collection(table).findOne({});
        await client.close();
        return { success: true, columns: doc ? Object.keys(doc) : ['_id', 'nombre', 'fecha'] };
      }
      await client.close();
    } catch (err: any) {
      await client.close().catch(() => {});
      return { success: false, error: err.message };
    }
  }

  if (engine === 'cassandra') {
    const client = new CassandraClient({
      contactPoints: [host], protocolOptions: { port: numPort }, localDataCenter: 'datacenter1',
      credentials: { username: user, password: password || '' }, socketOptions: { connectTimeout: 3000 }
    });
    try {
      await client.connect();
      if (action === 'getDatabases') {
        const dbs = client.metadata.keyspaces ? Object.keys(client.metadata.keyspaces) : [];
        await client.shutdown();
        return { success: true, databases: dbs };
      }
      if (action === 'getTables') {
        const ks: any = database ? client.metadata.keyspaces[database] : null;
        const tbls = ks && ks.tables ? Object.keys(ks.tables) : [];
        await client.shutdown();
        return { success: true, tables: tbls };
      }
      if (action === 'getColumns') {
        const ks: any = database ? client.metadata.keyspaces[database] : null;
        const tblObj = ks && ks.tables && table ? ks.tables[table] : null;
        const cols = tblObj && tblObj.columns ? Object.keys(tblObj.columns) : ['id', 'nombre'];
        await client.shutdown();
        return { success: true, columns: cols };
      }
      await client.shutdown();
    } catch (err: any) {
      await client.shutdown().catch(() => {});
      return { success: false, error: err.message };
    }
  }

  return { success: false, error: 'Motor o acción no soportados.' };
}
