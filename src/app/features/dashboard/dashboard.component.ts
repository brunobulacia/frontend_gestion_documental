import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { 
  Documento, 
  DocumentoVersion, 
  TipoDocumento, 
  Area, 
  Usuario
} from '../../models/documento.model';
import { CommonModule } from '@angular/common';
import { DocumentsService } from '../../core/services/documents.service';

interface DocumentoReciente extends Documento {
  diasDesdeModificacion: number;
}

interface EstadisticaDocumento {
  nombre: string;
  valor: number;
  porcentaje: number;
  color: string;
}

interface ActividadReciente {
  id: string;
  tipo: 'creacion' | 'version' | 'compartido' | 'modificacion';
  titulo: string;
  usuario: Usuario;
  fecha: Date;
  descripcion: string;
  icono: string;
  color: string;
}

@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export default class DashboardComponent implements OnInit {
  // Datos de usuario actual
  currentUser: Usuario = {
    id: 1,
    username: 'admin',
    email: 'admin@example.com',
    rol: 'Administrador'
  };

  // Estadísticas generales
  totalDocumentos: number = 0;
  documentosPublicos: number = 0;
  documentosPrivados: number = 0;
  totalVersiones: number = 0;
  
  // Documentos recientes
  documentosRecientes: DocumentoReciente[] = [];
  
  // Documentos por tipo
  documentosPorTipo: EstadisticaDocumento[] = [];
  
  // Documentos por área
  documentosPorArea: EstadisticaDocumento[] = [];
  
  // Actividad reciente
  actividadReciente: ActividadReciente[] = [];
  
  // Documentos compartidos conmigo
  documentosCompartidos: Documento[] = [];
  
  // Datos de ejemplo
  tiposDocumento: TipoDocumento[] = [];
  areas: Area[] = [];
  documentos: Documento[] = [];
  usuarios: Usuario[] = [];
  
  // Colores para gráficos
  colores: string[] = [
    'var(--color-primary)',
    'var(--color-secondary)',
    'var(--color-success)',
    'var(--color-warning)',
    'var(--color-info)'
  ];

  constructor(private router: Router, private docsService: DocumentsService) { }

  ngOnInit(): void {
    this.cargarDatosEjemplo();
    this.calcularEstadisticas();
    this.prepararDocumentosRecientes();
    this.prepararDocumentosPorTipo();
    this.prepararDocumentosPorArea();
    this.prepararActividadReciente();
    this.prepararDocumentosCompartidos();
    this.fetchData();
  }

  // Cargar datos de ejemplo
  cargarDatosEjemplo(): void {
    // Tipos de documento
    this.tiposDocumento = [
      { id: 1, nombre: 'Contrato' },
      { id: 2, nombre: 'Factura' },
      { id: 3, nombre: 'Informe' },
      { id: 4, nombre: 'Solicitud' },
      { id: 5, nombre: 'Manual' }
    ];

    // Áreas
    this.areas = [
      { id: 1, nombre: 'Recursos Humanos' },
      { id: 2, nombre: 'Finanzas' },
      { id: 3, nombre: 'Operaciones' },
      { id: 4, nombre: 'Marketing' },
      { id: 5, nombre: 'Legal' }
    ];

    // Usuarios
    this.usuarios = [
      { id: 1, username: 'admin', email: 'admin@example.com', rol: 'Administrador' },
      { id: 2, username: 'juan', email: 'juan@example.com', rol: 'Editor' },
      { id: 3, username: 'maria', email: 'maria@example.com', rol: 'Lector' },
      { id: 4, username: 'carlos', email: 'carlos@example.com', rol: 'Editor' }
    ];

    // Documentos de ejemplo
    this.documentos = [
      {
        id: '550e8400-e29b-41d4-a716-446655440000',
        titulo: 'Contrato de servicios',
        descripcion: 'Contrato de prestación de servicios para el cliente XYZ',
        tipo: this.tiposDocumento[0],
        area: this.areas[4],
        creado_por: this.usuarios[0],
        fecha_creacion: new Date(2023, 4, 15),
        fecha_modificacion: new Date(2023, 4, 20),
        es_publico: false,
        versiones: [
          {
            id: 1,
            documento_id: '550e8400-e29b-41d4-a716-446655440000',
            archivo: '/documentos/legal/contrato/contrato_servicios_v2.pdf',
            version: 2,
            subido_por: this.usuarios[0],
            fecha_subida: new Date(2023, 4, 20),
            comentarios: 'Versión final revisada por el departamento legal',
            nombre_archivo: 'contrato_servicios_v2.pdf'
          },
          {
            id: 2,
            documento_id: '550e8400-e29b-41d4-a716-446655440000',
            archivo: '/documentos/legal/contrato/contrato_servicios_v1.pdf',
            version: 1,
            subido_por: this.usuarios[1],
            fecha_subida: new Date(2023, 4, 15),
            comentarios: 'Versión inicial',
            nombre_archivo: 'contrato_servicios_v1.pdf'
          }
        ],
        metadatos: [
          { id: 1, documento_id: '550e8400-e29b-41d4-a716-446655440000', clave: 'Cliente', valor: 'Empresa XYZ' },
          { id: 2, documento_id: '550e8400-e29b-41d4-a716-446655440000', clave: 'Valor', valor: '$5,000' }
        ],
        permisos: [
          { 
            id: 1, 
            documento_id: '550e8400-e29b-41d4-a716-446655440000', 
            usuario: this.usuarios[0], 
            puede_ver: true, 
            puede_editar: true,
            puede_descargar: true,
            puede_eliminar: true
          },
          { 
            id: 2, 
            documento_id: '550e8400-e29b-41d4-a716-446655440000', 
            usuario: this.usuarios[1], 
            puede_ver: true, 
            puede_editar: true,
            puede_descargar: true,
            puede_eliminar: false
          }
        ]
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440001',
        titulo: 'Factura #2023-056',
        descripcion: 'Factura por servicios prestados en mayo 2023',
        tipo: this.tiposDocumento[1],
        area: this.areas[1],
        creado_por: this.usuarios[1],
        fecha_creacion: new Date(2023, 5, 1),
        fecha_modificacion: new Date(2023, 5, 1),
        es_publico: false,
        versiones: [
          {
            id: 3,
            documento_id: '550e8400-e29b-41d4-a716-446655440001',
            archivo: '/documentos/finanzas/factura/factura_2023_056.pdf',
            version: 1,
            subido_por: this.usuarios[1],
            fecha_subida: new Date(2023, 5, 1),
            comentarios: 'Factura emitida',
            nombre_archivo: 'factura_2023_056.pdf'
          }
        ],
        metadatos: [
          { id: 3, documento_id: '550e8400-e29b-41d4-a716-446655440001', clave: 'Monto', valor: '$1,200' },
          { id: 4, documento_id: '550e8400-e29b-41d4-a716-446655440001', clave: 'Estado', valor: 'Pendiente' }
        ]
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440002',
        titulo: 'Informe trimestral Q2',
        descripcion: 'Informe de resultados del segundo trimestre',
        tipo: this.tiposDocumento[2],
        area: this.areas[2],
        creado_por: this.usuarios[2],
        fecha_creacion: new Date(2023, 5, 10),
        fecha_modificacion: new Date(2023, 5, 12),
        es_publico: true,
        versiones: [
          {
            id: 4,
            documento_id: '550e8400-e29b-41d4-a716-446655440002',
            archivo: '/documentos/operaciones/informe/informe_q2_v2.pdf',
            version: 2,
            subido_por: this.usuarios[2],
            fecha_subida: new Date(2023, 5, 12),
            comentarios: 'Versión corregida con datos actualizados',
            nombre_archivo: 'informe_q2_v2.pdf'
          },
          {
            id: 5,
            documento_id: '550e8400-e29b-41d4-a716-446655440002',
            archivo: '/documentos/operaciones/informe/informe_q2_v1.pdf',
            version: 1,
            subido_por: this.usuarios[2],
            fecha_subida: new Date(2023, 5, 10),
            comentarios: 'Versión inicial',
            nombre_archivo: 'informe_q2_v1.pdf'
          }
        ]
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440003',
        titulo: 'Manual de procedimientos',
        descripcion: 'Manual de procedimientos internos actualizado',
        tipo: this.tiposDocumento[4],
        area: this.areas[0],
        creado_por: this.usuarios[0],
        fecha_creacion: new Date(2023, 3, 5),
        fecha_modificacion: new Date(2023, 3, 5),
        es_publico: true,
        versiones: [
          {
            id: 6,
            documento_id: '550e8400-e29b-41d4-a716-446655440003',
            archivo: '/documentos/rrhh/manual/manual_procedimientos.pdf',
            version: 1,
            subido_por: this.usuarios[0],
            fecha_subida: new Date(2023, 3, 5),
            comentarios: 'Versión inicial del manual',
            nombre_archivo: 'manual_procedimientos.pdf'
          }
        ]
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440004',
        titulo: 'Solicitud de vacaciones',
        descripcion: 'Formulario de solicitud de vacaciones',
        tipo: this.tiposDocumento[3],
        area: this.areas[0],
        creado_por: this.usuarios[3],
        fecha_creacion: new Date(2023, 5, 20),
        fecha_modificacion: new Date(2023, 5, 20),
        es_publico: true,
        versiones: [
          {
            id: 7,
            documento_id: '550e8400-e29b-41d4-a716-446655440004',
            archivo: '/documentos/rrhh/solicitud/solicitud_vacaciones.pdf',
            version: 1,
            subido_por: this.usuarios[3],
            fecha_subida: new Date(2023, 5, 20),
            comentarios: 'Formulario estándar',
            nombre_archivo: 'solicitud_vacaciones.pdf'
          }
        ]
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440005',
        titulo: 'Plan de marketing 2023',
        descripcion: 'Plan estratégico de marketing para el año 2023',
        tipo: this.tiposDocumento[2],
        area: this.areas[3],
        creado_por: this.usuarios[1],
        fecha_creacion: new Date(2023, 0, 15),
        fecha_modificacion: new Date(2023, 2, 10),
        es_publico: false,
        versiones: [
          {
            id: 8,
            documento_id: '550e8400-e29b-41d4-a716-446655440005',
            archivo: '/documentos/marketing/informe/plan_marketing_v3.pdf',
            version: 3,
            subido_por: this.usuarios[1],
            fecha_subida: new Date(2023, 2, 10),
            comentarios: 'Versión final aprobada',
            nombre_archivo: 'plan_marketing_v3.pdf'
          },
          {
            id: 9,
            documento_id: '550e8400-e29b-41d4-a716-446655440005',
            archivo: '/documentos/marketing/informe/plan_marketing_v2.pdf',
            version: 2,
            subido_por: this.usuarios[1],
            fecha_subida: new Date(2023, 1, 20),
            comentarios: 'Revisión con comentarios de dirección',
            nombre_archivo: 'plan_marketing_v2.pdf'
          },
          {
            id: 10,
            documento_id: '550e8400-e29b-41d4-a716-446655440005',
            archivo: '/documentos/marketing/informe/plan_marketing_v1.pdf',
            version: 1,
            subido_por: this.usuarios[1],
            fecha_subida: new Date(2023, 0, 15),
            comentarios: 'Borrador inicial',
            nombre_archivo: 'plan_marketing_v1.pdf'
          }
        ],
        permisos: [
          { 
            id: 3, 
            documento_id: '550e8400-e29b-41d4-a716-446655440005', 
            usuario: this.currentUser, 
            puede_ver: true, 
            puede_editar: false,
            puede_descargar: true,
            puede_eliminar: false
          }
        ]
      }
    ];
  }

  fetchData() {
    this.docsService.getData().subscribe({
      next: (res) => {
        console.log(res);
        this.documentos = res.documentos;
        this.tiposDocumento = res.tipos_documento;
        this.areas = res.areas;
        this.calcularEstadisticas();
        this.prepararDocumentosRecientes();
        this.prepararDocumentosPorTipo();
        this.prepararDocumentosPorArea();
        this.prepararActividadReciente();
        this.prepararDocumentosCompartidos();
      }
    })
  }
  // Calcular estadísticas generales
  calcularEstadisticas(): void {
    this.totalDocumentos = this.documentos.length;
    this.documentosPublicos = this.documentos.filter(doc => doc.es_publico).length;
    this.documentosPrivados = this.totalDocumentos - this.documentosPublicos;
    
    // Calcular total de versiones
    this.totalVersiones = this.documentos.reduce((total, doc) => {
      return total + (doc.versiones ? doc.versiones.length : 0);
    }, 0);
  }

  // Preparar documentos recientes
  prepararDocumentosRecientes(): void {
    // Ordenar documentos por fecha de modificación (más recientes primero)
    const documentosOrdenados = [...this.documentos].sort((a, b) => 
      b.fecha_modificacion.getTime() - a.fecha_modificacion.getTime()
    );
    
    // Tomar los 5 más recientes
    const recientes = documentosOrdenados.slice(0, 5);
    
    // Calcular días desde la modificación
    const hoy = new Date();
    this.documentosRecientes = recientes.map(doc => {
      const diasDesdeModificacion = Math.floor((hoy.getTime() - doc.fecha_modificacion.getTime()) / (1000 * 60 * 60 * 24));
      return {
        ...doc,
        diasDesdeModificacion
      };
    });
  }

  // Preparar estadísticas de documentos por tipo
  prepararDocumentosPorTipo(): void {
    // Contar documentos por tipo
    const conteo: { [key: string]: number } = {};
    this.documentos.forEach(doc => {
      if (doc.tipo) {
        const tipoNombre = doc.tipo.nombre;
        conteo[tipoNombre] = (conteo[tipoNombre] || 0) + 1;
      }
    });
    
    // Convertir a array para mostrar en gráfico
    const items = Object.keys(conteo).map((nombre, index) => {
      return {
        nombre,
        valor: conteo[nombre],
        porcentaje: (conteo[nombre] / this.totalDocumentos) * 100,
        color: this.colores[index % this.colores.length]
      };
    });
    
    // Ordenar de mayor a menor
    this.documentosPorTipo = items.sort((a, b) => b.valor - a.valor);
  }

  // Preparar estadísticas de documentos por área
  prepararDocumentosPorArea(): void {
    // Contar documentos por área
    const conteo: { [key: string]: number } = {};
    this.documentos.forEach(doc => {
      if (doc.area) {
        const areaNombre = doc.area.nombre;
        conteo[areaNombre] = (conteo[areaNombre] || 0) + 1;
      }
    });
    
    // Convertir a array para mostrar en gráfico
    const items = Object.keys(conteo).map((nombre, index) => {
      return {
        nombre,
        valor: conteo[nombre],
        porcentaje: (conteo[nombre] / this.totalDocumentos) * 100,
        color: this.colores[index % this.colores.length]
      };
    });
    
    // Ordenar de mayor a menor
    this.documentosPorArea = items.sort((a, b) => b.valor - a.valor);
  }

  // Preparar actividad reciente
  prepararActividadReciente(): void {
    const actividades: ActividadReciente[] = [];
    
    // Agregar creaciones de documentos recientes
    this.documentos.forEach(doc => {
      actividades.push({
        id: `creacion-${doc.id}`,
        tipo: 'creacion',
        titulo: doc.titulo,
        usuario: doc.creado_por,
        fecha: doc.fecha_creacion,
        descripcion: `${doc.creado_por.username} creó el documento "${doc.titulo}"`,
        icono: 'fa-file',
        color: 'var(--color-primary)'
      });
      
      // Agregar versiones recientes
      if (doc.versiones) {
        doc.versiones.forEach(version => {
          if (version.version > 1) { // Solo para versiones posteriores a la inicial
            actividades.push({
              id: `version-${version.id}`,
              tipo: 'version',
              titulo: doc.titulo,
              usuario: version.subido_por,
              fecha: version.fecha_subida,
              descripcion: `${version.subido_por.username} subió la versión ${version.version} de "${doc.titulo}"`,
              icono: 'fa-code-branch',
              color: 'var(--color-info)'
            });
          }
        });
      }
      
      // Agregar documentos compartidos
      if (doc.permisos) {
        doc.permisos.forEach(permiso => {
          if (permiso.usuario.id !== doc.creado_por.id) {
            actividades.push({
              id: `compartido-${doc.id}-${permiso.usuario.id}`,
              tipo: 'compartido',
              titulo: doc.titulo,
              usuario: doc.creado_por,
              fecha: doc.fecha_modificacion, // Aproximación
              descripcion: `${doc.creado_por.username} compartió "${doc.titulo}" con ${permiso.usuario.username}`,
              icono: 'fa-share-alt',
              color: 'var(--color-success)'
            });
          }
        });
      }
    });
    
    // Ordenar por fecha (más recientes primero)
    actividades.sort((a, b) => b.fecha.getTime() - a.fecha.getTime());
    
    // Tomar las 10 actividades más recientes
    this.actividadReciente = actividades.slice(0, 10);
  }

  // Preparar documentos compartidos conmigo
  prepararDocumentosCompartidos(): void {
    // Filtrar documentos que han sido compartidos con el usuario actual
    this.documentosCompartidos = this.documentos.filter(doc => {
      // Si el usuario es el creador, no se considera "compartido"
      if (doc.creado_por.id === this.currentUser.id) {
        return false;
      }
      
      // Si el documento es público, se considera compartido
      if (doc.es_publico) {
        return true;
      }
      
      // Verificar si hay un permiso específico para el usuario
      if (doc.permisos) {
        return doc.permisos.some(permiso => 
          permiso.usuario.id === this.currentUser.id && permiso.puede_ver
        );
      }
      
      return false;
    });
  }

  // Navegar a la página de documentos
  irADocumentos(): void {
    this.router.navigate(['/documents']);
  }

  // Navegar a la página de creación de documentos
  crearDocumento(): void {
    this.router.navigate(['/documents'], { queryParams: { action: 'create' } });
  }

  // Formatear fecha relativa
  formatearFechaRelativa(fecha: Date): string {
    const ahora = new Date();
    const diferencia = ahora.getTime() - fecha.getTime();
    
    const segundos = Math.floor(diferencia / 1000);
    const minutos = Math.floor(segundos / 60);
    const horas = Math.floor(minutos / 60);
    const dias = Math.floor(horas / 24);
    
    if (dias > 0) {
      return dias === 1 ? 'Ayer' : `Hace ${dias} días`;
    } else if (horas > 0) {
      return `Hace ${horas} ${horas === 1 ? 'hora' : 'horas'}`;
    } else if (minutos > 0) {
      return `Hace ${minutos} ${minutos === 1 ? 'minuto' : 'minutos'}`;
    } else {
      return 'Hace unos segundos';
    }
  }
}