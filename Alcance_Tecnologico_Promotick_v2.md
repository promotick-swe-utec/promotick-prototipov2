PROMOTICK — Sistema de Gestión de Productos	Alcance Tecnológico v2.0

**PROMOTICK**

Sistema de Gestión de Productos 

Documento de Alcance Tecnológico

Diccionario de Datos, Arquitectura, Flujos y Propuesta de Pantallas

*Programa Promotick — Universidad UTEC*

Versión 2.0  |  Abril 2026


# **Tabla de Contenido**
1\. Introducción y contexto del proyecto

2\. Alcance del sistema

3\. Arquitectura tecnológica

4\. Flujos de procesos principales

5\. Propuesta de pantallas

6\. Lógica del código NetSuite

7\. Diccionario de datos

8\. Mapeo de campos fuente vs. BD maestra

9\. Integración con inteligencia artificial

10\. Consideraciones no funcionales

11\. Plan de entrega sugerido

12\. Glosario


# **1. Introducción y Contexto del Proyecto**
Promotick, en el marco del programa de colaboración con la Universidad UTEC, presenta este caso de uso para el desarrollo de un Sistema de Gestión de Productos con Inteligencia Artificial. El objetivo es resolver la complejidad operativa de consolidar información de productos proveniente de múltiples proveedores con formatos heterogéneos, hacia una base de datos maestra normalizada que sirva como fuente única de verdad para la generación de archivos de importación al ERP NetSuite y a las múltiples aplicaciones web donde Promotick opera.

## **1.1 Objetivos del Sistema**
- Consolidar productos de múltiples proveedores en una base maestra normalizada.
- Reducir el tiempo de carga manual mediante mapeo inteligente y enriquecimiento con IA.
- Garantizar unicidad de registros detectando duplicados automáticamente.
- Mantener histórico de precios por proveedor con auditoría completa.
- Generar plantillas de importación para NetSuite (CSV) y para aplicaciones web (XLSX) de forma configurable por cliente.

## **1.2 Parámetros y Dimensionamiento**

|**Parámetro**|**Valor**|
| :- | :- |
|Volumen aproximado de productos en catálogo|~20,000 productos|
|Frecuencia máxima de cargas de proveedores|1 carga por día|
|Volumen máximo por carga|~500 registros por archivo|
|Usuarios concurrentes esperados|1 persona como usuario principal de contenido|
|Cantidad de aplicaciones web destino|Múltiples (configurables en el sistema)|
|ERP destino|NetSuite (formato CSV, importación manual)|

# **2. Alcance del Sistema**
## **2.1 Módulos Funcionales**

|**Módulo**|**Nombre**|**Descripción**|
| :- | :- | :- |
|M01|Gestión de Proveedores|CRUD de proveedores (razón social, RUC, contacto, estado). Registro obligatorio previo a cualquier carga. Cada proveedor tiene asociadas sus plantillas de mapeo.|
|M02|Ingesta de Plantillas Excel|Upload del archivo del proveedor previamente seleccionado. Parser automático que detecta la cantidad de encabezados, hoja y fila de inicio de datos.|
|M03|Motor de Mapeo con IA|Asociación dinámica entre columnas del proveedor y campos de la BD maestra. Primera vez sugerida por IA (Claude), luego guardada y reutilizada. El usuario confirma o ajusta.|
|M04|Análisis Previo + Detección de Duplicados|Paso 1 del flujo: analiza la plantilla, detecta duplicados (por SKU/EAN y similitud semántica con IA) y muestra en UI los posibles duplicados antes de la confirmación.|
|M05|Enriquecimiento con IA|Autocompletado de descripción, specs, marca, dimensiones, peso, imágenes y normalización del precio (elimina símbolos de moneda). Se muestra al usuario antes de confirmar.|
|M06|Confirmación de Registro|Paso 2 del flujo: el usuario revisa lote completo (nuevos, duplicados, enriquecidos) y confirma o rechaza uno por uno antes de persistir en la BD maestra.|
|M07|BD Maestra de Productos|Repositorio central con información consolidada de todos los productos, categorías y precios por proveedor.|
|M08|Gestión de Categorías y Subcategorías|Administración del árbol con código manual de letras (categoría) y código numérico (subcategoría). El sistema valida que no haya códigos repetidos.|
|M09|Código NetSuite Autogenerado|Generación automática del código NS-XX-XX-XXXX por subcategoría, con persistencia de la secuencia actual. Al superar 9999 se incrementa el número de dígitos.|
|M10|Registro de Precios por Proveedor|Historial de precios por producto y proveedor, con fecha de vigencia. El precio oficial corresponde al proveedor preferido.|
|M11|Gestión de Clientes (Destinos)|Registro de aplicaciones web y del ERP como clientes. Cada cliente tiene encabezado propio, árbol de categorías propio y configuración de conversión de puntos.|
|M12|Mapeo de Categorías Cliente-Maestro|Asociación entre categorías del cliente y subcategorías de la BD maestra para la generación de plantillas de salida.|
|M13|Generador de Plantillas de Salida|Motor de exportación configurable: archivo XLSX para aplicaciones web y CSV para NetSuite. Los tags de web se autogeneran con IA.|
|M14|Administración de Usuarios y Roles|Usuarios con login local (usuario + contraseña). Roles dinámicos con permisos granulares configurables.|
|M15|Auditoría y Logs|Registro de todas las acciones del sistema: cargas, confirmaciones, exportaciones, cambios de precio, ediciones de producto.|
|M16|Panel de Control|Dashboard con métricas: productos cargados, pendientes de revisión, duplicados detectados, exportaciones generadas.|

## **2.2 Fuera del Alcance**
- Integración directa en tiempo real con NetSuite (la exportación es por archivo CSV y se importa manualmente).
- Push automático a las aplicaciones web (el usuario descarga el XLSX y lo sube manualmente al administrador de cada web).
- Módulo de facturación, órdenes de compra o cuentas por pagar.
- Portal externo para que los proveedores carguen sus propias plantillas.
- Módulo de inventario, stock o control logístico.
- Single Sign-On (SSO) o integración con directorios corporativos.
- Conversión de monedas (todos los precios se trabajan en soles).

## **2.3 Consideración para Migración Inicial**
Los productos existentes en el catálogo actual de Promotick (aproximadamente 20,000) tienen códigos legacy que no siguen el formato NS-XX-XX-XXXX. Estos productos serán migrados mediante una carga manual inicial al sistema antes del go-live. A partir del despliegue productivo, todo nuevo producto registrado deberá seguir estrictamente el nuevo formato de código NetSuite.

# **3. Arquitectura Tecnológica**
## **3.1 Restricciones Tecnológicas Definidas**
El equipo UTEC tiene libertad en la selección del stack específico con las siguientes restricciones obligatorias:

- La infraestructura debe ser compatible con despliegue en Amazon Web Services (AWS).
- Si se utiliza una base de datos relacional, debe ser PostgreSQL.
- Como referencia, el backend puede ser desarrollado en Java + Spring Boot o utilizando arquitectura serverless con AWS Lambda.
- El frontend es a criterio del equipo de proyecto (SPA moderna).

## **3.2 Stack Tecnológico de Referencia**

|**Capa**|**Tecnología de Referencia**|**Observaciones**|
| :- | :- | :- |
|Infraestructura|Amazon Web Services (AWS)|Restricción obligatoria. Despliegue cloud.|
|Base de Datos|PostgreSQL (Amazon RDS)|Restricción obligatoria si se usa BD relacional.|
|Backend (opción 1)|Java + Spring Boot|Tecnología de referencia para API monolítica clásica.|
|Backend (opción 2)|AWS Lambda Serverless|Tecnología de referencia para arquitectura serverless.|
|Frontend|A criterio del equipo UTEC|React, Angular, Vue u otro SPA moderno. No hay restricción.|
|Almacenamiento de archivos|Amazon S3|Para Excel originales, archivos generados y documentos.|
|Logs y monitoreo|Amazon CloudWatch|Logs de aplicación y auditoría.|
|IA / LLM|Anthropic Claude API|Para mapeo semántico, enriquecimiento y generación de tags.|
|Autenticación|Local (usuario + contraseña)|Sin SSO. Hashing con bcrypt o similar. JWT para sesión.|
|Procesamiento async|AWS SQS + Workers o Celery-equivalente|Para cargas de hasta ~500 registros por archivo.|

