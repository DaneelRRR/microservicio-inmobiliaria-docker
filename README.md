# Microservicio Inmobiliaria - Documentación

Este proyecto es un sistema de gestión inmobiliaria basado en microservicios, que permite la administración de bienes raíces y la carga de imágenes por parte de fotógrafos y grafistas.

## 1. Clonar el Repositorio

Para obtener el código fuente, ejecuta el siguiente comando en tu terminal:

```bash
git clone https://github.com/DaneelRRR/microservicio-inmobiliaria-docker.git
cd microservicio-inmobiliaria-docker
```

## 2. Levantar el Proyecto

El proyecto utiliza **Docker Compose** para orquestar los servicios (Base de datos SQL Server, Backend Node.js y Frontend Nginx).

### Requisitos
- Docker Desktop instalado y corriendo.

### Configuración de Almacenamiento (Importante)
El proyecto está configurado para simular un servidor de archivos usando el **Disco D:**.

> ⚠️ **Nota:** Verifique el archivo `docker-compose.yml`. Si su equipo no tiene unidad `D:/`, cambie la ruta en `volumes` por una carpeta válida en su PC (ej: `./uploads`).

### Ejecución
Para construir y levantar los contenedores, ejecuta:

```bash
docker-compose up --build
```

> **Nota:** La primera vez puede tardar unos minutos mientras se descargan las imágenes y se inicializa la base de datos.

## 3. Uso de Postman (API Backend)

El backend corre en el puerto `3000`. Puedes importar estos endpoints en Postman para probar la API.

**Base URL:** `http://localhost:3000/api`

### Endpoints Principales

| Método | Endpoint | Descripción |
| :--- | :--- | :--- |
| `GET` | `/init-db` | **Inicializar Base de Datos**. Crea las tablas necesarias si no existen. Ejecutar esto primero. |
| `GET` | `/bienes` | **Listar Bienes**. Obtiene todos los inmuebles registrados. |
| `PUT` | `/bienes/:codigo` | **Actualizar Descripción**. Modifica la descripción de un inmueble. <br> **Body (JSON):** `{ "descripcion": "Nueva descripción..." }` |

### Endpoints de Carga de Archivos

| Método | Endpoint | Descripción | Body (form-data) |
| :--- | :--- | :--- | :--- |
| `POST` | `/fotografo/upload` | Subida de fotos originales (Fotógrafo). | `codigo_bien`: (Texto)<br>`descripcion`: (Texto)<br>`archivo`: (File - ZIP/RAR/Img) |
| `POST` | `/grafista/upload` | Subida de fotos editadas (Grafista). | `codigo_bien`: (Texto)<br>`archivo`: (File - Solo ZIP) |

---

## 4. Uso del Navegador (Frontend)

El frontend es accesible a través del navegador web.

**URL de Acceso:** [http://localhost:8080](http://localhost:8080)

### Guía de Navegación

#### **Dashboard Principal**
- **Vista General:** Al ingresar, verás tarjetas representando cada inmueble.
- **Indicadores de Estado:**
    - 🟡 **En Proceso:** El inmueble tiene fotos originales pero faltan las editadas.
    - 🟢 **Publicado:** El inmueble ya cuenta con fotos editadas finales.

#### **Filtros y Búsqueda**
- **Barra Lateral (Izquierda):**
    - Usa los filtros rápidos para ver solo inmuebles **"En Proceso"** o **"Publicados"**.
- **Barra Superior:**
    - Usa el campo de búsqueda para encontrar inmuebles por su **Código** o **Descripción**.

#### **Subida de Archivos**
1. Haz clic en el botón **"Subir Archivo"** (esquina superior derecha).
2. Se abrirá un modal con dos pestañas de roles:
    - **Fotógrafo:** Selecciona esta opción para subir el paquete inicial de fotos. Debes ingresar el código del bien y una descripción.
    - **Grafista:** Selecciona esta opción para subir las versiones finales editadas. Solo requiere el código del bien.
3. **Carga:** Puedes arrastrar tus archivos a la zona punteada o hacer clic para buscarlos. (Recuerda usar ZIP para que el sistema procese las fotos automáticamente).

#### **Detalle del Inmueble**
- Haz clic en cualquier tarjeta del dashboard para ver el detalle.
- Podrás ver las fotos editadas en una galería.
- Si el estado es "En Proceso", verás un aviso indicando que se espera la carga del grafista.
