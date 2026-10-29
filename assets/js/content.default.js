/* Contenido por defecto del sitio. El panel administrativo sobrescribe estos
   valores y los guarda en content.json (servidor) o en el navegador. */
window.DEFAULT_CONTENT = {
  meta: { updated: 0, version: 1 },

  brand: {
    name: 'Laboratorio Clínico Divina Misericordia',
    short: 'Divina Misericordia',
    tagline: 'Laboratorio Clínico',
    logo: '',
    logoHeader: 46,
    logoHero: 120,
    logoHeroShow: true,
    logoHeroAlign: 'left',
    logoHeroPos: 'top',
    logoHeroCard: true,
    primary: '#0a2a52',
    accent: '#12b5a5',
    phone: '+57 300 000 0000',
    whatsapp: '573000000000',
    email: 'contacto@divinamisericordia.com',
    address: 'Calle 00 # 00-00, Ciudad, Colombia',
    facebook: '',
    instagram: '',
    tiktok: ''
  },

  results: {
    mode: 'demo',
    urlTemplate: 'https://resultados.ejemplo.com/consulta?documento={cedula}&codigo={codigo}',
    apiEndpoint: '',
    openIn: 'modal',
    help: 'El código de consulta aparece en la factura o comprobante que recibió al momento de la toma de muestra.'
  },

  order: ['hero', 'stats', 'results', 'services', 'about', 'quality', 'process', 'packages', 'home', 'team', 'partners', 'testimonials', 'prep', 'faq', 'location', 'contact'],

  sections: {
    hero: {
      visible: true,
      eyebrow: 'Resultados confiables · Atención humana',
      title: 'Precisión diagnóstica con el calor humano que usted merece',
      subtitle: 'Tecnología de última generación, bacteriólogos certificados y resultados en línea en tiempo récord. Su salud, en las mejores manos.',
      cta1: 'Consultar resultados',
      cta2: 'Agendar por WhatsApp',
      image: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&w=1920&q=80',
      imageMode: 'background',
      overlay: 70,
      textAlign: 'left',
      items: [
        { text: 'Resultados en línea 24/7' },
        { text: 'Toma de muestras a domicilio' },
        { text: 'Control de calidad certificado' }
      ]
    },

    stats: {
      visible: true,
      items: [
        { value: '25', suffix: '+', label: 'Años de experiencia' },
        { value: '300', suffix: '+', label: 'Pruebas disponibles' },
        { value: '120', suffix: 'k', label: 'Pacientes atendidos' },
        { value: '99.8', suffix: '%', label: 'Precisión analítica' }
      ]
    },

    results: {
      visible: true,
      eyebrow: 'Portal del paciente',
      title: 'Consulte sus resultados en línea',
      subtitle: 'Ingrese su número de documento y el código de consulta impreso en su comprobante. Rápido, seguro y confidencial.',
      image: '',
      imageMode: 'none',
      overlay: 60,
      items: [
        { icon: 'shield', text: 'Conexión cifrada y confidencial' },
        { icon: 'clock', text: 'Disponible las 24 horas' },
        { icon: 'file', text: 'Descargue e imprima su PDF' }
      ]
    },

    services: {
      visible: true,
      eyebrow: 'Servicios',
      title: 'Un portafolio diagnóstico completo',
      subtitle: 'Más de 300 pruebas con estándares internacionales de calidad y tiempos de entrega competitivos.',
      image: '',
      imageMode: 'none',
      overlay: 60,
      items: [
        { icon: 'drop', title: 'Hematología', text: 'Cuadro hemático, coagulación, VSG, hemoclasificación y estudios especiales.', image: '' },
        { icon: 'flask', title: 'Química sanguínea', text: 'Glucosa, perfil lipídico, función renal y hepática, electrolitos.', image: '' },
        { icon: 'shield', title: 'Inmunología', text: 'Pruebas infecciosas, marcadores tumorales, perfil tiroideo y hormonal.', image: '' },
        { icon: 'microscope', title: 'Microbiología', text: 'Cultivos, antibiogramas, coprológicos y estudios parasitológicos.', image: '' },
        { icon: 'baby', title: 'Pruebas de embarazo', text: 'Prueba cualitativa y cuantitativa de embarazo con resultados el mismo día.', image: '' },
        { icon: 'dna', title: 'Biología molecular', text: 'PCR y pruebas especializadas mediante laboratorios de referencia aliados.', image: '' },
        { icon: 'heart', title: 'Chequeos ejecutivos', text: 'Paquetes preventivos para empresas, salud ocupacional y medicina laboral.', image: '' },
        { icon: 'home', title: 'Toma a domicilio', text: 'Nuestro personal va hasta su hogar o empresa con total bioseguridad.', image: '' }
      ]
    },

    about: {
      visible: true,
      eyebrow: 'Nosotros',
      title: 'Ciencia, ética y misericordia al servicio de su salud',
      text: 'Somos un laboratorio clínico comprometido con la exactitud de cada resultado. Combinamos equipos automatizados de última generación, procesos estandarizados y un equipo humano que entiende que detrás de cada muestra hay una persona y una familia.',
      image: 'https://images.unsplash.com/photo-1582719471384-894fbb16e074?auto=format&fit=crop&w=1200&q=80',
      imageMode: 'frame',
      overlay: 60,
      mission: 'Brindar resultados confiables y oportunos que apoyen decisiones médicas acertadas, con un trato cálido y humano.',
      vision: 'Ser el laboratorio clínico de referencia en la región por su calidad, innovación y servicio al paciente.',
      items: [
        { text: 'Equipos automatizados de última generación' },
        { text: 'Bacteriólogos con formación continua' },
        { text: 'Control de calidad interno y externo' },
        { text: 'Habilitados ante la Secretaría de Salud' }
      ]
    },

    quality: {
      visible: true,
      eyebrow: 'Por qué elegirnos',
      title: 'Estándares de clase mundial',
      subtitle: 'Cada proceso está diseñado para garantizar exactitud, seguridad y la mejor experiencia del paciente.',
      image: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=1920&q=80',
      imageMode: 'background',
      overlay: 85,
      items: [
        { icon: 'award', title: 'Calidad certificada', text: 'Participamos en programas de evaluación externa del desempeño y control de calidad diario.' },
        { icon: 'clock', title: 'Resultados rápidos', text: 'La mayoría de pruebas de rutina se entregan el mismo día, disponibles en línea.' },
        { icon: 'shield', title: 'Bioseguridad total', text: 'Material estéril, desechable y protocolos estrictos en cada toma de muestra.' },
        { icon: 'user', title: 'Atención humana', text: 'Personal amable, especial cuidado con niños, adultos mayores y pacientes sensibles.' }
      ]
    },

    process: {
      visible: true,
      eyebrow: 'Cómo funciona',
      title: 'Su experiencia en 4 simples pasos',
      subtitle: '',
      image: '',
      imageMode: 'none',
      overlay: 60,
      items: [
        { title: 'Agende', text: 'Escríbanos por WhatsApp o llegue directamente a nuestra sede.' },
        { title: 'Prepárese', text: 'Le indicamos el ayuno o preparación necesaria para su examen.' },
        { title: 'Toma de muestra', text: 'En sede o a domicilio, rápida, segura y prácticamente sin dolor.' },
        { title: 'Resultados en línea', text: 'Consulte e imprima sus resultados con su cédula y código.' }
      ]
    },

    packages: {
      visible: true,
      eyebrow: 'Chequeos preventivos',
      title: 'Paquetes diseñados para su bienestar',
      subtitle: 'Prevenir es la mejor inversión. Elija el chequeo que mejor se adapte a usted.',
      image: '',
      imageMode: 'none',
      overlay: 60,
      items: [
        { name: 'Chequeo Básico', price: '$ 89.000', includes: 'Cuadro hemático\nGlucosa\nParcial de orina\nCreatinina', featured: false },
        { name: 'Chequeo Integral', price: '$ 189.000', includes: 'Cuadro hemático\nPerfil lipídico completo\nGlucosa y HbA1c\nFunción renal y hepática\nTSH\nParcial de orina', featured: true },
        { name: 'Chequeo Ejecutivo', price: '$ 299.000', includes: 'Todo el chequeo integral\nPSA o perfil hormonal\nÁcido úrico\nVitamina D\nCoprológico', featured: false }
      ]
    },

    home: {
      visible: true,
      eyebrow: 'Servicio a domicilio',
      title: 'Llevamos el laboratorio hasta su puerta',
      text: 'Ideal para adultos mayores, pacientes con movilidad reducida, niños y empresas. Agende su toma de muestra en casa u oficina con los mismos estándares de calidad de nuestra sede.',
      cta: 'Agendar toma a domicilio',
      image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=1200&q=80',
      imageMode: 'frame',
      overlay: 60
    },

    team: {
      visible: true,
      eyebrow: 'Nuestro equipo',
      title: 'Profesionales que inspiran confianza',
      subtitle: '',
      image: '',
      imageMode: 'none',
      overlay: 60,
      items: [
        { name: 'Dra. Nombre Apellido', role: 'Bacterióloga · Directora científica', photo: '' },
        { name: 'Nombre Apellido', role: 'Bacteriólogo · Control de calidad', photo: '' },
        { name: 'Nombre Apellido', role: 'Auxiliar de laboratorio', photo: '' },
        { name: 'Nombre Apellido', role: 'Atención al paciente', photo: '' }
      ]
    },

    partners: {
      visible: true,
      eyebrow: 'Convenios',
      title: 'Atendemos a sus aseguradoras y empresas aliadas',
      subtitle: '',
      image: '',
      imageMode: 'none',
      overlay: 60,
      items: [
        { name: 'EPS Aliada', logo: '' },
        { name: 'Medicina Prepagada', logo: '' },
        { name: 'Pólizas de Salud', logo: '' },
        { name: 'Empresas', logo: '' },
        { name: 'IPS Aliada', logo: '' }
      ]
    },

    testimonials: {
      visible: true,
      eyebrow: 'Testimonios',
      title: 'Lo que dicen nuestros pacientes',
      subtitle: '',
      image: '',
      imageMode: 'none',
      overlay: 60,
      items: [
        { name: 'María G.', text: 'Excelente atención, la toma de muestra fue rapidísima y tuve mis resultados en línea esa misma tarde.', rating: '5' },
        { name: 'Carlos R.', text: 'Pedí el servicio a domicilio para mi mamá y fue impecable. Personal muy amable y profesional.', rating: '5' },
        { name: 'Laura M.', text: 'Instalaciones muy limpias y modernas. Me explicaron todo con mucha paciencia. ¡Recomendados!', rating: '5' }
      ]
    },

    prep: {
      visible: true,
      eyebrow: 'Preparación',
      title: '¿Cómo prepararse para sus exámenes?',
      subtitle: 'Siga estas indicaciones para obtener resultados más precisos.',
      image: '',
      imageMode: 'none',
      overlay: 60,
      items: [
        { title: 'Glucosa y perfil lipídico', text: 'Ayuno de 8 a 12 horas. Puede tomar agua. Evite comidas grasas y alcohol la noche anterior.' },
        { title: 'Parcial de orina', text: 'Recoja la primera orina de la mañana, chorro medio, en frasco estéril. Entréguela antes de 2 horas.' },
        { title: 'Coprológico', text: 'Muestra reciente en recipiente limpio y seco. No mezclar con orina. Entregar el mismo día.' },
        { title: 'Pruebas hormonales', text: 'Algunas requieren horario o día específico del ciclo. Consulte con nuestro personal.' }
      ]
    },

    faq: {
      visible: true,
      eyebrow: 'Preguntas frecuentes',
      title: 'Resolvemos sus dudas',
      subtitle: '',
      image: '',
      imageMode: 'none',
      overlay: 60,
      items: [
        { q: '¿Necesito cita previa?', a: 'No es obligatoria. Puede llegar en nuestro horario de atención o agendar por WhatsApp para mayor comodidad.' },
        { q: '¿Cómo consulto mis resultados?', a: 'En la sección "Resultados" ingrese su número de documento y el código que aparece en su comprobante.' },
        { q: '¿Cuánto tardan los resultados?', a: 'La mayoría de exámenes de rutina están listos el mismo día. Pruebas especiales pueden tardar de 2 a 8 días.' },
        { q: '¿Atienden por EPS o prepagada?', a: 'Sí, tenemos convenios con diferentes aseguradoras. Consúltenos para verificar su cobertura.' },
        { q: '¿Qué medios de pago aceptan?', a: 'Efectivo, tarjetas débito y crédito, transferencias y pagos por código QR.' }
      ]
    },

    location: {
      visible: true,
      eyebrow: 'Cómo llegar',
      title: 'Visítenos',
      subtitle: 'Estamos ubicados en una zona de fácil acceso, con parqueadero cercano.',
      mapUrl: '',
      image: '',
      imageMode: 'none',
      overlay: 60,
      items: [
        { day: 'Lunes a viernes', hours: '6:00 a.m. – 6:00 p.m.' },
        { day: 'Sábados', hours: '6:30 a.m. – 1:00 p.m.' },
        { day: 'Domingos y festivos', hours: 'Toma a domicilio con cita' }
      ]
    },

    contact: {
      visible: true,
      eyebrow: 'Contacto',
      title: '¿Tiene preguntas? Estamos para ayudarle',
      subtitle: 'Escríbanos y le responderemos de inmediato por WhatsApp.',
      image: 'https://images.unsplash.com/photo-1581093458791-9f3c3900df4b?auto=format&fit=crop&w=1920&q=80',
      imageMode: 'background',
      overlay: 88
    }
  }
};