## **3.3 Diagrama de Arquitectura**
![](Aspose.Words.e6aaf71a-91c6-40b2-b968-cb867160560c.001.png)

*Figura 1. Arquitectura general del sistema desplegada en AWS.*

La solución se estructura en las siguientes capas:

1. Capa de Presentación: SPA accesible vía navegador, consume la API vía HTTPS con tokens JWT.
1. Capa de Aplicación: API REST principal (Spring Boot o Lambda) que orquesta la lógica de negocio, más workers asíncronos para procesamiento de archivos y tareas de IA.
1. Capa de Datos: PostgreSQL en Amazon RDS como BD principal; Amazon S3 para archivos; CloudWatch para logs y auditoría.
1. Servicios Externos: Anthropic Claude API para todas las operaciones de IA (mapeo, detección de duplicados, enriquecimiento, generación de tags).


# **4. Flujos de Procesos Principales**
El sistema opera sobre dos flujos centrales: el flujo de ingesta y enriquecimiento de productos desde plantillas de proveedores, y el flujo de generación de plantillas de salida para clientes destino (webs y ERP).

## **4.1 Flujo de Ingesta y Procesamiento de Plantillas**
Este flujo tiene dos pasos de interacción con el usuario: (1) análisis y validación con intervención de IA, y (2) confirmación final del registro. Esto asegura que el usuario siempre revise los duplicados detectados y los datos enriquecidos antes de que se persistan en la BD maestra.

![](Aspose.Words.e6aaf71a-91c6-40b2-b968-cb867160560c.002.png)

*Figura 2. Flujo de ingesta de plantilla de proveedor, procesamiento con IA y confirmación.*

### **Descripción paso a paso**
1. El usuario selecciona al proveedor que envió el archivo. Si el proveedor no existe, primero debe ser registrado (módulo M01).
1. Se sube el archivo Excel del proveedor al sistema.
1. Parser automático detecta la hoja activa, la fila de encabezados y la cantidad de columnas, sin importar la estructura del archivo.
1. Si el proveedor ya tiene plantilla de mapeo guardada, se aplica automáticamente. Si es nuevo, se invoca a Claude para sugerir el mapeo semántico entre las columnas del proveedor y los campos de la BD maestra.
1. El usuario revisa y confirma (o corrige) el mapeo. Una vez confirmado, se guarda para cargas futuras del mismo proveedor.
1. Se ejecuta la normalización de datos: limpieza de precios (eliminación de símbolos de moneda), conversión a tipos correctos, validación de integridad.
1. Se detectan duplicados mediante match exacto por SKU/EAN y análisis de similitud semántica con IA. Los posibles duplicados se marcan para revisión en la UI.
1. Para cada producto con campos incompletos, se invoca el pipeline de enriquecimiento: Claude busca en internet por el nombre o código y autocompleta descripción, specs, marca, dimensiones, peso e imágenes (como URL).
1. El usuario accede al panel de revisión previa donde ve el lote completo con tres secciones: productos nuevos, posibles duplicados detectados y productos con datos enriquecidos por IA. Cada campo enriquecido por IA se marca visualmente.
1. Si el usuario confirma, los productos se persisten en la BD maestra: se asigna código NetSuite autogenerado, se registra el precio en la tabla de precios por proveedor y se escribe el log de auditoría. Si no confirma, puede corregir, rechazar o re-ejecutar el enriquecimiento.


## **4.2 Flujo de Generación de Plantillas de Salida**
Este flujo permite exportar los productos de la BD maestra a los formatos requeridos por cada cliente destino. Antes de generar cualquier plantilla de salida, el cliente debe estar registrado en el sistema con su encabezado, árbol de categorías propio y configuración específica.


### **Descripción paso a paso**
1. El usuario selecciona el cliente destino: una aplicación web previamente registrada o el ERP NetSuite.
1. Según el tipo, el sistema selecciona el formato de salida: XLSX para aplicaciones web, CSV para NetSuite.
1. El usuario filtra los productos a exportar por categoría, subcategoría, estado y/o rango de fechas.
1. El sistema mapea las categorías y subcategorías de la BD maestra a las categorías propias del cliente usando la tabla de mapeo cliente-maestro.
1. Se aplica la configuración específica del cliente: factor de conversión de puntos (si aplica), valores por defecto para campos sin origen y campos que deben quedar vacíos (ej: ID Tipo Canje, ID Giftcard).
1. Para clientes web, se autogeneran los tags y etiquetas del producto utilizando Claude en base al nombre, descripción y categoría del producto.
1. Se construye el archivo final aplicando la plantilla de salida configurada para ese cliente.
1. El archivo se descarga y se registra el job de exportación en el log de auditoría. El usuario luego lo importa manualmente en NetSuite o en el administrador de la aplicación web correspondiente.


# **5. Propuesta de Pantallas**
Esta sección describe las pantallas funcionales que el sistema debería proveer. El diseño visual específico queda a criterio del equipo UTEC, pero la estructura y los elementos funcionales son requerimiento.

## **5.1 Pantalla: Login**

|**🖥  P01 — Inicio de Sesión**||
| :- | :- |
|**Propósito**|Autenticación local del usuario mediante usuario y contraseña.|
|**Elementos**|Logo Promotick · Campo usuario · Campo contraseña · Botón 'Iniciar sesión' · Enlace '¿Olvidaste tu contraseña?'|
|**Acciones**|Valida credenciales contra BD local · Genera token JWT · Redirige a Dashboard|
|**Roles**|Todos|

## **5.2 Pantalla: Dashboard Principal**

|**🖥  P02 — Dashboard**||
| :- | :- |
|**Propósito**|Vista general del estado del catálogo y operaciones recientes.|
|**Elementos**|<p>Tarjetas de métricas (total productos, pendientes de revisión, duplicados detectados, cargas del mes)</p><p>Gráfico de cargas por proveedor</p><p>Gráfico de productos por categoría</p><p>Listado de últimas 10 actividades del sistema</p>|
|**Acciones**|Links rápidos a: Nueva carga · Revisar pendientes · Generar plantilla|
|**Roles**|Todos|

## **5.3 Pantalla: Gestión de Proveedores**

|**🖥  P03 — Proveedores**||
| :- | :- |
|**Propósito**|CRUD de proveedores. Registro previo obligatorio antes de cualquier carga.|
|**Elementos**|<p>Listado con búsqueda y filtros (razón social, RUC, estado)</p><p>Botón 'Nuevo proveedor'</p><p>Acciones por fila: editar · ver historial de cargas · activar/desactivar</p><p>Indicador de proveedor preferido</p>|
|**Formulario**|Razón social · RUC · Código interno · Email contacto · Teléfono · Proveedor preferido (sí/no) · Estado activo|
|**Roles**|Administrador, Ejecutivo con permiso|

## **5.4 Pantalla: Gestión de Categorías y Subcategorías**

|**🖥  P04 — Categorías**||
| :- | :- |
|**Propósito**|Administrar el árbol de categorías y subcategorías del catálogo maestro.|
|**Elementos**|<p>Árbol expandible con categorías y subcategorías</p><p>Botón 'Nueva categoría' y 'Nueva subcategoría'</p><p>Columna con código NetSuite asignado (letras o números)</p><p>Columna 'Secuencia actual' para subcategorías</p>|
|**Formulario Categoría**|Nombre · Código (2 letras, ej: AL, EL) · Descripción · Estado|
|**Formulario Subcategoría**|Categoría padre · Nombre · Código (2+ dígitos) · Descripción · Estado|
|**Validaciones**|Código de categoría único · Código de subcategoría único dentro de su categoría padre · No se puede eliminar si hay productos asociados|
|**Roles**|Administrador|


## **5.5 Pantalla: Carga de Plantilla de Proveedor (Paso 1 - Análisis)**

