# Monitor de SGBD Relacionales y NoSQL

## Descripción General

El **Monitor de SGBD** es una plataforma integral desarrollada en **Next.js** y **TypeScript** diseñada para auditar, supervisar en tiempo real y gestionar diferentes Sistemas Gestores de Bases de Datos (SGBD) tanto relacionales como NoSQL.

El sistema permite la administración y el monitoreo centralizado de 5 motores de bases de datos principales:
1. **MySQL** (Relacional)
2. **Microsoft SQL Server** (Relacional)
3. **PostgreSQL** (Relacional)
4. **MongoDB** (NoSQL / Documentos)
5. **Apache Cassandra** (NoSQL / Columnar)

Todas las conexiones son 100% configurables por el usuario mediante un menú modal dinámico y persistente.

---

## Arquitectura y Tecnologías

- **Frontend**: Next.js 16 (App Router), React 19, TailwindCSS v4, Lucide React.
- **Backend / API**: Next.js Route Handlers (Node.js runtime).
- **Controladores Nativos**:
  - `mysql2`: Conexión directa y ejecución de backups en MySQL.
  - `pg`: Cliente nativo de PostgreSQL.
  - `mssql`: Conector oficial para Microsoft SQL Server.
  - `mongodb`: Driver oficial para MongoDB.
  - `cassandra-driver`: Driver oficial para Apache Cassandra.
- **Orquestación**: Docker y Docker Compose para desplegar los contenedores de las bases de datos de prueba.

---

## Requisitos del Sistema

1. **Node.js**: Versión 18.0 o superior.
2. **npm**: Versión 9.0 o superior.
3. **Docker Desktop** (opcional pero recomendado): Para la infraestructura de contenedores predefinida.

---

## Instalación y Configuración

### 1. Clonar o descargar el repositorio
```bash
git clone <URL_DEL_REPOSITO>
cd monitor-sgbd
```

### 2. Instalar dependencias del proyecto
```bash
npm install
```

### 3. Despliegue de los Contenedores de SGBD (Docker Compose)
El proyecto incluye la definición de los 5 servicios en un archivo `docker-compose.yml` (o `db.yml`). Para levantar todas las bases de datos con sus configuraciones por defecto, ejecuta:

```bash
docker compose up -d
```

#### Puertos y Credenciales por Defecto de la Red (`db_net` - Subred 10.10.0.0/24):

| SGBD | Contenedor | Puerto Host | Usuario | Contraseña | Base de Datos | IP Contenedor |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **MySQL** | `db_mysql_container` | `3308` | `root` | `root` | `dbejemplo` | `10.10.0.2` |
| **SQL Server** | `sqlserver_container` | `1433` | `sa` | `Password123!` | `master` | `10.10.0.3` |
| **PostgreSQL** | `postgresql_container` | `5433` | `USUARIOPRINCIPAL` | `root` | `dbejemplo` | `10.10.0.4` |
| **MongoDB** | `mongodb_container` | `27017` | `USUARIOPRINCIPAL` | `root` | `dbejemplo` | `10.10.0.5` |
| **Cassandra** | `cassandra_container` | `9042` | `cassandra` | `cassandra` | `dbejemplo` | `10.10.0.6` |

---

## Ejecución de la Aplicación

Para iniciar el servidor de desarrollo del monitor:

```bash
npm run dev
```

Abre tu navegador e ingresa a `http://localhost:3000`.

Para compilar la versión de producción:
```bash
npm run build
npm run start
```

---

## Configuración Personalizable de SGBD

El monitor incluye un **Menú de Configuraciones** accesible mediante el botón con ícono de engranaje en el formulario superior. Desde este menú se pueden personalizar para cada motor:
- **Host / Dirección IP** (ej. `localhost`, `127.0.0.1` o IPs de la red local).
- **Puerto de conexión**.
- **Usuario principal** y **Contraseña**.
- **Base de Datos / Keyspace predeterminado**.

Además, cuenta con un botón para **Probar Conexión** que verifica la alcanzabilidad del servicio antes de guardar los cambios. La configuración se guarda automáticamente en el almacenamiento local del navegador (`localStorage`).
