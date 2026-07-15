import type { ModuleContent } from './moduleTypes';

export const DISPENSACION: ModuleContent = {
  id: 4,
  code: 'MÓDULO 4 · DISPENSACIÓN',
  title: 'Dispensación',
  cover: '/modules/dispensacion.png',
  docs: [
    { kind: 'PDF', title: 'Manual · Parametrización de tablas (PROGRAMASTOP)', sub: 'Config. previa · leer y aplicar primero' },
    { kind: 'PDF', title: 'Manual · Flujo de dispensación (PROGRAMASTOP)', sub: 'Ordenamiento y entrega de medicamentos' },
  ],
  blocks: [
    {
      title: 'Bloque 1 · Parametrización de tablas',
      lessons: [
        {
          id: 'intro',
          code: '1',
          title: 'Introducción y consideraciones',
          duration: '',
          summary:
            'Qué se parametriza y en qué orden para habilitar el ordenamiento y la dispensación de medicamentos a partir de un evento de PROGRAMASTOP.',
          objectives: [
            'Entender por qué la parametrización va primero',
            'Conocer las reglas clave de coincidencia con PROGRAMASTOP',
            'Identificar las 4 áreas a configurar',
          ],
          content: [
            {
              type: 'p',
              text: 'La parametrización debe hacerse en el orden indicado; si se omite un paso, el ordenamiento/dispensación no funciona. Estas son las consideraciones más importantes:',
            },
            {
              type: 'ul',
              items: [
                'Nombres, códigos y prefijos en Biowel deben coincidir EXACTAMENTE con los de PROGRAMASTOP (eventos, pacientes, servicios).',
                'Los artículos activos deben crearse antes de registrar los medicamentos (se asocian entre sí).',
                'El manual tarifario debe existir antes de asignar medicamentos y habilitar la dispensación.',
                'El plan contrato debe tener marcada la opción "Habilitar dispensación".',
                'La asignación de sedes a los usuarios es obligatoria para dispensar.',
              ],
            },
            {
              type: 'p',
              text: 'La parametrización se recorre en 4 áreas: Administración, Facturación, Asistencial y Configuración de medicamentos para PROGRAMASTOP.',
            },
          ],
        },
        {
          id: 'param-admin',
          code: '2',
          title: 'Configuración en Administración',
          duration: '9:00',
          summary:
            'Tablas maestras de administración: cuentas, roles y usuarios, resolución de facturación, sedes (prefijo = PROGRAMASTOP), plan de cuentas, unidades funcionales, centros de costo, unidades de medida, familias de inventario, artículos activos y centros de consumo.',
          objectives: [
            'Crear cuenta, roles/permisos y usuarios',
            'Crear sedes con el prefijo exacto de PROGRAMASTOP',
            'Crear artículos activos marcando "Maneja lote"',
            'Definir familias de inventario y centros de consumo',
          ],
          video: '/videos/dispensacion/40-param-administracion.mp4',
        },
        {
          id: 'param-facturacion',
          code: '3',
          title: 'Configuración de Facturación (TM)',
          duration: '10:00',
          summary:
            'Especialidades, tipos de código (uno exclusivo para habilitar dispensación), hoja de consumo, servicios (nombre y código iguales a PROGRAMASTOP), régimen, autorizaciones, coberturas, empresa-cliente (igual a PROGRAMASTOP), población "Programastop", manual tarifario (check Dispensación MED), asignación de servicios, plan contrato (Habilitar dispensación) y cuota moderadora.',
          objectives: [
            'Crear el tipo de código que habilita la dispensación',
            'Registrar empresa-cliente y población iguales a PROGRAMASTOP',
            'Crear el manual tarifario de dispensación (Dispensación MED)',
            'Crear el plan contrato con "Habilitar dispensación"',
          ],
          video: '/videos/dispensacion/41-param-facturacion.mp4',
        },
        {
          id: 'param-asistencial',
          code: '4',
          title: 'Parametrización Asistencial',
          duration: '8:00',
          summary:
            'Medicamentos (código CUM + relación con artículo activo + diagnósticos), combos de servicios, combos de cirugía, motivos de cancelación de órdenes, asignación de sedes a usuarios, impresiones diagnósticas (CIE-10) y diagnósticos extendidos.',
          objectives: [
            'Crear medicamentos con CUM y relacionarlos a un artículo activo',
            'Relacionar diagnósticos al medicamento',
            'Asignar sedes a los usuarios (obligatorio para dispensar)',
            'Registrar CIE-10 y diagnósticos extendidos',
          ],
          video: '/videos/dispensacion/42-param-asistencial.mp4',
        },
        {
          id: 'param-programastop',
          code: '5',
          title: 'Configuración de medicamentos para PROGRAMASTOP',
          duration: '9:30',
          summary:
            'Relacionar el artículo a un almacén, agregar tipos de insumos, añadir lotes asistenciales, asociar el medicamento al artículo activo, asignar los medicamentos al manual tarifario y habilitar la dispensación en el plan contrato.',
          objectives: [
            'Relacionar artículos a un almacén (acepta externos)',
            'Registrar lotes asistenciales por centro de consumo y familia',
            'Asignar medicamentos al manual tarifario de dispensación',
            'Habilitar dispensación y medicamentos relacionados en el contrato',
          ],
          video: '/videos/dispensacion/43-param-programastop.mp4',
        },
      ],
    },
    {
      title: 'Bloque 2 · Ordenamiento desde un evento PROGRAMASTOP',
      lessons: [
        {
          id: 'consulta',
          code: '6',
          title: 'Consulta del paciente',
          duration: '5:00',
          summary:
            'Desde Ordenamientos → Órdenes → Ordenar, se consulta al paciente por número de documento; solo aparecen pacientes con una programación vigente para el día en PROGRAMASTOP, con su diagnóstico principal y secundario.',
          objectives: [
            'Buscar al paciente por documento',
            'Abrir el evento programado del día',
            'Reconocer las pestañas de ordenamiento disponibles',
          ],
          video: '/videos/dispensacion/44-ordenamiento-consulta.mp4',
        },
        {
          id: 'orden-medicamentos',
          code: '7',
          title: 'Ordenamiento de medicamentos',
          duration: '6:00',
          summary:
            'Seleccionar el tipo de orden (particular, aseguradora o sugerencia), elegir el medicamento y su receta (cantidad, tiempo, durante, periodo, vía), agregarlo con la flecha y ordenar para ver el detalle.',
          objectives: [
            'Elegir el tipo de orden',
            'Diligenciar la receta del medicamento',
            'Agregar y ordenar los medicamentos necesarios',
          ],
          video: '/videos/dispensacion/45-ordenamiento-medicamentos.mp4',
        },
        {
          id: 'orden-servicios-combos',
          code: '8',
          title: 'Servicios y combos',
          duration: '6:30',
          summary:
            'Ordenar servicios (por consulta o procedimiento) eligiendo motivo, tipo de orden y sub-especialidad; y ordenar combos de medicamentos (Combos M) y de servicios (Combos S) previamente creados.',
          objectives: [
            'Ordenar un servicio con su motivo y sub-especialidad',
            'Ordenar combos de medicamentos',
            'Ordenar combos de servicios',
          ],
          video: '/videos/dispensacion/46-ordenamiento-servicios-combos.mp4',
        },
        {
          id: 'orden-documentos',
          code: '9',
          title: 'Referencia, certificado e incapacidad',
          duration: '5:30',
          summary:
            'Generar la referencia/contrarreferencia (motivo de 50 caracteres), el certificado de asistencia (fecha y observaciones) y la incapacidad (la fecha fin se calcula con el número de días). Cada documento se genera en PDF.',
          objectives: [
            'Registrar referencia y contrarreferencia',
            'Emitir el certificado de asistencia',
            'Generar la incapacidad en PDF',
          ],
          video: '/videos/dispensacion/47-ordenamiento-referencia-cert-incap.mp4',
        },
      ],
    },
    {
      title: 'Bloque 3 · Dispensación de medicamentos',
      lessons: [
        {
          id: 'soportes',
          code: '10',
          title: 'Parametrización de soportes',
          duration: '4:00',
          summary:
            'En Dispensación → Configuración → Parametrización de soportes, crear la parametrización por empresa-cliente y tipo de contrato, y agregar los documentos de soporte (nombre y tipo de archivo) obligatorios para dispensar.',
          objectives: [
            'Crear la parametrización de soportes por empresa-cliente',
            'Agregar los documentos de soporte requeridos',
          ],
          video: '/videos/dispensacion/48-dispensacion-soportes.mp4',
        },
        {
          id: 'editar-paciente',
          code: '11',
          title: 'Editar datos del paciente',
          duration: '4:30',
          summary:
            'Desde Citas → Registro de citas → Registrar, buscar al paciente por documento y editar su información básica, celular y aseguradora obligatoria antes de dispensar.',
          objectives: [
            'Buscar y abrir el paciente',
            'Editar información básica y de aseguradora',
            'Guardar los cambios del paciente',
          ],
          video: '/videos/dispensacion/49-dispensacion-editar-paciente.mp4',
        },
        {
          id: 'entrega',
          code: '12',
          title: 'Entrega de medicamentos (aseguradora / venta libre)',
          duration: '8:30',
          summary:
            'En Dispensación seleccionar la sede donde se ordenó, buscar al paciente, abrir su ordenamiento y entregar por Aseguradora o Venta libre: escanear el código de barras del artículo, registrar la entrega real, adjuntar los soportes (fotos, firma, nombre) y generar el resumen de dispensación.',
          objectives: [
            'Seleccionar la sede correcta del ordenamiento',
            'Escanear el medicamento y registrar la entrega real',
            'Adjuntar los soportes obligatorios y datos de quien recibe',
            'Generar el resumen de dispensación',
          ],
          video: '/videos/dispensacion/50-dispensacion-entrega.mp4',
        },
      ],
    },
  ],
};