|**🖥  P05 — Cargar Plantilla**||
| :- | :- |
|**Propósito**|Subir el archivo Excel del proveedor e iniciar el análisis con IA.|
|**Elementos**|<p>Selector de proveedor (desplegable con buscador)</p><p>Zona de drag & drop para el archivo Excel</p><p>Indicador de progreso durante el análisis</p><p>Preview de las primeras 10 filas detectadas</p><p>Tabla de mapeo de columnas: Columna detectada en proveedor ↔ Campo de BD maestra</p><p>Cada fila de mapeo es editable; campos con selector desplegable</p><p>Botón 'Analizar con IA' (si no hay plantilla previa)</p><p>Botón 'Guardar plantilla y continuar'</p>|
|**Acciones**|Detecta estructura · Aplica plantilla guardada si existe · Invoca IA para sugerir mapeo · Permite ajustar manualmente · Guarda plantilla para reusar|
|**Roles**|Ejecutivo, Administrador|

## **5.6 Pantalla: Revisión de Lote (Paso 2 - Confirmación)**

|**🖥  P06 — Revisión Previa**||
| :- | :- |
|**Propósito**|Revisar el lote procesado antes de persistir en la BD maestra.|
|**Elementos**|<p>Resumen superior: total procesados · nuevos · duplicados detectados · enriquecidos</p><p>Tabs: 'Nuevos' · 'Posibles Duplicados' · 'Enriquecidos por IA'</p><p>Para cada producto: vista tipo ficha con todos los campos · columna indicando 'origen del dato' (proveedor/IA/manual)</p><p>Para duplicados: producto nuevo vs. producto existente lado a lado, con score de similitud y razón de la IA</p><p>Acciones por producto: confirmar · rechazar · editar · fusionar con existente</p><p>Botones globales: 'Confirmar todo' · 'Rechazar todo' · 'Re-ejecutar enriquecimiento'</p>|
|**Indicadores visuales**|Campos enriquecidos por IA marcados con icono distintivo · badge de 'posible duplicado' · badge de 'precio normalizado'|
|**Roles**|Ejecutivo, Administrador|

## **5.7 Pantalla: Catálogo Maestro de Productos**

|**🖥  P07 — Catálogo de Productos**||
| :- | :- |
|**Propósito**|Consultar, buscar y editar productos registrados en la BD maestra.|
|**Elementos**|<p>Barra de búsqueda (SKU, EAN, nombre, código NetSuite)</p><p>Filtros laterales (categoría, subcategoría, proveedor, marca, estado)</p><p>Tabla paginada con columnas principales y miniatura de imagen</p><p>Acciones por producto: ver detalle · editar · ver historial de precios · desactivar</p><p>Exportar listado filtrado a Excel</p>|
|**Vista Detalle**|Ficha completa del producto con todos los campos maestros · Pestaña de precios por proveedor con historial · Pestaña de auditoría con log de cambios|
|**Roles**|Todos (visualizador solo lectura)|


## **5.8 Pantalla: Gestión de Clientes (Destinos)**

|**🖥  P08 — Clientes**||
| :- | :- |
|**Propósito**|Registrar las aplicaciones web y el ERP como clientes que recibirán plantillas de salida.|
|**Elementos**|<p>Listado de clientes registrados con tipo (web/ERP) y estado</p><p>Botón 'Nuevo cliente'</p><p>Acciones: editar · gestionar árbol de categorías · configurar plantilla de salida · configuración específica (conversión de puntos)</p>|
|**Formulario Cliente**|Nombre · Tipo (web, ERP, marketplace) · Descripción · Estado activo|
|**Roles**|Administrador|

## **5.9 Pantalla: Mapeo de Categorías por Cliente**

|**🖥  P09 — Mapeo de Categorías Cliente**||
| :- | :- |
|**Propósito**|Asociar las categorías propias del cliente con las subcategorías de la BD maestra.|
|**Elementos**|<p>Selector de cliente</p><p>Tabla con dos columnas: Categoría del cliente ↔ Subcategoría maestra</p><p>Carga masiva del árbol del cliente vía Excel</p><p>Botón 'Sugerir mapeo con IA' (Claude sugiere los matches más probables)</p><p>Botón 'Guardar mapeo'</p>|
|**Roles**|Administrador|

## **5.10 Pantalla: Configuración de Plantilla de Salida por Cliente**

|**🖥  P10 — Plantilla de Salida**||
| :- | :- |
|**Propósito**|Definir qué columnas, en qué orden y con qué transformaciones se generará el archivo para cada cliente.|
|**Elementos**|<p>Selector de cliente</p><p>Tabla editable de columnas de salida: Orden · Nombre de columna · Campo origen de BD · Valor por defecto · Transformación (opcional)</p><p>Checkbox 'incluir encabezado'</p><p>Selector de formato (XLSX/CSV)</p><p>Configuración específica: factor de conversión de puntos (numérico) · valores fijos para ID Tipo Canje · ID Giftcard (vacío)</p><p>Botón 'Vista previa' y 'Guardar plantilla'</p>|
|**Roles**|Administrador|

## **5.11 Pantalla: Generar Plantilla de Salida**

|**🖥  P11 — Generar Exportación**||
| :- | :- |
|**Propósito**|Generar el archivo de salida para un cliente específico.|
|**Elementos**|<p>Selector de cliente</p><p>Filtros de productos a incluir: categoría, subcategoría, estado, fecha de última modificación</p><p>Contador dinámico de productos que coinciden con los filtros</p><p>Botón 'Generar archivo'</p><p>Barra de progreso durante generación (incluye autogeneración de tags con IA)</p><p>Botón 'Descargar' al finalizar</p>|
|**Historial**|Tabla con exportaciones anteriores: cliente, fecha, cantidad, usuario, archivo descargable|
|**Roles**|Ejecutivo, Administrador|


## **5.12 Pantalla: Administración de Usuarios y Roles**

|**🖥  P12 — Usuarios y Roles**||
| :- | :- |
|**Propósito**|Gestionar los usuarios del sistema y los roles con permisos granulares dinámicos.|
|**Elementos**|<p>Sección 'Usuarios': listado, nuevo usuario, editar, activar/desactivar, reset password</p><p>Sección 'Roles': listado de roles, nuevo rol, editar permisos</p><p>Matriz de permisos dinámica: filas = permisos granulares (crear proveedor, cargar archivo, confirmar lote, gestionar categorías, generar exportación, administrar usuarios, etc.) · columnas = roles · celdas = checkbox de permiso</p>|
|**Formulario Usuario**|Nombre completo · Email · Usuario · Contraseña · Rol asignado · Estado|
|**Formulario Rol**|Nombre del rol · Descripción · Permisos seleccionados de la matriz|
|**Roles**|Administrador únicamente|

## **5.13 Pantalla: Log de Auditoría**

|**🖥  P13 — Auditoría**||
| :- | :- |
|**Propósito**|Consultar el histórico de todas las acciones realizadas en el sistema.|
|**Elementos**|<p>Filtros: tipo de acción · usuario · fecha desde/hasta · entidad afectada</p><p>Tabla con columnas: fecha/hora, usuario, acción, entidad, ID entidad, detalle (JSON con cambios)</p><p>Exportar resultado filtrado a Excel</p>|
|**Acciones auditadas**|Login · logout · creación/edición/eliminación de entidades · cargas de archivos · confirmaciones de lote · exportaciones · cambios de precio · cambios de mapeo|
|**Roles**|Administrador|


# **6. Lógica del Código NetSuite**
El código NetSuite de cada producto es autogenerado por el sistema al momento del registro, siguiendo la siguiente estructura estricta:

|**Sección**|**Ejemplo**|**Formato**|**Descripción**|
| :- | :- | :- | :- |
|Prefijo plataforma|NS|Fijo (2 letras)|Identifica NetSuite como plataforma.|
|Código Categoría|AL|2 letras manuales|Se registra al crear la categoría. Único en el sistema.|
|Código Subcategoría|01|2+ dígitos manuales|Se registra al crear la subcategoría. Único dentro de la categoría padre.|
|Serial Producto|0042|4+ dígitos auto|Secuencia auto-incremental por subcategoría, rellenada con ceros a la izquierda. Al llegar a 9999 agrega un dígito adicional (10000, 10001...).|

Ejemplo completo: NS-AL-01-0042

Consideraciones de implementación:

