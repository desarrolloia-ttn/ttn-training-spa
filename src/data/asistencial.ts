// Temario del Módulo 2 · Asistencial (Biowel), estructurado según el índice del
// Manual BIOWEL PRO Asistencial: Introducción → Agendamiento → Admisión → Ordenamiento.
// El módulo arranca "desde cero": ninguna lección viene marcada como completada.

/** Bloque de contenido para lecciones de solo texto (sin video). */
export type ContentBlock =
  | { type: 'p'; text: string }
  | { type: 'ul'; items: string[] }
  | { type: 'ol'; items: string[] };

export interface AsistencialLesson {
  id: string;
  code: string;
  title: string;
  duration: string;
  summary: string;
  objectives: string[];
  /** Ruta del mp4 self-hosted en /public/videos/asistencial. Para lecciones con video. */
  video?: string;
  /** Contenido de texto (párrafos/listas) para lecciones de lectura, sin video. */
  content?: ContentBlock[];
}

export interface AsistencialBlock {
  title: string;
  lessons: AsistencialLesson[];
}

export const ASISTENCIAL_BLOCKS: AsistencialBlock[] = [
  {
    title: 'Bloque 0 · Introducción y acceso',
    lessons: [
      {
        id: 'obj',
        code: '1',
        title: 'Objetivo del módulo',
        duration: '3:00',
        summary:
          'Qué cubre el módulo Asistencial de Biowel: agendar una cita, admitir al paciente, atenderlo (historia clínica) y ordenar. Panorama del flujo de principio a fin.',
        objectives: [
          'Reconocer el alcance del flujo asistencial',
          'Ubicar los submódulos que vas a usar',
          'Entender cómo se conectan las etapas',
        ],
        content: [
          {
            type: 'p',
            text: 'Aprender a gestionar el flujo asistencial en Biowel: agendamiento de citas, admisión, atención del paciente en la historia clínica y ordenamiento.',
          },
        ],
      },
      {
        id: 'acceso',
        code: '2',
        title: 'Acceso al sistema',
        duration: '4:00',
        summary:
          'Cómo ingresar a Biowel con tus credenciales y, en el primer ingreso, seleccionar la cuenta (empresa) y el rol con el que vas a trabajar.',
        objectives: [
          'Iniciar sesión con usuario y contraseña',
          'Seleccionar la cuenta (empresa)',
          'Elegir el rol de trabajo',
        ],
        content: [
          {
            type: 'ul',
            items: [
              'Ingresar a través del enlace de Biowel.',
              'Iniciar sesión con tus credenciales (usuario y contraseña).',
              'Al ingresar por primera vez se debe seleccionar una cuenta (empresa) y el rol.',
            ],
          },
        ],
      },
      {
        id: 'requisitos',
        code: '3',
        title: 'Requisitos previos',
        duration: '3:30',
        summary:
          'Configuraciones necesarias antes de poder agendar: motivos de anulación, configuración de servicios y registro de recursos y sedes.',
        objectives: [
          'Verificar los motivos de anulación',
          'Confirmar la configuración de servicios',
          'Comprobar recursos y sedes registrados',
        ],
        content: [
          {
            type: 'ol',
            items: [
              'Registro de motivos de anulación',
              'Configuración de servicios',
              'Registro de recursos y sedes',
            ],
          },
        ],
      },
    ],
  },
  {
    title: 'Bloque 1 · Agendamiento de una cita',
    lessons: [
      {
        id: 'agenda',
        code: '4.1',
        title: 'Creación de una agenda',
        duration: '8:00',
        summary:
          'Crear el recurso de atención (consultorio, quirófano o virtual) desde asignación de recursos y luego la agenda del médico con horario, servicios relacionados y grupos de atención.',
        objectives: [
          'Crear un consultorio/quirófano con su disponibilidad',
          'Configurar la agenda del médico',
          'Definir horario y servicios relacionados',
          'Registrar grupos de atención',
        ],
        video: '/videos/asistencial/10-creacion-de-agenda.mp4',
      },
      {
        id: 'paciente',
        code: '4.2',
        title: 'Registro de un paciente',
        duration: '6:40',
        summary:
          'Inscribir un nuevo paciente con su información básica, complementaria y de aseguradora (obligatoria y, si aplica, voluntaria).',
        objectives: [
          'Inscribir un nuevo paciente',
          'Completar la información básica obligatoria',
          'Registrar la aseguradora y el plan',
        ],
        video: '/videos/asistencial/11-registro-de-paciente.mp4',
      },
      {
        id: 'programacion',
        code: '4.3',
        title: 'Programación de una cita',
        duration: '7:45',
        summary:
          'Programar la cita: aseguradora, tipo de servicio, ubicación, sede, médico y agenda disponible; enviar el recordatorio. Incluye descuentos y la consulta/gestión de citas (anular, reprogramar, confirmar).',
        objectives: [
          'Buscar agendas disponibles del médico',
          'Programar y enviar el recordatorio',
          'Solicitar y aprobar descuentos',
          'Anular, reprogramar o confirmar citas',
        ],
        video: '/videos/asistencial/12-programacion-de-cita.mp4',
      },
    ],
  },
  {
    title: 'Bloque 2 · Admisión',
    lessons: [
      {
        id: 'admision',
        code: '5.1',
        title: 'Admisión de una cita',
        duration: '7:20',
        summary:
          'Admitir las citas del día verificando información básica, adicional y recaudo; previsualizar la factura electrónica y gestionar los saldos a favor (devueltas).',
        objectives: [
          'Admitir las citas del día',
          'Verificar información y recaudo',
          'Previsualizar la factura electrónica',
          'Entregar saldos a favor (devueltas)',
        ],
        video: '/videos/asistencial/20-admision-de-cita.mp4',
      },
      {
        id: 'atencion',
        code: '5.2',
        title: 'Atención de un paciente',
        duration: '9:00',
        summary:
          'Atender al paciente desde el rol médico y documentar la historia clínica: preconsulta, examen físico/ocular, impresión diagnóstica (CIE-10), análisis y plan, signos vitales, tamizaje ocular y ortóptica.',
        objectives: [
          'Abrir la atención de un paciente admitido',
          'Registrar preconsulta y examen ocular',
          'Diagnosticar con CIE-10 y lateralidad',
          'Completar signos vitales y tamizaje',
        ],
        video: '/videos/asistencial/21-atencion-de-paciente.mp4',
      },
    ],
  },
  {
    title: 'Bloque 3 · Ordenamiento',
    lessons: [
      {
        id: 'medicamentos',
        code: '6.1',
        title: 'Medicamentos',
        duration: '6:00',
        summary:
          'Ordenar medicamentos con el filtro avanzado, definir cantidad, tiempos, periodo y vía de administración (con ojo si es oftálmico), y previsualizar la orden.',
        objectives: [
          'Buscar con el filtro avanzado',
          'Definir dosis, periodo y vía',
          'Agregar la orden al plan e imprimir',
        ],
        video: '/videos/asistencial/30-medicamentos.mp4',
      },
      {
        id: 'combos-medicamentos',
        code: '6.2',
        title: 'Combos de medicamentos',
        duration: '4:00',
        summary:
          'Usar combos de medicamentos preconfigurados que traen dosis, frecuencia, duración, cantidad, vía y ojo, con una observación general del tratamiento.',
        objectives: [
          'Seleccionar un combo de medicamentos',
          'Revisar dosis y frecuencia del combo',
          'Registrar la observación del tratamiento',
        ],
        video: '/videos/asistencial/31-combos-de-medicamentos.mp4',
      },
      {
        id: 'servicios',
        code: '6.3',
        title: 'Servicios',
        duration: '5:00',
        summary:
          'Ordenar consultas/ayudas diagnósticas o procedimientos/cirugía: motivo, tipo de orden, ojo, duración y programación del servicio.',
        objectives: [
          'Elegir el tipo de servicio a ordenar',
          'Definir motivo, ojo y duración',
          'Agregar el servicio al ordenamiento',
        ],
        video: '/videos/asistencial/32-servicios.mp4',
      },
      {
        id: 'combos-servicios',
        code: '6.4',
        title: 'Combos de servicios',
        duration: '4:30',
        summary:
          'Ordenar combos de servicios definiendo tipo de orden (aseguradora o particular), ojo (AO/OD/OI) y el combo específico.',
        objectives: [
          'Seleccionar el combo de servicio',
          'Definir tipo de orden y ojo',
          'Registrar la observación general',
        ],
        video: '/videos/asistencial/33-combos-de-servicios.mp4',
      },
      {
        id: 'referencia',
        code: '6.5',
        title: 'Referencia',
        duration: '5:00',
        summary:
          'Registrar la referencia (tipo, motivo, plan y expectativa) y la contrarreferencia de la institución que acepta la remisión; generar el documento.',
        objectives: [
          'Registrar la referencia del paciente',
          'Documentar la contrarreferencia',
          'Generar el documento imprimible',
        ],
        video: '/videos/asistencial/34-referencia.mp4',
      },
      {
        id: 'certificado',
        code: '6.6',
        title: 'Certificado de asistencia',
        duration: '3:30',
        summary:
          'Emitir el certificado que acredita que el paciente acudió a la institución, con fecha, observaciones y firma digital del médico.',
        objectives: [
          'Diligenciar la fecha de asistencia',
          'Agregar observaciones',
          'Validar con la firma digital',
        ],
        video: '/videos/asistencial/35-certificado-de-asistencia.mp4',
      },
      {
        id: 'incapacidad',
        code: '6.7',
        title: 'Incapacidad',
        duration: '3:30',
        summary:
          'Registrar la incapacidad otorgada: número de días, fechas de inicio y fin, observaciones, y validar con la firma digital del médico.',
        objectives: [
          'Registrar días y fechas de la incapacidad',
          'Añadir observaciones relevantes',
          'Validar con la firma digital',
        ],
        video: '/videos/asistencial/36-incapacidad.mp4',
      },
    ],
  },
];

export const ASISTENCIAL_LESSONS: AsistencialLesson[] = ASISTENCIAL_BLOCKS.flatMap(
  (b) => b.lessons,
);

export const ASISTENCIAL_TOTAL = ASISTENCIAL_LESSONS.length;
