# TTN Training SPA

Interfaz web (Vite + React + TypeScript) de la plataforma de capacitación **Capacita+ / Biowel**. Consume el backend [`ttn-training-core`](../ttn-training-core): catálogo por producto/cliente, lecciones (con video), evaluaciones, certificados, manual de usuario y asistente con IA.

- **Stack:** Vite · React 19 · TypeScript · React Router
- **Backend:** FastAPI (`ttn-training-core`), por defecto en `http://localhost:8000`

---

## Puesta en marcha

Requisitos: **Node.js 18+**.

```bash
# 1. Dependencias
npm install

# 2. Configuración (opcional)
#    Crea un archivo .env solo si el backend NO está en http://localhost:8000
echo "VITE_API_URL=http://localhost:8000" > .env

# 3. Levantar en desarrollo
npm run dev
```

- App: **http://localhost:5173**
- Requiere el backend corriendo (ver README de `ttn-training-core`).

Otros comandos:

```bash
npm run build     # Compila TypeScript + genera el build de producción (dist/)
npm run preview   # Sirve el build de producción localmente
```

> `VITE_API_URL` apunta al backend. Si no se define, usa `http://localhost:8000`.

---

## Iniciar sesión

1. Abre **http://localhost:5173** → te redirige a **`/login`**.
2. Ingresa **usuario** y **contraseña** (los usuarios los sirve el backend; ver tabla abajo).
3. Al entrar, la sesión (token) se guarda en `localStorage` (`ttn_token`). Cierra sesión con el botón de salir en la barra lateral.

El menú **Administración** (Usuarios, Clientes, Módulos, Lecciones) **solo aparece si el rol es `admin`**.

### Usuarios de demostración

Estos usuarios los siembra el backend la primera vez (en `ttn-training-core/data/users.json`):

| Usuario | Contraseña | Rol | Qué ve |
|---------|-----------|-----|--------|
| `admin` | `admin1234` * | **admin** | Todo: catálogo completo + panel de Administración |
| `ana` | `ana1234` | usuario | Solo los módulos que el admin le habilite |
| `carlos` | `carlos1234` | usuario | Solo los módulos que el admin le habilite |

\* La del `admin` puede cambiarse con la variable `ADMIN_DEFAULT_PASSWORD` del backend. **Cambia estas credenciales antes de producción.**

> Un usuario nuevo nace con **todos los módulos bloqueados**. Un **admin** los habilita en **Administración · Usuarios**, agrupados por proyecto → cliente.

---

## ¿Qué puede hacer cada rol?

**Administrador (`admin`)**
- **Usuarios:** crear/editar/eliminar y habilitar módulos por proyecto/cliente.
- **Clientes:** gestionar los clientes de cada producto (p. ej. Biowel Colombia).
- **Módulos:** crear/editar los módulos del catálogo de cada cliente.
- **Lecciones:** generar lecciones con IA desde insumos (PDF/voz/video), crear la **evaluación**, subir el **certificado** y generar el **manual de usuario** (PDF).

**Usuario (alumno)**
- Ver sus módulos habilitados, avanzar lecciones (desbloqueo secuencial).
- Presentar la **evaluación** (se habilita al completar todas las lecciones) y obtener el **certificado** (≥80%).
- Descargar el **manual de usuario** desde la pestaña *Documentación* del módulo.

---

## Estructura

```
src/
├── main.tsx / App.tsx        # Rutas (login, dashboard, proyecto, cliente, módulo, admin/*)
├── lib/api.ts                # Cliente del backend (fetch + token Bearer)
├── lib/manualPrint.ts        # Render del manual de usuario a PDF (imprimir desde el navegador)
├── context/AuthContext.tsx   # Sesión, usuario actual, rol
├── pages/                    # Dashboard, Proyectos, Cliente, Modulo, Certificados, Login, Admin*
└── components/               # Layout, Sidebar, Topbar, Assistant, QuizPanel, …
```
