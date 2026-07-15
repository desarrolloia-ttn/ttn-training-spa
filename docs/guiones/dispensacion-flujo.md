# Guiones · Módulo 4 · Bloques 2 y 3 · Flujo de dispensación

Graba en 1920×1080 con datos de prueba. Requiere que la parametrización (Bloque 1)
ya esté hecha y que exista un paciente con evento vigente en PROGRAMASTOP.

---

## Bloque 2 · Ordenamiento desde un evento PROGRAMASTOP

### Video `44-ordenamiento-consulta.mp4` · Consulta del paciente
| # | Narración | Acción en pantalla |
|---|-----------|--------------------|
| 1 | "En el Módulo de Ordenamientos, submódulo Órdenes, apartado Ordenar." | Ordenamientos → **Órdenes → Ordenar**. |
| 2 | "Ingresamos el número de documento del paciente. Solo aparecen pacientes con una programación vigente hoy en PROGRAMASTOP." | Escribir documento. |
| 3 | "Se muestra el evento del día con su diagnóstico principal y secundario. Al hacer clic, los datos van a la izquierda y a la derecha queda el ordenamiento de medicamentos." | Abrir el evento; señalar pestañas. |

### Video `45-ordenamiento-medicamentos.mp4` · Ordenamiento de medicamentos
| # | Narración | Acción en pantalla |
|---|-----------|--------------------|
| 1 | "Seleccionamos el Tipo de orden: particular, aseguradora o sugerencia." | Elegir tipo de orden. |
| 2 | "Escogemos el medicamento y llenamos la receta: cantidad, cada, tiempo, durante, periodo y vía." | Diligenciar receta. |
| 3 | "Con la flecha agregamos el medicamento; podemos ordenar varios. Luego 'Ordenar' para ver el detalle." | Agregar; **Ordenar**. |

### Video `46-ordenamiento-servicios-combos.mp4` · Servicios y combos
| # | Narración | Acción en pantalla |
|---|-----------|--------------------|
| 1 | "Para un servicio, elegimos consulta o procedimiento y el motivo (accidente de trabajo, tránsito, enfermedad general/profesional)." | Pestaña Servicios. |
| 2 | "Seleccionamos tipo de orden, el servicio (con plan contrato vigente) y la sub-especialidad; agregamos con la flecha naranja y ordenamos." | Diligenciar y ordenar. |
| 3 | "Para combos, en 'Combos M' elegimos el combo de medicamentos; en 'Combos S' elegimos la orden, el motivo y el combo de servicios; agregamos observación y ordenamos." | Pestañas **Combos M** y **Combos S**. |

### Video `47-ordenamiento-referencia-cert-incap.mp4` · Referencia, certificado e incapacidad
| # | Narración | Acción en pantalla |
|---|-----------|--------------------|
| 1 | "En Referencia registramos la sección de referencia (motivo de 50 caracteres) y la contrarreferencia; con la flecha agregamos y generamos el PDF." | Pestaña **Referencia**. |
| 2 | "En Cert. de asistencia llenamos fecha y observaciones y generamos el PDF." | Pestaña **Cert. de asistencia**. |
| 3 | "En Incapacidad, al poner el No. de días se calcula la fecha fin; generamos el certificado en PDF." | Pestaña **Incapacidad**. |

---

## Bloque 3 · Dispensación de medicamentos

### Video `48-dispensacion-soportes.mp4` · Parametrización de soportes
| # | Narración | Acción en pantalla |
|---|-----------|--------------------|
| 1 | "En Dispensación → Configuración → Parametrización de soportes, damos 'Crear parametrización'." | Abrir el apartado. |
| 2 | "Seleccionamos la empresa-cliente y el tipo de contrato; se listan los documentos de soporte parametrizados." | Seleccionar empresa/contrato. |
| 3 | "Con 'Agregar' registramos el nombre del documento y el tipo de archivo, y guardamos. Estos soportes serán obligatorios al dispensar." | Agregar documento; **Guardar**. |

### Video `49-dispensacion-editar-paciente.mp4` · Editar datos del paciente
| # | Narración | Acción en pantalla |
|---|-----------|--------------------|
| 1 | "En Citas → Registro de citas → Registrar, buscamos al paciente por documento." | Buscar paciente. |
| 2 | "Abrimos el detalle, clic en el icono de persona y luego en el lápiz para editar." | Editar. |
| 3 | "Completamos información básica, el celular en complementaria y la aseguradora obligatoria; guardamos." | Diligenciar y **Guardar**. |

### Video `50-dispensacion-entrega.mp4` · Entrega (aseguradora / venta libre)
| # | Narración | Acción en pantalla |
|---|-----------|--------------------|
| 1 | "En Dispensación se listan las sedes del usuario. Seleccionamos la sede donde se ordenó (si no, no aparece el ordenamiento)." | Seleccionar sede. |
| 2 | "En 'Entrega de medicamentos' buscamos al paciente por nombre/ID o por aseguradora, y abrimos su ordenamiento." | Buscar y abrir. |
| 3 | "Elegimos Aseguradora o Venta libre. Con 'Escanear medicamentos' ingresamos el código de barras del artículo activo y la cantidad; se refleja en 'Entrega real'." | Escanear; registrar cantidad. |
| 4 | "Adjuntamos los soportes obligatorios (foto del rostro e identificación, firma y nombre de quien recibe) y damos 'Establecer entrega'." | Registro de entrega. |
| 5 | "En el resumen de compra registramos el monto pagado y damos 'Generar resumen de dispensación' para finalizar." | **Generar resumen**. |

> Diferencia clave: por **Aseguradora** la cantidad viene de la orden (entregas
> parciales posibles); por **Venta libre** se puede ingresar una cantidad distinta.
