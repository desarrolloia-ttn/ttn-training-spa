# Videos · Módulo 2 Asistencial (self-hosted)

Coloca aquí los mp4 de las lecciones. El SPA los sirve como estáticos desde
`/videos/asistencial/<archivo>.mp4` (Vite sirve todo lo que esté en `public/`).

El nombre del archivo debe coincidir con el campo `video` de cada lección en
`src/data/asistencial.ts`. Mientras el archivo no exista, la lección muestra un
reproductor con el mensaje "Video en preparación".

> **Bloque 0 · Introducción y acceso** es de solo lectura (párrafos/listas), **no
> lleva video**. Los videos empiezan en el **Bloque 1 · Agendamiento**.

## Bloque 1 · Agendamiento de una cita

| Lección | Archivo esperado |
|---------|------------------|
| Creación de una agenda | `10-creacion-de-agenda.mp4` |
| Registro de un paciente | `11-registro-de-paciente.mp4` |
| Programación de una cita | `12-programacion-de-cita.mp4` |

Guiones de grabación en `docs/guiones/bloque-1-asistencial.md`.

## Bloque 2 · Admisión

| Lección | Archivo esperado |
|---------|------------------|
| Admisión de una cita | `20-admision-de-cita.mp4` |
| Atención de un paciente | `21-atencion-de-paciente.mp4` |

Guiones en `docs/guiones/bloque-2-asistencial.md`.

## Bloque 3 · Ordenamiento

| Lección | Archivo esperado |
|---------|------------------|
| Medicamentos | `30-medicamentos.mp4` |
| Combos de medicamentos | `31-combos-de-medicamentos.mp4` |
| Servicios | `32-servicios.mp4` |
| Combos de servicios | `33-combos-de-servicios.mp4` |
| Referencia | `34-referencia.mp4` |
| Certificado de asistencia | `35-certificado-de-asistencia.mp4` |
| Incapacidad | `36-incapacidad.mp4` |

Guiones en `docs/guiones/bloque-3-asistencial.md`.

## Recomendaciones de grabación

- **Formato:** MP4 (H.264 + AAC) — máxima compatibilidad en navegadores.
- **Resolución:** 1920×1080 (16:9), que es la proporción del reproductor.
- **Audio:** narración según el guion en `docs/guiones/`.
- **Peso:** comprime a un bitrate razonable (~2–4 Mbps) para que cargue rápido.
- No incluyas datos reales de pacientes; usa datos de prueba/ficticios.
