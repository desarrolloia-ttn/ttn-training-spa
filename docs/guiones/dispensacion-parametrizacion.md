# Guiones · Módulo 4 · Bloque 1 · Parametrización de tablas

Graba en 1920×1080 con datos de prueba. **Regla de oro:** los nombres, códigos y
prefijos en Biowel deben coincidir EXACTAMENTE con los de PROGRAMASTOP. Sigue el
orden de las áreas; cada video recorre sus tablas de arriba a abajo.

> "Introducción y consideraciones" es una lección de **lectura** (sin video).

---

## Video `40-param-administracion.mp4` · Configuración en Administración
Módulo **Administración** → TM de administración / compra / contabilidad.

| # | Narración | Acción en pantalla |
|---|-----------|--------------------|
| 1 | "Empezamos en Administración. Creamos la Cuenta (entidad) con su representante legal, logo y firma." | TM administración → **Cuentas** → crear. |
| 2 | "Creamos un rol con sus permisos y luego el usuario, relacionándole el rol y la cuenta." | TM seguridad → **Roles y permisos**; **Usuarios**. |
| 3 | "Registramos la resolución de facturación." | TM facturación → **Resoluciones de facturación**. |
| 4 | "Creamos las sedes. Importante: el prefijo debe ser idéntico al de la sede en PROGRAMASTOP." | TM administración → **Sedes** (resaltar el prefijo). |
| 5 | "En contabilidad creamos el plan único de cuentas, y luego unidades funcionales (con cuenta contable y sede) y centros de costo." | **Plan de cuentas**, **Unidad funcional**, **Centros de costo**. |
| 6 | "En compras definimos las unidades de medida y las familias de inventario (marcando si permiten ordenamiento/dispensación)." | TM compra → **Unidades de medida**, **Familias de inventarios**. |
| 7 | "Creamos el Artículo activo (el medicamento). Muy importante marcar 'Maneja lote' porque no se puede editar después." | TM compra → **Artículos activos** → crear (resaltar 'Maneja lote'). |
| 8 | "Por último, creamos los centros de consumo." | **Centros de consumo**. |

---

## Video `41-param-facturacion.mp4` · Configuración de Facturación (TM)
Submódulo **TM de Facturación**.

| # | Narración | Acción en pantalla |
|---|-----------|--------------------|
| 1 | "Creamos especialidad y subespecialidad." | **Especialidad**, **Subespecialidad**. |
| 2 | "Creamos los tipos de código. Debemos crear un código exclusivo que habilita la dispensación de medicamentos." | **Tipos de código** (resaltar el de dispensación). |
| 3 | "Creamos la hoja de consumo y le agregamos artículos por familia/etapa." | **Hoja de consumo**. |
| 4 | "Creamos los servicios. El nombre y código deben ser iguales a los de PROGRAMASTOP; diligenciamos info general y contable." | **Servicios** → crear. |
| 5 | "Creamos régimen, tipos de autorización, modalidad de pago y coberturas." | **Régimen**, **Autorización**, **Modalidad de pago**, **Coberturas**. |
| 6 | "Creamos la Empresa-Cliente con los mismos datos que en PROGRAMASTOP (código SIIS, tipo, etc.)." | **Empresa - Cliente** → crear. |
| 7 | "Creamos la Población asociada a la empresa; en la descripción va 'Programastop' para permitir el ordenamiento por evento." | TM administración → **Población**. |
| 8 | "Creamos el Manual tarifario; para dispensación marcamos el check 'Dispensación MED' con el código exclusivo." | **Manual tarifario** → crear. |
| 9 | "Hacemos la asignación de servicios al manual y creamos el Plan contrato con el nombre EXACTO de PROGRAMASTOP; marcamos 'Habilitar dispensación' y seleccionamos el manual de dispensación." | **Asignación de servicios**, **Plan contrato**. |
| 10 | "Configuramos la cuota moderadora (grupos y relación entidad)." | **Cuota moderadora**. |

---

## Video `42-param-asistencial.mp4` · Parametrización Asistencial

| # | Narración | Acción en pantalla |
|---|-----------|--------------------|
| 1 | "Creamos el medicamento con su código CUM; eso habilita relacionarlo a un artículo activo de compras." | TM ordenamiento → **Medicamentos** → nuevo (registrar CUM). |
| 2 | "Relacionamos el artículo activo, diligenciamos forma farmacéutica, grupo, disposición (para dispensar), unidad, presentación y concentración." | Completar el medicamento. |
| 3 | "Relacionamos los diagnósticos del medicamento (para asociarlo al diagnóstico principal del evento) y la empresa-cliente/contrato." | Sección de diagnósticos y aseguradora. |
| 4 | "Creamos combos de servicios y combos de cirugía si aplican." | **Combos de servicios**, **Combos de cirugía**. |
| 5 | "Registramos los motivos de cancelación de órdenes de medicamentos." | **Motivos de cancelación**. |
| 6 | "Asignamos sedes a los usuarios (obligatorio para dispensar): por cargo, relacionamos una o varias sedes." | TM admisiones → **Asignación de sedes**. |
| 7 | "Registramos las impresiones diagnósticas CIE-10 y los diagnósticos extendidos (IDX)." | TM historia clínica → **CIE-10**, **Diagnósticos extendidos**. |

---

## Video `43-param-programastop.mp4` · Config. medicamentos para PROGRAMASTOP

| # | Narración | Acción en pantalla |
|---|-----------|--------------------|
| 1 | "Relacionamos el artículo a un almacén: creamos/abrimos el almacén, relacionamos sedes y los artículos con sus cantidades, marcando 'Acepta externos'." | TM compra → **Almacenes**. |
| 2 | "Agregamos los tipos de insumo: en insumos generales seleccionamos la familia de inventario de los artículos de dispensación." | Asistencial → TM cirugía → **Tipos de insumo**. |
| 3 | "Añadimos los lotes asistenciales: seleccionamos centro de consumo y familia, y agregamos el lote del artículo." | TM historia clínica → **Lotes asistenciales**. |
| 4 | "Asociamos el medicamento al artículo activo (al registrar el CUM, relacionamos el artículo)." | TM ordenamiento → **Medicamentos**. |
| 5 | "Asignamos los medicamentos al manual tarifario de dispensación con su valor unitario." | **Manual tarifario** → nueva asignación. |
| 6 | "Por último, editamos el plan contrato: marcamos 'Habilitar dispensación', vamos a 'Medicamentos relacionados', seleccionamos el manual y los medicamentos, registramos valores y guardamos." | **Plan contrato** → editar. |

> Nota: la parametrización por base de datos (tabla de logs de dispensación) la
> realiza el equipo de TTN COMPANY; se menciona pero no se graba.