- La tabla subcategory mantiene el campo current\_sequence que guarda el último serial usado en esa subcategoría.
- Cada nuevo producto incrementa atómicamente este valor para garantizar unicidad incluso con múltiples registros simultáneos.
- Al crear categorías y subcategorías, el sistema valida que el código de letras (categoría) y el código numérico (subcategoría dentro de su categoría padre) no estén repetidos.
- El formato del serial es dinámico: PAD con ceros a la izquierda hasta 4 dígitos mínimo, expandible a 5 o más dígitos cuando sea necesario.


# **7. Diccionario de Datos**
A continuación se describe el modelo de datos completo de la base de datos de la aplicación. El motor de base de datos obligatorio es PostgreSQL sobre Amazon RDS.

**Convenciones:**

- PK: indica que el campo es clave primaria.
- NN: indica que el campo es NOT NULL (obligatorio).
- Todas las tablas incluyen auditoría básica (created\_at, updated\_at, created\_by, updated\_by).
- El sistema mantiene un log de auditoría adicional en la tabla audit\_log para cualquier cambio crítico.

## **7.1 Tabla: category**

|**category**  —  Categorías padre del catálogo de productos|||||
| :- | :- | :- | :- | :- |
|**Campo**|**Tipo**|**PK**|**NN**|**Descripción**|
|id|SERIAL|✓|✓|Identificador único autoincremental.|
|code|VARCHAR(5)||✓|Código de 2 letras para el código NetSuite. Ej: 'AL'. Único en todo el sistema.|
|name|VARCHAR(120)||✓|Nombre de la categoría. Único en el sistema.|
|description|TEXT|||Descripción detallada de la categoría.|
|is\_active|BOOLEAN||✓|Estado activo. Default: TRUE.|
|created\_at|TIMESTAMPTZ||✓|Fecha y hora de creación.|
|updated\_at|TIMESTAMPTZ||✓|Fecha y hora de última modificación.|
|created\_by|INTEGER|||FK → app\_user.id.|
|updated\_by|INTEGER|||FK → app\_user.id.|

## **7.2 Tabla: subcategory**

|**subcategory**  —  Subcategorías asociadas a una categoría padre|||||
| :- | :- | :- | :- | :- |
|**Campo**|**Tipo**|**PK**|**NN**|**Descripción**|
|id|SERIAL|✓|✓|Identificador único autoincremental.|
|category\_id|INTEGER||✓|FK → category.id.|
|code|VARCHAR(4)||✓|Código numérico de 2+ dígitos para NetSuite. Ej: '01'. Único dentro de su categoría padre.|
|name|VARCHAR(120)||✓|Nombre de la subcategoría. Único dentro de la categoría padre.|
|description|TEXT|||Descripción de la subcategoría.|
|current\_sequence|INTEGER||✓|Último serial utilizado para generar código NetSuite. Default: 0.|
|is\_active|BOOLEAN||✓|Estado activo. Default: TRUE.|
|created\_at|TIMESTAMPTZ||✓|Fecha y hora de creación.|
|updated\_at|TIMESTAMPTZ||✓|Fecha y hora de última modificación.|
|created\_by|INTEGER|||FK → app\_user.id.|
|updated\_by|INTEGER|||FK → app\_user.id.|


## **7.3 Tabla: product**

|**product**  —  Tabla maestra de productos — fuente única de verdad|||||
| :- | :- | :- | :- | :- |
|**Campo**|**Tipo**|**PK**|**NN**|**Descripción**|
|id|SERIAL|✓|✓|Identificador único autoincremental interno.|
|netsuite\_code|VARCHAR(30)||✓|Código autogenerado NS-XX-XX-XXXX. Único en el sistema.|
|legacy\_code|VARCHAR(50)|||Código antiguo del producto (para registros migrados).|
|internal\_id\_netsuite|VARCHAR(50)|||ID interno asignado por NetSuite tras importación.|
|sku|VARCHAR(100)|||Código SKU del producto. Índice único cuando no es nulo.|
|ean|VARCHAR(30)|||Código EAN/UPC. Índice único cuando no es nulo.|
|mpn|VARCHAR(100)|||Manufacturer Part Number.|
|name|VARCHAR(255)||✓|Nombre interno del producto (uso en ERP).|
|display\_name|VARCHAR(255)|||Nombre comercial para mostrar en catálogos y webs.|
|purchase\_description|TEXT|||Descripción para órdenes de compra (NetSuite).|
|sale\_description|TEXT|||Descripción para facturas y cotizaciones (NetSuite).|
|long\_description|TEXT|||Descripción larga enriquecida para webs.|
|brand|VARCHAR(120)|||Marca del producto.|
|model|VARCHAR(120)|||Modelo del producto.|
|subcategory\_id|INTEGER|||FK → subcategory.id.|
|specifications|JSONB|||Especificaciones técnicas variables en JSON.|
|weight\_kg|NUMERIC(10,4)|||Peso real en kilogramos.|
|volumetric\_weight\_kg|NUMERIC(10,4)|||Peso volumétrico en kilogramos.|
|linear\_weight|NUMERIC(10,4)|||Peso lineal para cálculo logístico.|
|length\_cm|NUMERIC(10,2)|||Largo del empaque en centímetros.|
|width\_cm|NUMERIC(10,2)|||Ancho del empaque en centímetros.|
|height\_cm|NUMERIC(10,2)|||Alto del empaque en centímetros.|
|tax\_type|VARCHAR(50)|||Programa fiscal para NetSuite. Ej: 'Estandar', 'Exentas'.|
|agreements|VARCHAR(100)|||Convenios asociados.|
|catalog\_validity|VARCHAR(50)|||Vigencia del catálogo. Ej: 'Anual', 'Mensual'.|
|image\_main\_url|TEXT|||URL de imagen principal (solo link, sin descarga).|
|image\_detail\_url|TEXT|||URL de imagen de detalle.|
|image\_mobile\_url|TEXT|||URL de imagen móvil.|
|image\_mobile\_featured\_url|TEXT|||URL de imagen móvil destacada.|
|image\_mobile\_detail\_url|TEXT|||URL de imagen móvil de detalle.|
|pdf\_url|TEXT|||URL del PDF técnico o ficha.|
|status|VARCHAR(20)||✓|'draft', 'active', 'inactive', 'pending\_confirmation'. Default: 'draft'.|
|preferred\_supplier\_id|INTEGER|||FK → supplier.id. Proveedor preferido de este producto.|
|is\_enriched\_by\_ai|BOOLEAN||✓|Fue enriquecido por IA. Default: FALSE.|
|ai\_enriched\_fields|TEXT[]|||Array de campos enriquecidos por IA (para visualización).|
|ai\_enrichment\_date|TIMESTAMPTZ|||Fecha del último enriquecimiento.|
|dimensions\_validated|BOOLEAN||✓|Medidas físicas validadas manualmente. Default: FALSE.|
|last\_price\_update|TIMESTAMPTZ|||Fecha de última actualización de precio.|
|created\_at|TIMESTAMPTZ||✓|Fecha y hora de creación.|
|updated\_at|TIMESTAMPTZ||✓|Fecha y hora de última modificación.|
|created\_by|INTEGER|||FK → app\_user.id.|
|updated\_by|INTEGER|||FK → app\_user.id.|


## **7.4 Tabla: supplier**

|**supplier**  —  Proveedores registrados en el sistema (registro previo obligatorio)|||||
| :- | :- | :- | :- | :- |
|**Campo**|**Tipo**|**PK**|**NN**|**Descripción**|
|id|SERIAL|✓|✓|Identificador único autoincremental.|
|name|VARCHAR(200)||✓|Razón social del proveedor. Único.|
|code|VARCHAR(50)|||Código interno del proveedor.|
|ruc|VARCHAR(20)|||RUC del proveedor.|
|contact\_email|VARCHAR(150)|||Email de contacto.|
|contact\_phone|VARCHAR(30)|||Teléfono de contacto.|
|preferred|BOOLEAN||✓|Proveedor preferido. Default: FALSE.|
|active\_template\_id|INTEGER|||FK → supplier\_template.id. Plantilla activa de mapeo.|
|is\_active|BOOLEAN||✓|Estado activo. Default: TRUE.|
|created\_at|TIMESTAMPTZ||✓|Fecha y hora de creación.|
|updated\_at|TIMESTAMPTZ||✓|Fecha y hora de última modificación.|
|created\_by|INTEGER|||FK → app\_user.id.|
|updated\_by|INTEGER|||FK → app\_user.id.|

