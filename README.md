# ERP LUMARK V1

Sistema ERP personalizado para LUMARK GROUP, diseñado con una arquitectura ligera de Node.js (Express) en el backend y Vanilla JS/HTML/CSS moderno (con efectos Glassmorphism) en el frontend. Utiliza **Google Sheets** como base de datos en tiempo real mediante la API oficial de Google (`googleapis`).

---

## 🚀 Características Principales

*   **Dashboard Interactivo**: Métricas clave en tiempo real (Nuevos Prospectos, MRR, Churn, Avance de Proyectos, Rendimiento de Equipo).
*   **Gestión Centralizada**: Módulos para Prospectos, Clientes, Proyectos, Citas, Tareas y Actividades.
*   **Base de Datos en Google Sheets**: Los datos están completamente sincronizados y respaldados en la hoja de cálculo maestra.
*   **Arquitectura de UI Premium**: Interfaz moderna, efectos de cristal (Glassmorphism), transiciones suaves, y responsive design.
*   **Vistas Kanban**: Gestión visual de Proyectos y Tareas mediante arrastrar y soltar (Drag & Drop).

---

## 🛠️ Stack Tecnológico

*   **Backend**: Node.js, Express.js
*   **Frontend**: HTML5, CSS3 (Custom Properties), Vanilla JavaScript
*   **Base de Datos / Integración**: Google Sheets API v4 (`googleapis`)
*   **Librerías Extra**: `cors` (manejo de peticiones cruzadas)

---

## ⚙️ Instalación y Uso Local

1. **Clonar el repositorio o descargar los archivos**.
2. **Instalar dependencias**:
   ```bash
   npm install
   ```
3. **Configurar Credenciales**:
   - Asegúrate de tener el archivo `credentials.json` en la raíz del proyecto. *(Este archivo contiene las llaves de acceso a tu Google Cloud Console y NO debe subirse a repositorios públicos).*
4. **Ejecutar en Entorno de Desarrollo**:
   ```bash
   npm start
   ```
5. **Acceder a la aplicación**:
   Abre tu navegador y entra a `http://localhost:3000`.

---

## ☁️ Guía de Despliegue (Producción en Hostinger/VPS)

El proyecto está listo para ser montado en servicios como Hostinger utilizando Node.js.

1. **Conexión a GitHub**: 
   - Puedes conectar Hostinger a tu repositorio de GitHub para despliegue automático.
2. **Archivo `.gitignore` (Crítico)**: 
   - Por motivos de seguridad, si tu repositorio es público o compartido, **ignora `credentials.json`**. Deberás subirlo manualmente usando el Administrador de Archivos de tu Hosting.
3. **Arranque Dinámico**:
   - El proyecto ya está configurado con `const PORT = process.env.PORT || 3000;` y el comando `"start": "node server.js"` en el `package.json`, por lo que el hosting lo detectará y ejecutará automáticamente sin que configures puertos manualmente.

---

## 📂 Estructura del Proyecto

```text
ERP LUMARK V1/
├── server.js               # Servidor Express.js (Endpoints y Autenticación con Google)
├── public/                 # Archivos estáticos del Frontend
│   ├── index.html          # Estructura principal y plantillas modales
│   ├── style.css           # Hoja de estilos principal (Design System y Glassmorphism)
│   └── app.js              # Lógica de la Interfaz (Carga de datos, Kanban, Gráficos, KPIs)
├── credentials.json        # Claves API de Google (⚠️ Archivo Sensible)
├── package.json            # Dependencias y scripts de Node.js
└── Scripts Auxiliares      # (diagnose.js, fix_formulas.js, etc.) Herramientas de mantenimiento
```

---

## 🔧 Scripts Auxiliares de Mantenimiento

En la raíz del proyecto existen varios scripts creados para ayudarte a gestionar y limpiar la base de datos de Sheets de forma masiva por consola:

*   `diagnose.js`: Lee y escupe la estructura exacta (columnas y datos de muestra) de todas las pestañas de tu Google Sheet. Ideal para cuando las gráficas fallen.
*   `fix_formulas.js` / `force_formulas.js`: Aplican o corrigen funciones/fórmulas dañadas directamente en el documento de Google.
*   `seed_data.js` / `seed_citas.js`: Inyectan datos de prueba para realizar validaciones masivas en el Frontend.
*   `format_headers.js`: Asegura que las cabeceras de tus columnas en Sheets tengan un estándar correcto de limpieza.

*Ejecución de un script:*
```bash
node diagnose.js
```
