# Guía Rápida de Uso (HOWTO) - Monitor de SGBD

Esta guía proporciona las instrucciones necesarias para utilizar las funciones principales del **Monitor de SGBD Relacionales y NoSQL**.

---

## 1. Menú de Configuraciones y Conexión

1. Al abrir la aplicación web (`http://localhost:3000`), dirígete al panel superior **Conexión Activa de Monitoreo**.
2. Selecciona el motor con el que deseas trabajar en el menú desplegable **Motor SGBD** (MySQL, SQL Server, PostgreSQL, MongoDB, Cassandra).
3. Para ajustar o personalizar las credenciales, haz clic en el botón **Menú de Configuraciones**.
4. En el menú modal:
   - Selecciona la pestaña del motor a configurar.
   - Ingresa los datos de Host, Puerto, Usuario, Contraseña y Base de Datos.
   - Presiona **Probar Conexión** para validar la disponibilidad del SGBD.
   - Haz clic en **Guardar Cambios**.

---

## 2. Monitoreo de Servicios Docker (Nodos)

En el panel izquierdo **Nodos y Servicios Docker**, puedes visualizar en tiempo real:
- El estado activo/inactivo del contenedor Docker de cada SGBD.
- El consumo actual de **CPU (%)** y memoria **RAM** consumida.
- Botones para **Iniciar** (ícono Play) o **Detener** (ícono Cuadrado) cada contenedor directamente desde la interfaz.

---

## 3. Dashboard de Telemetría e Indicadores

En la sección central izquierda **Telemetría**, el monitor consulta periódicamente la salud del motor seleccionado:
- **Estado**: Indica si la base de datos está `ONLINE` (junto con la latencia en ms) o `OFFLINE`.
- **Conexiones Activas**: Muestra el número actual de sesiones de usuario conectadas y el tiempo activo del servidor (Uptime).
- **Esquema / Objetos**: Lista todas las tablas o colecciones de la base de datos seleccionada. 
  - *Sugerencia*: Al hacer clic sobre cualquier tabla en la lista, se genera automáticamente una consulta de inspección (`SELECT * FROM tabla LIMIT 50;`) en la consola.

---

## 4. Asistente Visual Dinámico (CRUD) y Consola

La plataforma incluye un **Asistente Visual (CRUD)** pensado para que cualquier usuario pueda realizar operaciones sin necesidad de conocer la sintaxis SQL o de comandos:

### A. Asistente Visual (Formulario CRUD Dinámico)
Accede haciendo clic en la pestaña **Asistente Visual (CRUD)** dentro de la consola:
1. **Bases de Datos Dinámicas**: Selecciona cualquier base de datos presente en el servidor directamente desde el menú desplegable de BD.
2. **Tablas / Colecciones Dinámicas**: El menú desplegable de tablas se actualiza automáticamente mostrando solo los objetos existentes en la BD seleccionada.
3. **Autocompletado de Campos**: Al seleccionar una tabla, los campos/columnas se autocompletan. Puedes hacer clic en los tags de campos (`+ campo`) o presionar **Auto-rellenar columnas** al realizar un `INSERT` o `UPDATE`.
4. **Operaciones Soportadas**:
   - `SELECT`: Consulta todos los registros de la tabla seleccionada. En MongoDB genera la estructura de consulta adecuada.
   - `INSERT`: Genera la inserción en tablas o documentos en MongoDB de forma automática.
   - `UPDATE`: Permite definir los campos a modificar y la condición `WHERE` (filtro por ID u otra columna).
   - `DELETE`: Elimina registros o documentos basándose en la condición configurada.

### B. Consola Libre (Modo SQL / Comandos)
Para usuarios avanzados que prefieran escribir sentencias directamente. Presiona **Ctrl + Enter** o el botón **Ejecutar Consulta** para enviar el comando.

#### Ejemplos de Sintaxis por SGBD:
- **MySQL / PostgreSQL / SQL Server**: `SELECT * FROM productos;`
- **MongoDB**: Podrás escribir comandos en JSON o palabras clave simples (`show collections`, `show dbs`, `dbstats`).
- **Apache Cassandra**: `SELECT * FROM dbejemplo.productos;`

---

## 5. Respaldos (Backups SQL) y Transferencia FTP

Para el motor **MySQL**, la consola incluye botones dedicados para la gestión de respaldos:
- **Backup SQL**: Genera un volcado completo de la base de datos seleccionada y lo descarga como un archivo `.sql` en tu equipo.
- **Subir FTP**: Genera el archivo de respaldo y lo transfiere automáticamente al servidor FTP configurado en la plataforma.