## **7.5 Tabla: product\_price**

|**product\_price**  —  Historial de precios por producto y proveedor (siempre en PEN)|||||
| :- | :- | :- | :- | :- |
|**Campo**|**Tipo**|**PK**|**NN**|**Descripción**|
|id|SERIAL|✓|✓|Identificador único autoincremental.|
|product\_id|INTEGER||✓|FK → product.id.|
|supplier\_id|INTEGER||✓|FK → supplier.id.|
|price|NUMERIC(14,4)||✓|Precio unitario en soles (normalizado, sin símbolo).|
|price\_with\_tax|NUMERIC(14,4)|||Precio con IGV incluido.|
|tax\_rate|NUMERIC(5,4)|||Tasa IGV aplicada. Ej: 0.18.|
|valid\_from|DATE||✓|Fecha de inicio de vigencia.|
|valid\_to|DATE|||Fecha de fin de vigencia. NULL si vigente.|
|is\_current|BOOLEAN||✓|Precio vigente. Default: TRUE.|
|is\_official|BOOLEAN||✓|Precio oficial (del proveedor preferido). Default: FALSE.|
|source\_upload\_id|INTEGER|||FK → supplier\_upload.id.|
|created\_at|TIMESTAMPTZ||✓|Fecha y hora de registro del precio.|
|created\_by|INTEGER|||FK → app\_user.id.|

## **7.6 Tabla: supplier\_template**

|**supplier\_template**  —  Plantillas de mapeo de columnas por proveedor|||||
| :- | :- | :- | :- | :- |
|**Campo**|**Tipo**|**PK**|**NN**|**Descripción**|
|id|SERIAL|✓|✓|Identificador único autoincremental.|
|supplier\_id|INTEGER||✓|FK → supplier.id.|
|name|VARCHAR(150)||✓|Nombre descriptivo de la plantilla.|
|sheet\_name|VARCHAR(100)|||Hoja Excel donde están los datos.|
|header\_row|INTEGER||✓|Fila de encabezados (1-indexed). Default: 1.|
|data\_start\_row|INTEGER||✓|Fila de inicio de datos. Default: 2.|
|column\_mappings|JSONB||✓|JSON con mapeo columnas proveedor → campos BD.|
|ai\_suggested|BOOLEAN||✓|Mapeo fue sugerido por IA. Default: FALSE.|
|confirmed\_by|INTEGER|||FK → app\_user.id.|
|confirmed\_at|TIMESTAMPTZ|||Fecha de confirmación.|
|is\_active|BOOLEAN||✓|Plantilla activa. Default: TRUE.|
|created\_at|TIMESTAMPTZ||✓|Fecha y hora de creación.|
|updated\_at|TIMESTAMPTZ||✓|Fecha y hora de última modificación.|


## **7.7 Tabla: supplier\_upload**

|**supplier\_upload**  —  Registro de cada carga de archivo Excel de proveedor|||||
| :- | :- | :- | :- | :- |
|**Campo**|**Tipo**|**PK**|**NN**|**Descripción**|
|id|SERIAL|✓|✓|Identificador único autoincremental.|
|supplier\_id|INTEGER||✓|FK → supplier.id.|
|template\_id|INTEGER|||FK → supplier\_template.id.|
|file\_name|VARCHAR(255)||✓|Nombre original del archivo.|
|file\_path\_s3|TEXT||✓|Ruta del archivo en S3.|
|file\_size\_bytes|BIGINT|||Tamaño del archivo en bytes.|
|status|VARCHAR(30)||✓|'uploaded','mapping','processing','review','confirmed','rejected'.|
|total\_rows|INTEGER|||Total de filas detectadas.|
|processed\_rows|INTEGER|||Filas procesadas exitosamente.|
|new\_products|INTEGER|||Productos nuevos creados.|
|updated\_products|INTEGER|||Productos actualizados.|
|duplicates\_found|INTEGER|||Duplicados detectados.|
|ai\_enrichments|INTEGER|||Enriquecimientos realizados por IA.|
|errors|JSONB|||JSON con errores del procesamiento.|
|uploaded\_by|INTEGER|||FK → app\_user.id.|
|confirmed\_by|INTEGER|||FK → app\_user.id.|
|confirmed\_at|TIMESTAMPTZ|||Fecha de confirmación del lote.|
|created\_at|TIMESTAMPTZ||✓|Fecha y hora de creación.|
|updated\_at|TIMESTAMPTZ||✓|Fecha y hora de última modificación.|

## **7.8 Tabla: client**

|**client**  —  Clientes destino (aplicaciones web y ERP). Registro previo obligatorio.|||||
| :- | :- | :- | :- | :- |
|**Campo**|**Tipo**|**PK**|**NN**|**Descripción**|
|id|SERIAL|✓|✓|Identificador único autoincremental.|
|name|VARCHAR(200)||✓|Nombre del cliente. Único.|
|type|VARCHAR(30)||✓|'web\_app', 'erp', 'marketplace'.|
|description|TEXT|||Descripción del cliente.|
|points\_conversion\_factor|NUMERIC(10,4)|||Factor de conversión de puntos (ej: precio × 12.85 = puntos). Puede ser NULL si no aplica.|
|default\_redemption\_type|VARCHAR(50)|||Valor por defecto para ID Tipo Canje. Si es NULL, se exporta vacío.|
|default\_giftcard\_id|VARCHAR(50)|||Valor por defecto para ID Giftcard. Por defecto NULL → exporta vacío.|
|output\_template\_id|INTEGER|||FK → output\_template.id.|
|is\_active|BOOLEAN||✓|Estado activo. Default: TRUE.|
|created\_at|TIMESTAMPTZ||✓|Fecha y hora de creación.|
|updated\_at|TIMESTAMPTZ||✓|Fecha y hora de última modificación.|
|created\_by|INTEGER|||FK → app\_user.id.|
|updated\_by|INTEGER|||FK → app\_user.id.|

## **7.9 Tabla: client\_category**

|**client\_category**  —  Árbol de categorías propio de cada cliente con mapeo a subcategorías maestras|||||
| :- | :- | :- | :- | :- |
|**Campo**|**Tipo**|**PK**|**NN**|**Descripción**|
|id|SERIAL|✓|✓|Identificador único autoincremental.|
|client\_id|INTEGER||✓|FK → client.id.|
|client\_category\_external\_id|VARCHAR(50)|||ID de la categoría en el sistema del cliente.|
|client\_category\_name|VARCHAR(200)||✓|Nombre de la categoría en el cliente.|
|parent\_client\_category\_id|INTEGER|||FK autoreferencial para árbol jerárquico.|
|master\_subcategory\_id|INTEGER|||FK → subcategory.id. Subcategoría maestra equivalente.|
|master\_category\_id|INTEGER|||FK → category.id. Categoría maestra equivalente.|
|created\_at|TIMESTAMPTZ||✓|Fecha y hora de creación.|
|updated\_at|TIMESTAMPTZ||✓|Fecha y hora de última modificación.|


## **7.10 Tabla: output\_template**

|**output\_template**  —  Definición de plantillas de exportación por cliente|||||
| :- | :- | :- | :- | :- |
|**Campo**|**Tipo**|**PK**|**NN**|**Descripción**|
|id|SERIAL|✓|✓|Identificador único autoincremental.|
|client\_id|INTEGER||✓|FK → client.id.|
|name|VARCHAR(150)||✓|Nombre de la plantilla.|
|format|VARCHAR(10)||✓|'xlsx' (web) o 'csv' (NetSuite).|
|sheet\_name|VARCHAR(100)|||Nombre de hoja (solo xlsx).|
|include\_header|BOOLEAN||✓|Incluir fila de encabezados. Default: TRUE.|
|column\_definitions|JSONB||✓|Array JSON: [{order, header\_name, source\_field, default\_value, transform, is\_ai\_generated}].|
|is\_active|BOOLEAN||✓|Estado activo. Default: TRUE.|
|created\_at|TIMESTAMPTZ||✓|Fecha y hora de creación.|
|updated\_at|TIMESTAMPTZ||✓|Fecha y hora de última modificación.|

