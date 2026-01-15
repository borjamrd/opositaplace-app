export const files = [
  {
    name: 'Técnicas de estudio.pdf',
    body: 'Método Pomodoro, Active Recall y Spaced Repetition para optimizar tu tiempo.',
  },
  {
    name: 'Constitución.pdf',
    body: 'La norma suprema del ordenamiento jurídico español, a tu alcance.',
  },
  {
    name: 'Esquemas.svg',
    body: 'Visualiza los conceptos clave con mapas mentales y diagramas claros.',
  },
  {
    name: 'Resúmenes.docx',
    body: 'Síntesis de los temas más importantes para repasar rápidamente.',
  },
  {
    name: 'Planificación.xlsx',
    body: 'Organiza tu semana y cumple tus objetivos de estudio sin estrés.',
  },
];

export const laws = [
  {
    name: 'Supuesto práctico I GACE-L, OEP 2015',
    body: 'El Ministerio de Agricultura, Pesca y Alimentación tiene afectada la planta segunda de un inmueble sito en la calle Real n° 2, en el que se encuentra la sede de la Dirección General de Desarrollo...',
  },
  {
    name: 'Supuesto práctico II GACE-L, OEP 2014',
    body: 'El Instituto Nacional de las Artes Escénicas y de la Música (INAEM) es un Organismo Autónomo dependiente de la Secretaría de Estado de Cultura del Ministerio de Educación y Formación Profesiona...',
  },
  {
    name: 'Supuesto práctico I GACE-L, OEP 2014',
    body: 'El Organismo Autónomo estatal Instituto de Técnicas Especiales necesita adquirir tóner para impresoras, habida cuenta del consumo ordinario del mismo. En el informe de necesidad del expediente...',
  },
  {
    name: 'Supuesto práctico II GACE-L, OEP 2012-2013',
    body: 'El Ministerio de Asuntos Exteriores, Unión Europea y de Cooperación (MAEC) desea contratar el acceso a las redes y la adquisición de energía eléctrica que se ha de suministrar a distintas depen...',
  },
  {
    name: 'Supuesto práctico I GACE-L, OEP 2012-2013',
    body: 'Mediante Resolución de la Administración General del Estado de 15 de octubre de 2020 se convocaron ocho puestos de trabajo del Cuerpo de Ingenieros de Caminos, Subgrupo A1, adscritos al Ministe...',
  },
  {
    name: 'Supuesto práctico II GACE-L, OEP 2011',
    body: 'El Ministerio de Sanidad celebró un convenio en el año 2020 con la industria farmacéutica, con el objeto de fomentar la investigación en fármacos para enfermedades raras y el desarrollo de vacu...',
  },
  {
    name: 'Supuesto práctico I GACE-L, OEP 2011',
    body: 'Conforme a lo previsto en el Real Decreto de estructura del Ministerio de Transportes, Movilidad y Agenda Urbana, la División de Reclamaciones de Responsabilidad Patrimonial (en adelante, la...',
  },
  {
    name: 'GACE - Ingreso Libre - 2010 - SP2',
    body: 'Durante el ejercicio presupuestario de 2021 surgieron las siguientes necesidades en el Ministerio de Transportes, Movilidad y Agenda Urbana: A la Subsecretaría del Ministerio, le fue comunicada...',
  },
  {
    name: 'GACE - Ingreso Libre - 2010 - SP1',
    body: 'La Dirección General de Tráfico (DGT), el Organismo Autónomo responsable, entre otras cosas, de la seguridad vial en las carreteras de titularidad estatal, ha decidido abrir una nueva Oficina...',
  },
];

export interface Item {
  name: string;
  description: string;
  icon: string;
  color: string;
  time: string;
}

let notificationsData = [
  {
    name: 'Nuevo test disponible',
    description: 'Constitución Española - Título I',
    time: '15m ago',

    icon: '📝',
    color: '#00C9A7',
  },
  {
    name: 'Objetivo cumplido',
    description: 'Has completado 3 horas de estudio',
    time: '2h ago',
    icon: '🎯',
    color: '#FFB800',
  },
  {
    name: 'Recordatorio',
    description: 'Repaso programado: Derecho Administrativo',
    time: '5h ago',
    icon: '⏰',
    color: '#FF3D71',
  },
  {
    name: 'Nueva funcionalidad',
    description: 'Analiza tu progreso con gráficas detalladas',
    time: '1d ago',
    icon: '📊',
    color: '#1E86FF',
  },
];

export const notifications: Item[] = Array.from({ length: 10 }, () => notificationsData).flat();