## **7.11 Tabla: export\_job**

|**export\_job**  —  Registro de generaciones de archivos de salida|||||
| :- | :- | :- | :- | :- |
|**Campo**|**Tipo**|**PK**|**NN**|**Descripción**|
|id|SERIAL|✓|✓|Identificador único autoincremental.|
|client\_id|INTEGER||✓|FK → client.id.|
|output\_template\_id|INTEGER||✓|FK → output\_template.id.|
|product\_filter|JSONB|||Filtros aplicados para seleccionar productos.|
|total\_products|INTEGER|||Total exportado.|
|file\_path\_s3|TEXT|||Ruta del archivo generado en S3.|
|file\_name|VARCHAR(255)|||Nombre del archivo generado.|
|status|VARCHAR(20)||✓|'pending','processing','completed','failed'. Default: 'pending'.|
|tags\_generated\_by\_ai|INTEGER|||Cantidad de productos con tags autogenerados.|
|generated\_by|INTEGER|||FK → app\_user.id.|
|created\_at|TIMESTAMPTZ||✓|Fecha y hora de solicitud.|
|completed\_at|TIMESTAMPTZ|||Fecha y hora de finalización.|

## **7.12 Tabla: duplicate\_record**

|**duplicate\_record**  —  Registro de duplicados detectados por el sistema durante cargas|||||
| :- | :- | :- | :- | :- |
|**Campo**|**Tipo**|**PK**|**NN**|**Descripción**|
|id|SERIAL|✓|✓|Identificador único autoincremental.|
|upload\_id|INTEGER||✓|FK → supplier\_upload.id.|
|product\_candidate\_data|JSONB||✓|Datos del producto candidato (antes de persistir).|
|product\_existing\_id|INTEGER||✓|FK → product.id. Producto existente.|
|match\_type|VARCHAR(30)||✓|'exact\_ean', 'exact\_sku', 'semantic\_ai', 'fuzzy\_name'.|
|similarity\_score|NUMERIC(5,4)|||Score de similitud (0.0-1.0).|
|ai\_reasoning|TEXT|||Explicación de Claude sobre la similitud.|
|status|VARCHAR(20)||✓|'pending', 'merged', 'rejected', 'kept\_both'. Default: 'pending'.|
|resolved\_by|INTEGER|||FK → app\_user.id.|
|resolved\_at|TIMESTAMPTZ|||Fecha de resolución.|
|created\_at|TIMESTAMPTZ||✓|Fecha y hora de creación.|


## **7.13 Tabla: ai\_enrichment\_log**

|**ai\_enrichment\_log**  —  Log detallado de enriquecimientos realizados con IA|||||
| :- | :- | :- | :- | :- |
|**Campo**|**Tipo**|**PK**|**NN**|**Descripción**|
|id|SERIAL|✓|✓|Identificador único autoincremental.|
|product\_id|INTEGER||✓|FK → product.id.|
|fields\_enriched|TEXT[]|||Array de campos completados por IA.|
|search\_query|TEXT|||Query usado para la búsqueda (EAN/SKU/nombre).|
|ai\_model|VARCHAR(80)|||Modelo IA usado. Ej: 'claude-sonnet-4-20250514'.|
|tokens\_used|INTEGER|||Tokens consumidos.|
|status|VARCHAR(20)||✓|'success', 'partial', 'failed'. Default: 'success'.|
|error\_message|TEXT|||Error si el enriquecimiento falló.|
|created\_at|TIMESTAMPTZ||✓|Fecha y hora del enriquecimiento.|

## **7.14 Tabla: app\_user**

|**app\_user**  —  Usuarios del sistema con login local|||||
| :- | :- | :- | :- | :- |
|**Campo**|**Tipo**|**PK**|**NN**|**Descripción**|
|id|SERIAL|✓|✓|Identificador único autoincremental.|
|username|VARCHAR(80)||✓|Nombre de usuario para login. Único.|
|email|VARCHAR(150)||✓|Correo electrónico. Único.|
|full\_name|VARCHAR(200)||✓|Nombre completo.|
|hashed\_password|VARCHAR(255)||✓|Contraseña cifrada (bcrypt).|
|role\_id|INTEGER||✓|FK → role.id.|
|is\_active|BOOLEAN||✓|Estado activo. Default: TRUE.|
|last\_login|TIMESTAMPTZ|||Último acceso.|
|created\_at|TIMESTAMPTZ||✓|Fecha y hora de creación.|
|updated\_at|TIMESTAMPTZ||✓|Fecha y hora de última modificación.|

## **7.15 Tabla: role**

|**role**  —  Roles dinámicos del sistema|||||
| :- | :- | :- | :- | :- |
|**Campo**|**Tipo**|**PK**|**NN**|**Descripción**|
|id|SERIAL|✓|✓|Identificador único autoincremental.|
|name|VARCHAR(80)||✓|Nombre del rol. Único.|
|description|TEXT|||Descripción del rol y sus responsabilidades.|
|is\_system|BOOLEAN||✓|Rol del sistema (no editable). Default: FALSE.|
|is\_active|BOOLEAN||✓|Estado activo. Default: TRUE.|
|created\_at|TIMESTAMPTZ||✓|Fecha y hora de creación.|
|updated\_at|TIMESTAMPTZ||✓|Fecha y hora de última modificación.|

## **7.16 Tabla: permission**

|**permission**  —  Permisos granulares que pueden asignarse a los roles|||||
| :- | :- | :- | :- | :- |
|**Campo**|**Tipo**|**PK**|**NN**|**Descripción**|
|id|SERIAL|✓|✓|Identificador único autoincremental.|
|code|VARCHAR(80)||✓|Código del permiso. Ej: 'product.create', 'upload.confirm'. Único.|
|name|VARCHAR(150)||✓|Nombre del permiso visible en UI.|
|description|TEXT|||Descripción de lo que habilita el permiso.|
|module|VARCHAR(50)||✓|Módulo al que pertenece. Ej: 'products', 'uploads', 'admin'.|
|created\_at|TIMESTAMPTZ||✓|Fecha y hora de creación.|


## **7.17 Tabla: role\_permission**

|**role\_permission**  —  Relación muchos-a-muchos entre roles y permisos|||||
| :- | :- | :- | :- | :- |
|**Campo**|**Tipo**|**PK**|**NN**|**Descripción**|
|role\_id|INTEGER|✓|✓|FK → role.id. Parte de PK compuesta.|
|permission\_id|INTEGER|✓|✓|FK → permission.id. Parte de PK compuesta.|
|granted\_at|TIMESTAMPTZ||✓|Fecha de asignación del permiso al rol.|
|granted\_by|INTEGER|||FK → app\_user.id.|

## **7.18 Tabla: audit\_log**

|**audit\_log**  —  Registro completo de todas las acciones auditables del sistema|||||
| :- | :- | :- | :- | :- |
|**Campo**|**Tipo**|**PK**|**NN**|**Descripción**|
|id|BIGSERIAL|✓|✓|Identificador único autoincremental.|
|user\_id|INTEGER|||FK → app\_user.id. Usuario que ejecutó la acción.|
|action|VARCHAR(80)||✓|Tipo de acción. Ej: 'create', 'update', 'delete', 'login', 'upload', 'confirm\_batch', 'export'.|
|entity\_type|VARCHAR(50)||✓|Tipo de entidad afectada. Ej: 'product', 'supplier', 'client'.|
|entity\_id|INTEGER|||ID de la entidad afectada.|
|changes|JSONB|||JSON con los cambios realizados: {before, after}.|
|ip\_address|VARCHAR(45)|||IP del cliente.|
|user\_agent|TEXT|||User agent del navegador.|
|created\_at|TIMESTAMPTZ||✓|Fecha y hora de la acción.|

## **7.19 Tabla: ai\_prompt\_config**

|**ai\_prompt\_config**  —  Prompts versionados de IA para facilitar mantenimiento sin redeploy|||||
| :- | :- | :- | :- | :- |
|**Campo**|**Tipo**|**PK**|**NN**|**Descripción**|
|id|SERIAL|✓|✓|Identificador único autoincremental.|
|use\_case|VARCHAR(80)||✓|Caso de uso. Ej: 'column\_mapping', 'duplicate\_detection', 'enrichment', 'tag\_generation'.|
|version|INTEGER||✓|Versión del prompt. Permite rollback.|
|system\_prompt|TEXT||✓|System prompt para Claude.|
|user\_prompt\_template|TEXT||✓|Template del user prompt con placeholders.|
|model|VARCHAR(80)||✓|Modelo de IA a utilizar.|
|max\_tokens|INTEGER||✓|Límite de tokens de salida.|
|is\_active|BOOLEAN||✓|Versión activa. Solo una por caso de uso.|
|created\_at|TIMESTAMPTZ||✓|Fecha y hora de creación.|
|created\_by|INTEGER|||FK → app\_user.id.|


# **8. Mapeo de Campos: Archivos Fuente vs. BD Maestra**
A continuación se muestra cómo los campos de los archivos de ejemplo analizados se asocian con la tabla product de la BD maestra. Los campos marcados como 'vacío (gestión web)' se exportarán como valor vacío porque son propios de cada plataforma.

## **8.1 Base de datos de artículos (salida hacia NetSuite)**

|**Campo Original Excel**|**Campo BD Maestra**|**Notas**|
| :- | :- | :- |
|ID interno|internal\_id\_netsuite|ID asignado por NetSuite post-importación|
|Nombre|sku|Código SKU interno|
|Nombre para mostrar|display\_name|Nombre comercial|
|Descripcion de Compra|purchase\_description|Para órdenes de compra en NetSuite|
|Descripcion de la Venta|sale\_description|Para facturas y cotizaciones|
|NOMBRE/CÓDIGO DEL PROVEEDOR|supplier.name / code|Mapeo a tabla supplier|
|MODELO|model|Modelo del producto|
|MARCA/BRAND|brand|Marca|
|Precio de Producto|product\_price.price|Precio normalizado sin símbolo de moneda|
|Programa fiscal|tax\_type|Ej: Estandar, Exentas|
|Proveedor preferido|supplier.preferred|Flag booleano en tabla supplier|
|CONVENIOS|agreements|Convenio asociado|
|Vigencia de Catalogo|catalog\_validity|Anual, Mensual, etc.|
|Ultima Fecha Actualiz. Precio|last\_price\_update|Timestamp|
|PK SEGMENTO CATEGORIA|category.name → category\_id|Mapeo por nombre|
|PK SEGMENTO SUBCATEGORIA|subcategory.name → subcategory\_id|Mapeo por nombre|
|Medidas Validadas|dimensions\_validated|Booleano|
|Peso Volumétrico|volumetric\_weight\_kg|Kilogramos|
|PESO LINEAL|linear\_weight|Peso lineal|
|Fondo|length\_cm|Centímetros|
|ANCHO|width\_cm|Centímetros|
|ALTO|height\_cm|Centímetros|
|IMAGEN|image\_main\_url|URL extraída del HTML (solo link, como actualmente)|


## **8.2 Formato Carga Web 1**

|**Campo Original Excel**|**Campo BD Maestra**|**Notas**|
| :- | :- | :- |
|ID Producto|— vacío (gestión web)|Lo asigna la plataforma web|
|ID Catalogo|— vacío (gestión web)|Lo asigna la plataforma web|
|Codigo web|sku|Código del producto|
|ID Marca|— vacío (gestión web)|ID de marca en la plataforma|
|Id Categoria|client\_category.client\_category\_external\_id|Vía mapeo client\_category|
|Tipo Producto|— vacío (gestión web)|Tipo en plataforma|
|Nombre producto|display\_name|Nombre comercial|
|Imagen Principal|image\_main\_url|URL|
|Imagen Detalle|image\_detail\_url|URL|
|Estado Producto|status|Mapeo activo/inactivo|
|Descripcion producto|long\_description|Descripción larga enriquecida|
|Terminos producto|tags (autogen IA)|Pipe-separated|
|Especificaciones producto|specifications|Pipe-separated desde JSONB|
|Puntos producto|precio × points\_conversion\_factor|Calculado con factor del cliente|
|Precio Producto|product\_price.price|Precio oficial (proveedor preferido)|
|ID Netsuite|netsuite\_code|Código NS-XX-XX-XXXX|
|ID Tipo Canje|client.default\_redemption\_type (vacío)|Vacío por defecto|
|ID Giftcard|— vacío|Vacío por defecto|
|Precio Venta|— vacío (gestión web)|Definido en la web|


## **8.3 Formato Carga Web 2**

|**Campo Original Excel**|**Campo BD Maestra**|**Notas**|
| :- | :- | :- |
|ID Producto|— vacío (gestión web)|De la plataforma|
|ID Catalogo|— vacío (gestión web)|De la plataforma|
|Codigo Web2|sku|SKU del producto|
|id Marca|— vacío (gestión web)|ID en plataforma|
|id categoria|client\_category.client\_category\_external\_id|Vía mapeo|
|Tipo Producto|— vacío (gestión web)|De la plataforma|
|Nombre producto|display\_name|Nombre comercial|
|Imagen principal|image\_main\_url|URL|
|Imagen detalle|image\_detail\_url|URL|
|Estado producto|status|Activo/inactivo|
|Descipcion producto|long\_description|Descripción larga|
|Terminos producto|tags (autogen IA)|Pipe-separated|
|Especificaciones producto|specifications|Pipe-separated|
|Puntos producto|precio × points\_conversion\_factor|Calculado|
|Precio producto|product\_price.price|Precio oficial|
|ID Netsuite|netsuite\_code|Código NS|
|Tags|tags (autogen IA)|CSV|
|Puntos Regular|— vacío (gestión web)|Definido en plataforma|
|Tipo de Etiqueta|— vacío (gestión web)|Definido en plataforma|
|Nombre Etiqueta|— vacío (gestión web)|Definido en plataforma|
|Imagen Movil|image\_mobile\_url|URL|
|Imagen Movil Destacada|image\_mobile\_featured\_url|URL|
|Imagen Movil Detalle|image\_mobile\_detail\_url|URL|
|Imagen Movil Detalle Dos|— vacío|No mapeado|
|Imagen Movil Detalle Tres|— vacío|No mapeado|
|Imagen Envio Express|— vacío (gestión web)|Definido en plataforma|
|PDF Aden|pdf\_url|URL|


## **8.4 Formato Proveedor — plantillas heterogéneas**
Los proveedores envían plantillas con estructuras diversas. El caso más simple analizado tiene 3 columnas (código, producto, precio). Otros proveedores envían información completa: descripción, especificaciones, volumen, dimensiones, etc. El motor de mapeo con IA detecta automáticamente la cantidad y significado de cada columna, y solicita confirmación al usuario antes de procesar.

|**Ejemplo Campo Proveedor**|**Campo BD Maestra sugerido**|**Notas**|
| :- | :- | :- |
|CODIGO|sku / mpn|Se decide según patrón: numérico largo → EAN; corto → SKU|
|PRODUCTO|name / display\_name|Nombre del producto|
|PRECIO / PRECIO UNIT.|product\_price.price|Se normaliza: elimina S/, $, comas|
|PRECIO C/IGV|product\_price.price\_with\_tax|Con IGV; se calcula price = price\_with\_tax / 1.18|
|DESCRIPCION|long\_description|Descripción larga|
|MARCA|brand|Marca|
|MODELO|model|Modelo|
|EAN / CODIGO DE BARRAS|ean|Código EAN|
|PESO|weight\_kg|Se normaliza unidad si viene en gramos|
|ALTO / ANCHO / FONDO|height\_cm / width\_cm / length\_cm|Dimensiones|
|VOLUMEN|volumetric\_weight\_kg|Peso volumétrico|
|SPECS / CARACTERISTICAS|specifications (JSONB)|Claude parsea en pares clave-valor|
|IMAGEN / URL|image\_main\_url|URL|


# **9. Integración con Inteligencia Artificial**
## **9.1 Casos de Uso de Claude API**

|**Caso de Uso**|**Módulo**|**Descripción**|
| :- | :- | :- |
|Mapeo semántico de columnas|M03|Claude recibe los nombres de columnas del proveedor y los campos de la BD maestra, y sugiere el mapeo más probable con justificación breve.|
|Detección de duplicados semántica|M04|Para casos no resueltos por match exacto, Claude evalúa similitud entre productos y retorna un score más explicación.|
|Normalización de precios|M04|Claude limpia strings como 'S/ 159.69', '$ 38.50', '77.80 soles' y retorna un numeric plano.|
|Enriquecimiento de productos|M05|Claude usa web\_search para buscar por nombre/EAN/SKU y autocompletar descripción, specs, marca, dimensiones, peso e imágenes.|
|Autogeneración de tags|M13|Al exportar a clientes web, Claude genera etiquetas SEO-friendly basadas en nombre, descripción y categoría.|
|Sugerencia de categorización|M07|Claude sugiere la categoría y subcategoría maestra más adecuada para un producto dado.|

## **9.2 Modelo y Parámetros**
- Modelo: claude-sonnet-4-20250514 (relación costo/rendimiento óptima para procesamiento masivo de catálogo).
- Herramientas habilitadas: web\_search\_20250305 para enriquecimiento en tiempo real.
- Límite de tokens de salida por producto: 1,000 tokens (configurable en ai\_prompt\_config).
- Rate limiting gestionado por el worker asíncrono para evitar bloqueo de la API.
- Los prompts se almacenan versionados en BD (tabla ai\_prompt\_config) para permitir ajustes sin redeploy.

## **9.3 Marcado visual de campos enriquecidos**
Cada campo enriquecido por IA queda marcado en la BD (array product.ai\_enriched\_fields) para que la UI muestre un indicador visual distintivo. Esto permite al usuario reconocer de un vistazo qué información provino del proveedor y qué fue autocompletada con IA antes de confirmar el registro.

# **10. Consideraciones No Funcionales**
## **10.1 Seguridad**
- Autenticación local con usuario y contraseña. Contraseñas cifradas con bcrypt.
- Sesión gestionada con tokens JWT con expiración configurable.
- Roles y permisos 100% dinámicos: el Administrador puede crear roles y asignar permisos granulares desde la UI.
- HTTPS obligatorio en toda comunicación entre frontend y API.
- Cifrado de datos en reposo: RDS con encryption at rest, S3 con SSE-S3.
- Secretos (credenciales de Claude API, JWT secret) gestionados con AWS Secrets Manager.

## **10.2 Auditoría**
- Todas las operaciones críticas quedan registradas en audit\_log: login, CRUD de entidades, cargas, confirmaciones, exportaciones, cambios de precio, cambios de mapeo.
- El log incluye usuario, timestamp, IP, User Agent y el diff del cambio ({before, after} en JSONB).
- La tabla audit\_log se diseña para retención indefinida (o política a definir por Promotick).
- Toda acción es visible desde la Pantalla P13 con filtros y exportación.

## **10.3 Escalabilidad y Rendimiento**
- PostgreSQL con índices en sku, ean, netsuite\_code, subcategory\_id y product\_price(product\_id, is\_current) para búsquedas eficientes.
- El campo specifications tipo JSONB permite agregar atributos técnicos sin modificar el esquema.
- Workers asíncronos (AWS SQS + Lambda o contenedores) procesan cargas sin bloquear la API principal.
- Dado que el volumen esperado es moderado (~500 registros por carga, 1 carga al día), la arquitectura serverless es especialmente atractiva por costo.

## **10.4 Campos vacíos en plantillas de salida**
Las plataformas web destino requieren campos que no pueden ser derivados de la BD maestra (ID de marca interno a la plataforma, tipo de canje, ID de giftcard, puntos regulares, tipos de etiqueta). Estos se manejan en tres formas:

- Calculados: campos como 'Puntos producto' se derivan de precio × factor\_de\_conversión configurado por cliente.
- Autogenerados con IA: tags y etiquetas se generan automáticamente para cada exportación.
- Vacíos por diseño: ID Tipo Canje, ID Giftcard y campos específicos de la plataforma se exportan vacíos y el administrador de la plataforma web los gestiona directamente.

## **10.5 Mantenimiento**
- Prompts de IA versionados en BD (ai\_prompt\_config) para ajustar comportamiento sin redeploy.
- Logs centralizados en CloudWatch para diagnóstico.
- Despliegue mediante CI/CD configurado por el equipo de proyecto (recomendado: GitHub Actions + AWS CodeDeploy).
- Documentación técnica y manuales de usuario como entregable obligatorio (responsabilidad del equipo UTEC).


# **11. Plan de Entrega Sugerido**
Este alcance se presenta en su totalidad al equipo de UTEC. El equipo debe evaluar qué componentes puede cubrir en el tiempo asignado y proponer un plan de entrega por fases. A continuación se sugiere una priorización basada en dependencias funcionales:

|**Prioridad**|**Módulos**|**Descripción del Hito**|
| :- | :- | :- |
|Fase 1 — Core|M01, M08, M09, M14, M15|Gestión de proveedores, categorías, código NetSuite autogenerado, usuarios y roles dinámicos, auditoría base. Es la base transversal de todo el sistema.|
|Fase 2 — Ingesta|M02, M03, M07, M10|Upload de Excel, mapeo con IA (Paso 1), BD maestra de productos, registro de precios por proveedor. Produce el primer flujo completo con IA.|
|Fase 3 — Validaciones|M04, M05, M06|Detección de duplicados, enriquecimiento con IA, confirmación de registro (Paso 2). Completa el flujo de ingesta con todos los controles.|
|Fase 4 — Salidas|M11, M12, M13, M16|Gestión de clientes, mapeo de categorías cliente-maestro, generador de plantillas para web y NetSuite, panel de control. Cierra el ciclo punta a punta.|

## **11.1 Entregables Esperados**
Los entregables específicos dependen de la propuesta del equipo UTEC, pero como mínimo se espera:

- Código fuente del backend y frontend en repositorio Git.
- Scripts de despliegue para AWS (CloudFormation, Terraform o CDK).
- Manual de usuario con capturas de pantalla para cada módulo.
- Manual técnico de instalación y configuración.
- Casos de prueba de QA: pruebas unitarias, de integración y de aceptación.
- Diccionario de datos actualizado con cualquier ajuste realizado durante el desarrollo.
- Documentación de la API (Swagger/OpenAPI).

# **12. Glosario**

|**Término**|**Definición**|
| :- | :- |
|BD Maestra|Base de datos centralizada con el registro único y normalizado de todos los productos de Promotick.|
|Código NetSuite|Código autogenerado con formato NS-XX-XX-XXXX que identifica un producto en el ERP.|
|Cliente|Destino de las plantillas de salida: aplicación web o ERP NetSuite. Requiere registro previo.|
|Enriquecimiento|Proceso de completar automáticamente campos vacíos de un producto usando IA y búsqueda web.|
|ERP|Enterprise Resource Planning. Promotick usa NetSuite de Oracle.|
|EAN|European Article Number. Código de barras estándar.|
|IA / LLM|Inteligencia Artificial / Large Language Model. Se usa la API de Claude (Anthropic).|
|JSONB|Tipo de dato de PostgreSQL que almacena JSON en formato binario optimizado para consultas.|
|Mapeo de Columnas|Asociación entre un campo del archivo del proveedor y el campo correspondiente en la BD maestra.|
|MPN|Manufacturer Part Number. Código asignado por el fabricante.|
|Paso 1 (Análisis)|Primer paso del flujo de carga: el sistema procesa el archivo, detecta duplicados y enriquece con IA.|
|Paso 2 (Confirmación)|Segundo paso del flujo: el usuario revisa el lote completo y confirma o rechaza antes de persistir.|
|Precio Oficial|Precio del proveedor preferido asociado a un producto. Es el que se usa en exportaciones.|
|RBAC|Role-Based Access Control. Control de acceso basado en roles dinámicos.|
|SKU|Stock Keeping Unit. Código único de producto en inventario.|
|Tags (autogenerados)|Etiquetas generadas automáticamente con IA para enriquecer el producto en clientes web.|
|Worker Asíncrono|Proceso en segundo plano que ejecuta tareas largas (procesamiento de archivos, llamadas a IA) sin bloquear la API.|

*— Fin del Documento —*
Confidencial — Uso interno Promotick / UTEC	Página 1
